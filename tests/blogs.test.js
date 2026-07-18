const { test, after, describe, beforeEach, before } = require('node:test')
const assert = require('node:assert')
const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const helper = require('./blogs_test_helper')
const helperLogin = require('./login_helper')

const Blog = require('../models/blog')
const blog = require('../models/blog')

const api = supertest(app)

let token = null
let userId = null

before(async () => {
    const loginData = await helperLogin.loginUser(api)
    token = loginData.token
    userId = loginData.userId
})

beforeEach(async () => {
    await Blog.deleteMany({})
    const blogEntries = helper.blogs_dummy.map(blog => new Blog({ ...blog, user: userId }))
    const promiseArray = blogEntries.map(blog => blog.save())
    await Promise.all(promiseArray)
})

describe('Verify test environment', () => {
    test('Verify user exist', async () => {
        const response = await api.get('/api/users')
        const usernames = response.body.map(u => u.username)
        assert.ok(usernames.includes('testuser'))
    })
})

describe('BLOGS: GET endpoint tests', () => {
    test('blogs are returned as json', async () => {
        await api
            .get('/api/blogs')
            .expect(200)
            .expect('Content-Type', /application\/json/)
    })

    test('unique identifier property of the blog posts is named id', async () => {
        const response = await api.get('/api/blogs')
        if (response.body.length > 0) {
            assert.ok(response.body[0].id) // id identifier is OK
            assert.strictEqual(response.body[0]._id, undefined) // _id identifier is not define
        }
    })

    test('Return all items', async () => {
        const response = await api.get('/api/blogs').expect(200)

        assert.strictEqual(response.body.length, helper.blogs_dummy.length)
    })
})

describe('BLOGS: GET by ID endpoint test', () => {
    test('Get blog by id success', async () => {
        const blogs = await helper.blogsInDB()
        const blogSearch = blogs[0]

        const result = await api.get(`/api/blogs/${blogSearch.id}`).expect(200).expect('Content-Type', /application\/json/)

        assert.deepStrictEqual(result.body.title, blogSearch.title)
        assert.deepStrictEqual(result.body.id.toString(), blogSearch.id.toString())
    })

    test('GET blog with non exist ID, return error', async () => {
        const noExistID = await helper.nonExistingId()
        await api.get(`/api/blogs/${noExistID}`).expect(404)
    })
})

describe('BLOGS: POST endpoint tests', () => {
    test('a valid blog can be added', async () => {
        const newBlog = {
            title: 'New Test Blog',
            author: 'Matti Luukkainen',
            url: 'https://fullstackopen.com/es/part4/probando_el_backend#entorno-de-prueba',
            likes: 5,
        }

        await api
            .post('/api/blogs')
            .set('Authorization', `Bearer ${token}`)
            .send(newBlog)
            .expect(201)
            .expect('Content-Type', /application\/json/)

        // After POST
        const finalResponse = await api.get('/api/blogs')
        assert.strictEqual(finalResponse.body.length, helper.blogs_dummy.length + 1)

        const titles = finalResponse.body.map(r => r.title)
        assert.ok(titles.includes('New Test Blog'))
    })

    test('If the likes property is missing, It set with default 0', async () => {
        const blogWithoutLikes = {
            title: 'assert.deepStrictEqual(actual, expected[, message])',
            author: 'nodejs',
            url: 'https://nodejs.org/api/assert.html#assertdeepstrictequalactual-expected-message'
        }

        const response = await api.post('/api/blogs')
            .set('Authorization', `Bearer ${token}`)
            .send(blogWithoutLikes)
            .expect(201)
            .expect('Content-Type', /application\/json/)

        assert.strictEqual(response.body.likes, 0)
    })

    test('If the title property is missing, 400 bad request is return', async () => {
        const blogWithoutTitle = {
            author: 'mongoose',
            url: 'https://mongoosejs.com/docs/validation.html#custom-validators',
            likes: 10
        }

        const response = await api
            .post('/api/blogs')
            .set('Authorization', `Bearer ${token}`)
            .send(blogWithoutTitle)
            .expect(400)

        assert.strictEqual(response.body.error, 'Blog validation failed: title: title is required')
    })

    test('If the author property is missing, 400 bad request is return', async () => {
        const blogWithoutAuthor = {
            title: 'Custom Validators',
            url: 'https://mongoosejs.com/docs/validation.html#custom-validators',
            likes: 10
        }

        const response = await api
            .post('/api/blogs')
            .set('Authorization', `Bearer ${token}`)
            .send(blogWithoutAuthor)
            .expect(400)

        assert.strictEqual(response.body.error, 'Blog validation failed: author: author is required')
    })

    test('If the token is missing, 401 unauthorized is return', async () => {
        const newBlog = {
            title: 'New Test Blog',
            author: 'Test Author',
            url: 'https://example.com/test-blog',
            likes: 5
        }

        const response = await api
            .post('/api/blogs')
            .send(newBlog)
            .expect(401)
        assert.strictEqual(response.body.error, 'token invalid')
    })
})

