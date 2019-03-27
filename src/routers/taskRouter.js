const express = require("express")
const auth = require("../middleware/auth.js")
const Task = require("../models/taskModel.js")

const router = new express.Router()

router.get("/tasks", auth, async (req, res) => {
	const match = {}
	const sort = {}

	if(req.query.completed){
		match.completed = req.query.completed === "true"
	}

	if(req.query.sortBy){
		const parts = req.query.sortBy.split(":")
		sort[parts[0]] = parts[1] === "desc" ? -1 : 1
	}

	try {
		// const tasks = await Task.find({owner: req.user._id})
		 await req.user.populate({
		 	path: "tasks",
		 	match,
		 	options: {
		 		limit: parseInt(req.query.limit),
		 		skip: parseInt(req.query.skip),
		 		sort
		 	}
		 }).execPopulate()
		res.send(req.user.tasks)
	} catch(e) {
		res.status(500).send(e)
	}
})

router.get("/tasks/:id", auth, async (req, res) => {
	try {
		const _id = req.params.id
		const task = await Task.findOne({ _id, owner: req.user._id})
		console.log(task)
		if(!task){
			return res.status(404).send()
		}
		res.send(task)
	} catch(e) {
		res.status(500).send(e)
	}
})

router.post("/tasks", auth, async (req, res) => {
	try {
		const task = new Task({
			...req.body,
			owner: req.user._id
		})
		await task.save()
		res.status(201).send(task)
	} catch(e) {
		res.status(400).send(e)
	}
})

router.patch("/tasks/:id", auth, async (req, res) => {
	try {
		const _id = req.params.id
		const updates = Object.keys(req.body)
		const allowedUpdates = ["description", "completed"]

		const isValidUpdation = updates.every((update) => allowedUpdates.includes(update))

		if(!isValidUpdation) {
			return res.status(400).send({ error: "Invalid fields in updation object!"})
		}

		const task = await Task.findOne({_id, owner: req.user._id})

		if(!task){
			return res.status(404).send({ error: "Task not found!"})
		}

		updates.forEach((update) => {
			task[update] = req.body[update]
		})

		await task.save()

		res.send(task)
	} catch(e) {
		res.status(400).send(e)
	}
})

router.delete("/tasks/:id", auth, async (req, res) => {
	try {
		const _id = req.params.id
		const task = await Task.findOneAndDelete({_id, owner: req.user._id})

		if(!task){
			return res.status(404).send({ error: "Task not found!"})
		}

		res.send(task)
	} catch(e) {
		res.status(400).send(e)
	}
})

module.exports = router