const blogsRouter = require('express').Router()
const Blog = require('../models/blog')
const User = require('../models/user')
const middleware = require('../utils/middleware')
blogsRouter.get('/:id', async (request, response, next) => {
    try {
        const blog = await Blog.findById(request.params.id).populate('user')
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

blogsRouter.post('/', middleware.userExtractor, async (request, response, next) => {
    const blog = new Blog(request.body)
    console.log("POST", request.user)
    const user = await User.findById(request.user)
    console.log('user', user)
    blog.user = user.id
    console.log('blog.user', blog.user)
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

blogsRouter.delete('/:id', middleware.userExtractor, async (request, response, next) => {
    const id = request.params.id
    try {
        const result = await Blog.findById(id)
        if (!result) {
            return response.status(404).end()
        }
        if (result.user?.toString() === request.user.toString()) {
            await result.deleteOne()
            response.status(204).end()
        } else {
            response.status(403).json({ error: 'only the creator can delete this blog' })
        }
    } catch (exception) {
        next(exception)
    }
})

module.exports = blogsRouter