describe('BLOGS: DELETE endpoint test', () => {
    test('delete blog success', async () => {
        const blogsStart = await helper.blogsInDB()
        const blogHelp = blogsStart[0]
        await api
            .delete(`/api/blogs/${blogHelp.id}`)
            .set('Authorization', `Bearer ${token}`)
            .expect(204)

        const blogEnd = await helper.blogsInDB()
        const titles = blogEnd.map(b => b.title)
        assert(!titles.includes(blogHelp.title))

        assert.strictEqual(blogEnd.length, helper.blogs_dummy.length - 1)
    })

    test('delete non existing id, return error', async () => {
        const nonExistID = await helper.nonExistingId()
        await api
            .delete(`/api/blogs/${nonExistID}`)
            .set('Authorization', `Bearer ${token}`)
            .expect(404)

        const blogEnd = await helper.blogsInDB()
        assert.strictEqual(blogEnd.length, helper.blogs_dummy.length)

    })
})

describe('BLOG: PUT endpoint test', () => {
    test('Update blog success', async () => {
        const blogs = await helper.blogsInDB()
        const blogUpdate = blogs[0]

        const updateInfo = {
            title: 'New title',
            author: 'new author',
            url: 'new url',
            likes: blogUpdate.likes + 10,
        }

        await api.put(`/api/blogs/${blogUpdate.id}`).send(updateInfo).expect(200)

        const resultBlog = await api.get(`/api/blogs/${blogUpdate.id}`).expect(200)
        assert.strictEqual(resultBlog.body.id, blogUpdate.id)
        assert.strictEqual(resultBlog.body.title, updateInfo.title)
        assert.strictEqual(resultBlog.body.author, updateInfo.author)
    })

    test('Update likes success', async () => {
        const blogs = await helper.blogsInDB()
        const blogUpdate = blogs[0]
        const newLikes = blogUpdate.likes + 10
        const updateInfo = {
            title: blogUpdate.title,
            author: blogUpdate.title,
            url: blogUpdate.title,
            likes: newLikes
        }

        const result = await api.put(`/api/blogs/${blogUpdate.id}`).send(updateInfo).expect(200)

        assert.strictEqual(result.body.likes, newLikes)

        const resultBlog = await api.get(`/api/blogs/${blogUpdate.id}`).expect(200)
        assert.strictEqual(resultBlog.body.likes, newLikes)
    })

    test('Update likes with -1 value, return error', async () => {
        const blogs = await helper.blogsInDB()
        const blogUpdate = blogs[0]

        const updateInfo = {
            title: blogUpdate.title,
            author: blogUpdate.title,
            url: blogUpdate.title,
            likes: -1
        }

        const result = await api.put(`/api/blogs/${blogUpdate.id}`).send(updateInfo).expect(400)
        assert.strictEqual(result.body.error, 'Validation failed: likes: the minium allowed is 0')
    })
})

after(async () => {
    await mongoose.connection.close()
})