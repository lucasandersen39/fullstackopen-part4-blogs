const blogsRouter = require('express').Router()
const Blog = require('../models/blog')
const User = require('../models/user')
blogsRouter.get('/:id', async (request, response, next) => {
    try {
        const blog = await Blog.findById(request.params.id)
        if (blog) {
            response.json(blog)
        } else {
            response.status(404).end()
        }
    } catch (exception) {
        next(exception)
    }
})

blogsRouter.get('/', async (request, response, next) => {
    try {
        const blogs = await Blog.find({}).populate('user')
        response.json(blogs)
    } catch (exception) {
        next(exception)
    }
})

blogsRouter.post('/', async (request, response, next) => {
    const blog = new Blog(request.body)
    // User dummy
    const users = await User.find({})
    const user = users[0]
    blog.user = user.id
    try {
        const blogSaved = await blog.save()
        user.blogs = user.blogs.concat(blogSaved._id)
        user.save()
        response.status(201).json(blogSaved)
    } catch (exception) {
        next(exception)
    }
})

blogsRouter.put('/:id', async (request, response, next) => {
    const id = request.params.id
    const body = request.body
    const blogUpdate = {
        title: body.title,
        author: body.author,
        url: body.url,
        likes: body.likes
    }
    try {
        const result = await Blog.findByIdAndUpdate(id, blogUpdate, { new: true, runValidators: true, context: 'query' })
        response.status(200).json(result)
    } catch (exception) {
        next(exception)
    }
})

blogsRouter.delete('/:id', async (request, response, next) => {
    const id = request.params.id
    try {
        const result = await Blog.findByIdAndDelete(id)
        response.status(204).end()
    } catch (exception) {
        next(exception)
    }
})

module.exports = blogsRouter