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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cors_1 = __importDefault(require("cors"));
const express_1 = __importDefault(require("express"));
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const dotenv_1 = __importDefault(require("dotenv"));
const config_1 = __importDefault(require("./db/config"));
dotenv_1.default.config();
const versesJSon = require("../../bible/verses.json");
function createApp() {
    const app = (0, express_1.default)();
    app.use((0, cors_1.default)({
        origin: ['http://localhost:3000'],
        credentials: true
    }));
    app.get("/", (0, express_async_handler_1.default)((req, res) => __awaiter(this, void 0, void 0, function* () {
        res.json({ success: "hi will🕊️" });
    })));
    app.get("/books", (0, express_async_handler_1.default)((req, res) => __awaiter(this, void 0, void 0, function* () {
        const [data] = yield config_1.default.query(`
    select * from bible_chapters
    `);
        res.json({ data });
    })));
    app.get("/books/:bookid", (0, express_async_handler_1.default)((req, res) => __awaiter(this, void 0, void 0, function* () {
        let bookid = req.params.bookid;
        //todo if no id / not number / out of range
        const [data] = yield config_1.default.query(`select * from bible_chapters
        where id = ?
        
        `, [bookid]);
        res.json({ data });
    })));
    app.get("/books/:bookid/chapters", (0, express_async_handler_1.default)((req, res) => __awaiter(this, void 0, void 0, function* () {
        let bookid = req.params.bookid;
        //todo if no book id / not number / out of range
        const [data] = yield config_1.default.query(`
    select distinct chapter,count(verse) as count from bible_verses_asvs
    where book = ?
    group by chapter
    `, [bookid]);
        res.json({ data });
    })));
    app.get("/books/:bookid/chapters/:chapterid", (0, express_async_handler_1.default)((req, res) => __awaiter(this, void 0, void 0, function* () {
        let { bookid, chapterid } = req.params;
        //todo if no id, not number/ out of range
        const [data] = yield config_1.default.query(`select distinct chapter,count(verse) as count from bible_verses_asvs
        where book = ? and chapter = ?
        group by chapter
        `, [bookid, chapterid]);
        res.json({ data });
    })));
    app.get("/books/:bookid/chapters/:chapterid/verses", (0, express_async_handler_1.default)((req, res) => __awaiter(this, void 0, void 0, function* () {
        let { bookid, chapterid } = req.params;
        //todo if no ids, out of range/ not numbers
        const [data] = yield config_1.default.query(`select distinct * from bible_verses_asvs
        where book = ? 
        and chapter = ?
        order by id asc
        `, [bookid, chapterid]);
        res.json({ data });
    })));
    app.get("/occurances/:word", (0, express_async_handler_1.default)((req, res) => __awaiter(this, void 0, void 0, function* () {
        let query = req.params.word;
        //todo handle errors
        const [data] = yield config_1.default.query(`
    select distinct count(*) as count from bible_verses_asvs
    where text like ?

    `, [`%${query}%`]);
        res.json({ data });
    })));
    app.get("/books/:bookid/chapters/:chapterid/verses/:verseid", (0, express_async_handler_1.default)((req, res) => __awaiter(this, void 0, void 0, function* () {
        let { bookid, chapterid, verseid } = req.params;
        //todo if no ids, out of range/ not numbers
        const [data] = yield config_1.default.query(`select distinct * from bible_verses_asvs
        where book = ? 
        and chapter = ?
        and verse = ?
       
        `, [bookid, chapterid, verseid]);
        res.json({ data });
    })));
    app.get("/search", (0, express_async_handler_1.default)((req, res) => __awaiter(this, void 0, void 0, function* () {
        let { query, offset, limit } = req.params;
        let offsetNum = (Number(offset) || 0);
        let LimitNum = (Number(limit) || 0);
        let [data] = yield config_1.default.query(`
        SELECT distinct *
        FROM bible_verses_asvs
        WHERE text LIKE ?
        offset = ?
        limit = ?
        `, [`%${query}%`, offsetNum, LimitNum]);
        res.status(200);
        res.json({ number: data.length, data });
    })));
    app.get("/graph/:id", (0, express_async_handler_1.default)((req, res) => __awaiter(this, void 0, void 0, function* () {
        let word = req.params.id;
        let [data] = yield config_1.default.query(`
        select distinct count(*) as occurances, book
        from bible_verses_asvs
        where text like ?
        group by book
    `, [`%${word}%`]);
        res.json({ length: data.length, data });
    })));
    app.get("/greek/:id", (0, express_async_handler_1.default)((req, res) => __awaiter(this, void 0, void 0, function* () {
        let number = req.params.id;
        number = number.toUpperCase();
        let [data] = yield config_1.default.query(`
    select distinct * from greek_strongs
    where number = ?
    `, [number]);
        res.json({ data });
    })));
    app.get("/hebrew/:id", (0, express_async_handler_1.default)((req, res) => __awaiter(this, void 0, void 0, function* () {
        let number = req.params.id;
        number = number.toUpperCase();
        let [data] = yield config_1.default.query(`
    select distinct * from hebrew_strongs
    where number = ?
    `, [number]);
        res.json({ data });
    })));
    app.get("/strong/:id", (0, express_async_handler_1.default)((req, res) => __awaiter(this, void 0, void 0, function* () {
        let number = req.params.id;
        let heb = /H/i;
        let isHeb = heb.test(number.charAt(0));
        number = number.toUpperCase();
        if (isHeb) {
            let [data] = yield config_1.default.query(`
        select distinct * from hebrew_strongs
        where number = ?
        `, [number]);
            res.json({ data });
        }
        else {
            let [data] = yield config_1.default.query(`
        select distinct * from greek_strongs
        where number = ?
        `, [number]);
            res.json({ data });
        }
    })));
    app.get("/chapterverses/:bookid", (req, res) => {
        let book = req.params.bookid;
        //todo no bookid 400
        let [data] = config_1.default.query(`select distinct * from chapter_verses
    where book = ?
    `, [book]);
        res.json({ data });
    });
    app.get("/chapterverses/:bookid/chapter/:chapterid", (req, res) => {
        let book = req.params.bookid;
        let chapter = req.params.chapterid;
        //todo params 400
        let [data] = config_1.default.query(`select distinct * from chapter_verses
    where book = ?
    and chapter = ?
    `, [book, chapter]);
        res.json({ data });
    });
    return app;
}
exports.default = createApp;
