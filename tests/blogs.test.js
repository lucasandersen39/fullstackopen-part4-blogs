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
        assert.ok(titles.includes('Entorno de prueba'))
    })

    test('If the likes property is missing, It set with default 0', async () => {
        const blogWithoutLikes = {
            title: 'assert.deepStrictEqual(actual, expected[, message])',
            author: 'nodejs',
            url: 'https://nodejs.org/api/assert.html#assertdeepstrictequalactual-expected-message'
        }

        const response = await api.post('/api/blogs')
            .send(blogWithoutLikes)
            .expect(201)
            .expect('Content-Type', /application\/json/)

        assert.strictEqual(response.body.likes, 0)
    })
})

after(async () => {
    await mongoose.connection.close()
})