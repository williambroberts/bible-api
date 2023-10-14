const express = require("express")
const mysql2 = require("mysql2")
const ash = require("express-async-handler")
const dotenv = require("dotenv")
dotenv.config()
const app = express()
const remote = mysql2.createPool(process.env.DATABASE_URL).promise()
const chaptersJson = require("./chapters.json")
const shortnames = require("./shortnames.json")
const asvs = require("./asvs.json")
app.get("/",ash(async(req,res)=>{
    // console.log(asvs.verses[0])
    // let start = 30840
    // for (let i=start; i<start+2000;i++){
    //     let {book,chapter,verse,text,book_name}=asvs.verses[i]
    //     let [data]=await remote.query(`
    //         insert into bible_verses_asvs (book,chapter,verse,text,book_name)
    //         values (?,?,?,?,?)
    //     `,[book,chapter,verse,text,book_name])
        
    // }
    res.json({success:"hi will🕊️"})
}))

app.get("/books",ash(async(req,res)=>{

    const [data] = await remote.query(`
    select * from bible_chapters
    `)
   

    res.json({data})
}))
app.get("/books/:bookid",ash(async(req,res)=>{
    let bookid = req.params.bookid
    //todo if no id / not number / out of range
    const [data]=await remote.query(
        `select * from bible_chapters
        where id = ?
        
        `,[bookid]
    )
    res.json({data})
}))

app.get("/books/:bookid/chapters",ash(async(req,res)=>{
    let bookid  = req.params.bookid
    //todo if no book id / not number / out of range
    const [data]= await remote.query(`
    select distinct chapter,count(verse) as count from bible_verses_asvs
    where book = ?
    group by chapter
    `,[bookid])
    res.json({data})
}))

app.get("/books/:bookid/chapters/:chapterid",ash(async(req,res)=>{
    let {bookid,chapterid}=req.params
    //todo if no id, not number/ out of range
    const [data]=await remote.query(
        `select distinct chapter,count(verse) as count from bible_verses_asvs
        where book = ? and chapter = ?
        group by chapter
        `,[bookid,chapterid]
    )
    res.json({data})
}))
app.get("/books/:bookid/chapters/:chapterid/verses",ash(async(req,res)=>{
    let {bookid,chapterid}= req.params
    //todo if no ids, out of range/ not numbers
    const [data]=await remote.query(
        `select distinct * from bible_verses_asvs
        where book = ? 
        and chapter = ?
        order by id asc
        `,[bookid,chapterid]
    )
    res.json({data})
}))
app.get("/books/:bookid/chapters/:chapterid/verses/:verseid",ash(async(req,res)=>{
    let {bookid,chapterid,verseid}= req.params
    //todo if no ids, out of range/ not numbers
    const [data]=await remote.query(
        `select distinct * from bible_verses_asvs
        where book = ? 
        and chapter = ?
        and verse = ?
       
        `,[bookid,chapterid,verseid]
    )
    res.json({data})
}))
app.get("/search",ash(async(req,res)=>{
    let {query,offset,limit} = req.params
    
    let [data] = await remote.query(
        `
        SELECT *
        FROM bible_verses_asvs
        WHERE text LIKE ?
        offset = ?
        limit = ?
        `,[`%${query}%`,offset,limit]
      );
    
    
    res.status(200)
    res.json({number:data.length,data})

}))
app.get("/graph/:id",ash(async(req,res)=>{
    let word = req.params.id
    let [data]= await remote.query(`
        select count(*) as occurances, book
        from bible_verses_asvs
        where text like ?
        group by book
    `,
    [`%${word}%`]
    )
    res.json({length:data.length,data})
}))

app.get("/greek/:id",ash(async(req,res)=>{
    let number = req.params.id
    number = number.toUpperCase()
    let [data]= await remote.query(`
    select distinct * from greek_strongs
    where number = ?
    `,
    [number]
    )
    res.json({data})
}))
app.get("/hebrew/:id",ash(async(req,res)=>{
    let number = req.params.id
    number = number.toUpperCase()
    let [data]= await remote.query(`
    select distinct * from hebrew_strongs
    where number = ?
    `,
    [number]
    )
    res.json({data})
}))
app.listen(5000,()=>{
    console.log(`server is running on port 5000`)
})

