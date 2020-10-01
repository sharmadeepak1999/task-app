const express = require("express")
const sharp = require("sharp")
const { sendWelcomeEmail, sendGoodbyeEmail } = require("../emails/account")
const auth = require("../middleware/auth")
const User = require("../models/userModel")

const multer = require("multer")
const upload = multer({
	limits: {
		fileSize: 1000000
	},
	fileFilter (req, file, cb) {
		if(!file.originalname.match(/\.(jpg|jpeg|png)$/)){
			return cb(new Error("Please upload an image file! Allowed jpg|jpeg|png"))
		}

		cb(undefined, true)
	}
})

const router = new express.Router()

router.get("/users/me", auth, async (req, res) => {
	res.send(req.user)
})

router.post("/users/login", async (req, res) => {
	try {
		const user = await User.authenticate(req.body.email, req.body.password)

		const token = await user.generateAuthToken()

		res.status(200).send({user, token})
	} catch(e) {
		res.status(400).send(e)
	}
})

router.post("/users/logout", auth, async(req, res) => {
	try {
		req.user.tokens = req.user.tokens.filter((token) => {
			return req.token !== token.token
		})

		await req.user.save()

		res.send()
	} catch(e) {
		res.status(500).send()
	}
})

router.post("/users", async (req, res) => {
	try {
		const user = new User(req.body)

		const token = await user.generateAuthToken()

		sendWelcomeEmail(user.email, user.name)

		res.status(201).send({user, token})
	} catch(e) {
		res.status(400).send(e)
	}
})


router.patch("/users/me", auth, async (req, res) => {
	try{
		const _id = req.user._id
		const updates = Object.keys(req.body)
		const allowedUpdates = ["name", "email", "age", "password"]

		const isValidUpdation = updates.every((update) => allowedUpdates.includes(update))

		if(!isValidUpdation) {
			return res.status(400).send({ error: "Invalid fields in updation object!"})
		}

		updates.forEach((update) => {
			req.user[update] = req.body[update]
		})

		await req.user.save()

		res.send(req.user)
	} catch(e) {
		res.status(400).send(e)
	}
})

router.delete("/users/me", auth, async (req, res) => {
	try{
		await req.user.remove()

		sendGoodbyeEmail(req.user.email, req.user.name)

		res.send(req.user)
	} catch(e) {
		res.status(400).send(e)
	}
})	

router.post("/users/me/avatar", auth, upload.single("avatar"), async (req, res) => {
	const buffer = await sharp(req.file.buffer).resize({ width: 250, height: 250}).png().toBuffer()
	req.user.avatar = buffer
	await req.user.save()	
	res.send()
}, (error, req, res, next) => {
	res.status(400).send({ error: error.message })
})

router.get("/users/:id/avatar", async (req, res) => {
	try {
		const user = await User.findById(req.params.id)

		if(!user || !user.avatar){
			throw new Error()
		}

		res.set("Content-Type", "image/jpg")
		res.send(user.avatar)
	} catch(e) {
		res.status(404).send()
	}
})

router.delete("/users/me/avatar", auth, async (req, res) => {
	req.user.avatar = undefined
	await req.user.save()	
	res.send()
}, (error, req, res, next) => {
	res.status(400).send({ error: error.message })
})

module.exports = router
