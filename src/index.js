const express = require("express")
require("./db/mongoose.js")
const userRouter = require("./routers/userRouter.js")
const taskRouter = require("./routers/taskRouter.js")

const app = express()
const port = process.env.PORT

app.use(express.json())

app.use(userRouter)
app.use(taskRouter)

app.listen(port, () => {
	console.log(`Server started at port ${port}!`)
})