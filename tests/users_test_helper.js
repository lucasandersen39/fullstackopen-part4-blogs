const User = require('../models/user')

const usersInDB = async () => {
    const result = await User.find({})
    return result.map(user => user.toJSON())
}

module.exports = {
    usersInDB
}