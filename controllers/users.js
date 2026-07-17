const bcrypt = require('bcrypt')
const userRouter = require('express').Router()
const User = require('../models/user')

userRouter.post('/', async (request, response, next) => {
    const { username, password, name } = request.body
    const saltRounds = 10
    const passwordHash = await bcrypt.hash(password, saltRounds)
    const user = new User({
        username: username,
        passwordHash: passwordHash,
        name: name
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
        const users = await User.find({})
        response.status(200).json(users)
    } catch (exception) {
        next(exception)
    }
})

module.exports = userRouter