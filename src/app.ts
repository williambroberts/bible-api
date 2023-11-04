import { Request,Response } from "express"
import cors from "cors"
import express from "express"

import ash from "express-async-handler"
import dotenv from "dotenv"
import pool from "./db/config"
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
    //todo if no id / not number / out of range
    const [data]=await pool.query(
        `select * from bible_chapters
        where id = ?
        
        `,[bookid]
    )
    res.json({data})
}))

app.get("/books/:bookid/chapters",ash(async(req:Request,res:Response)=>{
    let bookid  = req.params.bookid
    //todo if no book id / not number / out of range
    const [data]= await pool.query(`
    select distinct chapter,count(verse) as count from bible_verses_asvs
    where book = ?
    group by chapter
    `,[bookid])
    res.json({data})
}))

app.get("/books/:bookid/chapters/:chapterid",ash(async(req:Request,res:Response)=>{
    let {bookid,chapterid}=req.params
    //todo if no id, not number/ out of range
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
    //todo if no ids, out of range/ not numbers
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
    //todo handle errors
    const [data]=await pool.query(`
    select distinct count(*) as count from bible_verses_asvs
    where text like ?

    `,[`%${query}%`])
    res.json({data})

})) 

app.get("/books/:bookid/chapters/:chapterid/verses/:verseid",ash(async(req:Request,res:Response)=>{
    let {bookid,chapterid,verseid}= req.params
    //todo if no ids, out of range/ not numbers
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
app.get("/graph/:id",ash(async(req:Request,res:Response)=>{
    let word = req.params.id
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

app.get("/chapterverses/:bookid",(req,res)=>{
    let book = req.params.bookid
    //todo no bookid 400
    let [data]  = pool.query(`select distinct * from chapter_verses
    where book = ?
    `,[book])
    res.json({data})
})

app.get("/chapterverses/:bookid/chapter/:chapterid",(req,res)=>{
    let book = req.params.bookid
    let chapter = req.params.chapterid
    //todo params 400
    let [data]= pool.query(`select distinct * from chapter_verses
    where book = ?
    and chapter = ?
    `,[book,chapter])
    res.json({data})
})

    return app
}
export default createApp