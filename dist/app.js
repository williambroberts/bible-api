"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const mysql2 = require("mysql2");
const ash = require("express-async-handler");
const dotenv = require("dotenv");
dotenv.config();
const app = express();
const remote = mysql2.createPool(process.env.DATABASE_URL).promise();
const chaptersJson = require("../chapters.json");
const shortnames = require("../shortnames.json");
const asvs = require("../asvs.json");
app.get("/", ash((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.json({ success: "hi will🕊️" });
})));
app.get("/books", ash((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const [data] = yield remote.query(`
    select * from bible_chapters
    `);
    res.json({ data });
})));
app.get("/books/:bookid", ash((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let bookid = req.params.bookid;
    //todo if no id / not number / out of range
    const [data] = yield remote.query(`select * from bible_chapters
        where id = ?
        
        `, [bookid]);
    res.json({ data });
})));
app.get("/books/:bookid/chapters", ash((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let bookid = req.params.bookid;
    //todo if no book id / not number / out of range
    const [data] = yield remote.query(`
    select distinct chapter,count(verse) as count from bible_verses_asvs
    where book = ?
    group by chapter
    `, [bookid]);
    res.json({ data });
})));
app.get("/books/:bookid/chapters/:chapterid", ash((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let { bookid, chapterid } = req.params;
    //todo if no id, not number/ out of range
    const [data] = yield remote.query(`select distinct chapter,count(verse) as count from bible_verses_asvs
        where book = ? and chapter = ?
        group by chapter
        `, [bookid, chapterid]);
    res.json({ data });
})));
app.get("/books/:bookid/chapters/:chapterid/verses", ash((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let { bookid, chapterid } = req.params;
    //todo if no ids, out of range/ not numbers
    const [data] = yield remote.query(`select distinct * from bible_verses_asvs
        where book = ? 
        and chapter = ?
        order by id asc
        `, [bookid, chapterid]);
    res.json({ data });
})));
app.get("/books/:bookid/chapters/:chapterid/verses/:verseid", ash((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let { bookid, chapterid, verseid } = req.params;
    //todo if no ids, out of range/ not numbers
    const [data] = yield remote.query(`select distinct * from bible_verses_asvs
        where book = ? 
        and chapter = ?
        and verse = ?
       
        `, [bookid, chapterid, verseid]);
    res.json({ data });
})));
app.get("/search", ash((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let { query, offset, limit } = req.params;
    let offsetNum = (Number(offset) || 0);
    let LimitNum = (Number(limit) || 0);
    let [data] = yield remote.query(`
        SELECT *
        FROM bible_verses_asvs
        WHERE text LIKE ?
        offset = ?
        limit = ?
        `, [`%${query}%`, offsetNum, LimitNum]);
    res.status(200);
    res.json({ number: data.length, data });
})));
app.get("/graph/:id", ash((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let word = req.params.id;
    let [data] = yield remote.query(`
        select distinct count(*) as occurances, book
        from bible_verses_asvs
        where text like ?
        group by book
    `, [`%${word}%`]);
    res.json({ length: data.length, data });
})));
app.get("/greek/:id", ash((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let number = req.params.id;
    number = number.toUpperCase();
    let [data] = yield remote.query(`
    select distinct * from greek_strongs
    where number = ?
    `, [number]);
    res.json({ data });
})));
app.get("/hebrew/:id", ash((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let number = req.params.id;
    number = number.toUpperCase();
    let [data] = yield remote.query(`
    select distinct * from hebrew_strongs
    where number = ?
    `, [number]);
    res.json({ data });
})));
exports.default = app;
