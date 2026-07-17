const bcrypt = require('bcrypt')
const { beforeEach, describe, after, test } = require('node:test')
const mongoose = require('mongoose')
const supertest = require('supertest')

const app = require('../app')
const helper = require('./users_test_helper')

const User = require('../models/user')
const assert = require('node:assert')

const api = supertest(app)

beforeEach(async () => {
    await User.deleteMany({})
    const passwordHash = await bcrypt.hash('pass_dummy', 10)
    const user = new User({ username: 'root', passwordHash: passwordHash, name: 'root_name' })
    await user.save()
})

describe('USER: POST endpoint test', () => {
    test('User added success', async () => {
        const existingUsers = await helper.usersInDB()

        const newUser = {
            username: 'Test_user',
            password: 'test_password',
            name: 'Test'
        }
        await api
            .post('/api/users')
            .send(newUser)
            .expect(201)
            .expect('Content-Type', /application\/json/)

        const usersAtEnd = await helper.usersInDB()
        assert.strictEqual(usersAtEnd.length, existingUsers.length + 1)

        const usernames = usersAtEnd.map(u => u.username)
        assert(usernames.includes(newUser.username))
    })

    test('User added fail, username already exist', async () => {
        const existingUsers = await helper.usersInDB()
        const newUser = {
            username: 'root',
            password: 'test_password',
            name: 'Test'
        }
        await api
            .post('/api/users')
            .send(newUser)
            .expect(400)
            .expect('Content-Type', /application\/json/)

        const usersAtEnd = await helper.usersInDB()
        assert.strictEqual(usersAtEnd.length, existingUsers.length)
    })

    test('User added fail, password is missing', async () => {
        const existingUsers = await helper.usersInDB()
        const newUser = {
            username: 'Test_user',
            name: 'Test'
        }
        const result = await api
            .post('/api/users')
            .send(newUser)
            .expect(400)
            .expect('Content-Type', /application\/json/)

        const usersAtEnd = await helper.usersInDB()
        assert.strictEqual(usersAtEnd.length, existingUsers.length)

        assert.strictEqual(result.body.error, 'password is required')
    })

    test('User added fail, password is too short', async () => {
        const existingUsers = await helper.usersInDB()
        const newUser = {
            username: 'Test_user',
            password: 'pw',
            name: 'Test'
        }
        const result = await api
            .post('/api/users')
            .send(newUser)
            .expect(400)
            .expect('Content-Type', /application\/json/)

        const usersAtEnd = await helper.usersInDB()
        assert.strictEqual(usersAtEnd.length, existingUsers.length)

        assert.strictEqual(result.body.error, 'password must be at least 3 characters long')
    })
})

after(async () => {
    await mongoose.connection.close()
})