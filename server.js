const express = require("express")
const mysql2 = require("mysql2")
const ash = require("express-async-handler")
const dotenv = require("dotenv")
dotenv.config()
const app = express()
const remote = mysql2.createPool(process.env.DATABASE_URL).promise()


app.get("/",(req,res)=>{
    res.json({success:"hi will🕊️"})
})


app.get("/word/:id",ash(async(req,res)=>{
    let word = req.params.id

    let [data] = await remote.query(
        `
        SELECT *
        FROM bible_verses_asvs
        WHERE text LIKE ?
        
        `,[`%${word}%`]
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

