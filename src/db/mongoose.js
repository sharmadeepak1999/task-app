const mongoose = require("mongoose")
const validator = require("validator")

console.log(process.env.SENDGRID_API_KEY)
mongoose.connect(process.env.MONGODB_URL, {
	useNewUrlParser: true,
	useCreateIndex: true,
	useFindAndModify: false
})
