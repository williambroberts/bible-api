const request = require("supertest")
import app from "./app"

describe('server test',()=>{
    describe('GET / public',()=>{
        it("returns 200 status response",async()=>{
            const response = await request(app).get("/")
            expect(response.status).toBe(200)
            expect(response.headers['content-type']).toEqual(expect.stringContaining('json'))

        })
        it('returns json response',async()=>{
            const response = await request(app).get("/")
            expect(response.body).toBe(expect.stringContaining('json'))
        })
    })
    
})