const { test, after, describe } = require('node:test')
const assert = require('node:assert')
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
        console.log("BODY ", response.body)
        if (response.body.length > 0) {
            assert.ok(response.body[0].id) // id identifier is OK
            assert.strictEqual(response.body[0]._id, undefined) // _id identifier is not define
        }
    })
})

describe('BLOGS: POST endpoint tests', () => {
    test('a valid blog can be added', async () => {
        const newBlog = {
            title: 'Entorno de prueba',
            author: 'Matti Luukkainen',
            url: 'https://fullstackopen.com/es/part4/probando_el_backend#entorno-de-prueba',
            likes: 5,
        }
        // Before POST
        const initialResponse = await api.get('/api/blogs')
        const initialCount = initialResponse.body.length

        await api
            .post('/api/blogs')
            .send(newBlog)
            .expect(201)
            .expect('Content-Type', /application\/json/)

        // After POST
        const finalResponse = await api.get('/api/blogs')
        assert.strictEqual(finalResponse.body.length, initialCount + 1)

        const titles = finalResponse.body.map(r => r.title)
        assert.ok(titles.includes('async/await'))
    })
})

after(async () => {
    await mongoose.connection.close()
})