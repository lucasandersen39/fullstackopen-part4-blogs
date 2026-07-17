const bcrypt = require('bcrypt')
const userRouter = require('express').Router()
const User = require('../models/user')

userRouter.post('/', async (request, response, next) => {
    const { username, password, name } = request.body
    if (!password) {
        return response.status(400).json({ error: 'password is required' })
    }
    if (password.length < 3) {
        return response.status(400).json({ error: 'password must be at least 3 characters long' })
    }
    const saltRounds = 10
    const passwordHash = await bcrypt.hash(password, saltRounds)
    const user = new User({
        username: username,
        passwordHash: passwordHash,
        name: name,
        blogs: []
    })
    try {
        const savedUser = await user.save()
        response.status(201).json(savedUser)
    } catch (exception) {
        next(exception)
    }
})

userRouter.get('/', async (request, response, next) => {
    try {
        const users = await User.find({}).populate('blogs')
        response.status(200).json(users)
    } catch (exception) {
        next(exception)
    }
})

module.exports = userRouter