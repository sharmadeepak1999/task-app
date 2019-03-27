const sgMail = require("@sendgrid/mail")

sgMail.setApiKey(process.env.SENDGRID_API_KEY)

const sendWelcomeEmail = (email, name) => {
	sgMail.send({
		to: email,
		from: "sharmadeepak1999@gmail.com",
		subject: "Thanks for joining in!",
		text: `Welcome to the task app, ${name}. Let us know how you get along with the app.`
	})
}

const sendGoodbyeEmail = (email, name) => {
	sgMail.send({
		to: email,
		from: "sharmadeepak1999@gmail.com",
		subject: "Thanks for using our service!",
		text:  "Let us know why you unsubscribed from our app."
	})
}

module.exports = {
	sendWelcomeEmail,
	sendGoodbyeEmail
}