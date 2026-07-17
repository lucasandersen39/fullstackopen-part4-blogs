const { test, after, describe } = require('node:test')
const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')

const api = supertest(app)
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
            expect(response.body[0].id).toBeDefined()
            expect(response.body[0]._id).not.toBeDefined()
        }
    })
})

after(async () => {
    await mongoose.connection.close()
})