const mongoose = require('mongoose')

const blogSchema = new mongoose.Schema({
    title: {
        type: String,
        minLength: [3, ' the minium allowed length is 3'],
        required: [true, 'title is required']
    },
    author: {
        type: String,
        minLength: [3, 'the minium allowed length is 3'],
        required: [true, 'author is required']
    },
    url: String,
    likes: {
        type: Number,
        default: 0,
        min: [0, 'the minium allowed is 0']
    }
})

blogSchema.set('toJSON', {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id.toString()
        delete returnedObject._id
        delete returnedObject.__v
    }
})

module.exports = mongoose.model('Blog', blogSchema)