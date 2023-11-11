import { Request,Response } from "express"
import cors from "cors"
import express from "express"

import ash from "express-async-handler"
import dotenv from "dotenv"
import pool from "./db/config"
import { BadRequestError, NotFoundError } from "./Errors"
import { ErrorHandler } from "./Middleware/ErrorMiddleware"
dotenv.config()
const versesJSon = require("../../bible/verses.json")

function createApp(){


const app = express()

app.use(cors({
    origin:['http://localhost:3000'],
    credentials:true
}))




app.get("/",ash(async(req:Request,res:Response)=>{
   
    res.json({success:"hi will🕊️"})
}))

app.get("/books",ash(async(req:Request,res:Response)=>{
    const [data] = await pool.query(`
    select * from bible_chapters
    `)
   

    res.json({data})
}))
app.get("/books/:bookid",ash(async(req:Request,res:Response)=>{
    let bookid = req.params.bookid
    if (isNaN(+bookid)){
        throw new BadRequestError("Bookid must be an integer")
    }
    const [data]=await pool.query(
        `select * from bible_chapters
        where id = ?
        
        `,[bookid]
    )
    res.json({data})
}))

app.get("/books/:bookid/chapters",ash(async(req:Request,res:Response)=>{
    let bookid  = req.params.bookid//todo if no book id / not number / out of range
    if (isNaN(+bookid)){
        throw new BadRequestError("Bookid must be an integer")
    }
   
    const [data]= await pool.query(`
    select distinct chapter,count(verse) as count from bible_verses_asvs
    where book = ?
    group by chapter
    `,[bookid])
    res.json({data})
}))

app.get("/books/:bookid/chapters/:chapterid",ash(async(req:Request,res:Response)=>{
    let {bookid,chapterid}=req.params
    if (isNaN(+bookid)){
        throw new BadRequestError("Bookid must be an integer")
    }
    if (isNaN(+chapterid)){
        throw new BadRequestError("Chapterid must be an integer")
    }
    const [data]=await pool.query(
        `select distinct chapter,count(verse) as count from bible_verses_asvs
        where book = ? and chapter = ?
        group by chapter
        `,[bookid,chapterid]
    )
    res.json({data})
}))
app.get("/books/:bookid/chapters/:chapterid/verses",ash(async(req:Request,res:Response)=>{
    let {bookid,chapterid}= req.params
    if (isNaN(+bookid)){
        throw new BadRequestError("Bookid must be an integer")
    }
    if (isNaN(+chapterid)){
        throw new BadRequestError("Chapterid must be an integer")
    }
    const [data]=await pool.query(
        `select distinct * from bible_verses_asvs
        where book = ? 
        and chapter = ?
        order by id asc
        `,[bookid,chapterid]
    )
    res.json({data})
}))

app.get("/occurances/:word",ash(async(req:Request,res:Response)=>{
    let query = req.params.word
    const [data]=await pool.query(`
    select distinct count(*) as count from bible_verses_asvs
    where text like ?

    `,[`%${query}%`])
    res.json({data})

})) 

app.get("/books/:bookid/chapters/:chapterid/verses/:verseid",ash(async(req:Request,res:Response)=>{
    let {bookid,chapterid,verseid}= req.params
    if (isNaN(+bookid)){
        throw new BadRequestError("Bookid must be integer")
    }
    if (isNaN(+chapterid)){
        throw new BadRequestError("Bookid must be integer")
    }
    if (isNaN(+verseid)){
        throw new BadRequestError("Bookid must be integer")
    }
    const [data]=await pool.query(
        `select distinct * from bible_verses_asvs
        where book = ? 
        and chapter = ?
        and verse = ?
       
        `,[bookid,chapterid,verseid]
    )
    res.json({data})
}))
app.get("/search",ash(async(req:Request,res:Response)=>{
    let {query,offset,limit} = req.params
    let offsetNum = (Number(offset) || 0)
    let LimitNum = (Number(limit) || 0)
    let [data] = await pool.query(
        `
        SELECT distinct *
        FROM bible_verses_asvs
        WHERE text LIKE ?
        offset = ?
        limit = ?
        `,[`%${query}%`,offsetNum,LimitNum]
      );
    
    
    res.status(200)
    res.json({number:data.length,data})

}))
app.get("/graph/:word",ash(async(req:Request,res:Response)=>{
    let word = req.params.word
    let [data]= await pool.query(`
        select distinct count(*) as occurances, book
        from bible_verses_asvs
        where text like ?
        group by book
    `,
    [`%${word}%`]
    )
    res.json({length:data.length,data})
}))

app.get("/greek/:id",ash(async(req:Request,res:Response)=>{
    let number = req.params.id
    number = number.toUpperCase()
    let [data]= await pool.query(`
    select distinct * from greek_strongs
    where number = ?
    `,
    [number]
    )
    res.json({data})
}))
app.get("/hebrew/:id",ash(async(req:Request,res:Response)=>{
    let number = req.params.id
    number = number.toUpperCase()
    let [data]= await pool.query(`
    select distinct * from hebrew_strongs
    where number = ?
    `,
    [number]
    )
    res.json({data})
}))

app.get("/strong/:id",ash(async(req:Request,res:Response)=>{
    let number = req.params.id
    let heb = /H/i
    let isHeb = heb.test(number.charAt(0))
    
    number = number.toUpperCase()
    if (isHeb){
        let [data]= await pool.query(`
        select distinct * from hebrew_strongs
        where number = ?
        `,
        [number]
        )
        res.json({data})
    }else{
        let [data]= await pool.query(`
        select distinct * from greek_strongs
        where number = ?
        `,
        [number]
        )
        res.json({data})
    }
   
    
}))

app.get("/chapterverses/:bookid",ash(async(req,res)=>{
    let book = req.params.bookid
    
    if (isNaN(+book)){
        throw new BadRequestError("Book Id is required, range 1-66")
    }
    let data =await  pool.query(`select distinct * from chapter_verses
    where book = ?
    `,[book])
    res.json({data})
}))

app.get("/chapterverses/:bookid/chapter/:chapterid",ash(async(req,res)=>{
    let book = req.params.bookid
    let chapter = req.params.chapterid
    if (isNaN(+book)){
        throw new BadRequestError("Book Id is required, range 1-66")
    }
    if (isNaN(+chapter)){
        throw new BadRequestError("Chapter Id is required")
    }
    let [data]=await  pool.query(`select distinct * from chapter_verses
    where book = ?
    and chapter = ?
    `,[book,chapter])
    res.json({data})
}))

app.use("*",(req,res)=>{
    throw new NotFoundError();
    //res.status(404).send("404 will")
})

app.use(ErrorHandler)
    return app
}
export default createApp