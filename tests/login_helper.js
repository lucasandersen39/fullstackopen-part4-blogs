const User = require('../models/user')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const loginUser = async (api) => {
    await User.deleteMany({})

    const passwordHash = await bcrypt.hash('password123', 10)
    const user = new User({
        username: 'testuser',
        name: 'Test User',
        passwordHash
    })
    const savedUser = await user.save()

    const response = await api
        .post('/api/login')
        .send({ username: 'testuser', password: 'password123' })

    return {
        token: response.body.token,
        userId: savedUser._id.toString()
    }
}

module.exports = {
    loginUser
}