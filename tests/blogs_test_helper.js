const Blog = require('../models/blog')

const blogs_dummy = [
    {
        title: "assert.deepStrictEqual(actual, expected[, message])",
        author: "node.js",
        url: "https://nodejs.org/api/assert.html#assertdeepstrictequalactual-expected-message",
        likes: 5
    },
    {
        title: "Custom Validators",
        author: "mongoose",
        url: "https://mongoosejs.com/docs/validation.html#custom-validators",
        likes: 8
    }
]

const blogsInDB = async () => {
    const result = await Blog.find({})
    return result.map(blog => blog.toJSON())
}

const nonExistingId = async () => {
    const blog = new Blog({
        title: 'No exist',
        author: ' Me',
        url: 'example.com',
        likes: 2
    })
    await blog.save()
    await blog.deleteOne()

    return blog._id.toString()
}

module.exports = {
    blogs_dummy,
    blogsInDB,
    nonExistingId
}