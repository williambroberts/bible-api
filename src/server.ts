import createApp from "./app"
const app = createApp()
app.listen(5000,()=>{
    console.log(`server is running on port 5000`)
})