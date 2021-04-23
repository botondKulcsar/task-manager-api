const request = require('supertest')

const app = require('../src/app')
const User = require('../src/models/user')
const { userOneId, userOne, userTwo, userTwoId, setupDatabase } = require('./fixtures/db')


beforeEach(setupDatabase)

test('Should signup a new user', async() => {
    const response = await request(app).post('/users').send({
        name: 'Andrew',
        email: 'andrew@example.com',
        password: 'MyPass777!'
    }).expect(201)
    //  Assert that the db was changed correctly
    const user = await User.findById(response.body.user._id)
    expect(user).not.toBeNull()

    //  assertions about the response
    expect(response.body).toMatchObject({
        user: {
            name: 'Andrew',
            email: 'andrew@example.com'
        },
        token: user.tokens[0].token
    })
    expect(user.password).not.toBe('MyPass777!')
})

test('Should login existing user', async() => {
    const response = await request(app).post('/users/login').send({
        email: userOne.email,
        password: userOne.password
    }).expect(200)

    const user = await User.findById(userOneId)
    expect(response.body.token).toBe(user.tokens[1].token)
})

test('Should not login nonexistent user', async() => {
    await request(app).post('/users/login').send({
        email: userOne.email,
        password: 'wrongPassword'
    }).expect(400)
})

test('Should get profile for user', async() => {
    await request(app)
        .get('/users/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200)
})

test('Should not get profile for unauthenticated user', async() => {
    await request(app)
        .get('/users/me')
        .send()
        .expect(401)
})

test('Should delete account for user', async() => {
    await request(app)
        .delete('/users/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200)
    const user = await User.findById(userOneId)
    expect(user).toBeNull()
})

test('Should not delete account for unauthenticated user', async() => {
    await request(app)
            .delete('/users/me')
            .send()
            .expect(401)
})

test('Should upload avatar image', async() => {
    await request(app)
            .post('/users/me/avatar')
            .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
            .attach('avatar', 'tests/fixtures/profile-pic.jpg')
            .expect(200)
    const user = await User.findById(userOneId)
    expect(user.avatar).toEqual(expect.any(Buffer))
})

test('Should update valid user fields', async() => {
    await request(app)
        .patch('/users/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send({ name: 'Jack' })
        .expect(200)
    const user = await User.findById(userOneId)
    expect(user.name).toEqual('Jack')
})

test('Should not update invalid user fields', async() => {
    await request(app)
        .patch('/users/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send({ location: 'NY' })
        .expect(400)
})

// User Test Ideas
//
// Should not signup user with invalid name/email/password
// Should not update user if unauthenticated
// Should not update user with invalid name/email/password
// Should not delete user if unauthenticated

test('Should not signup user with invalid name', async() => {
    await request(app)
                .post('/users')
                .send({
                    email: 'sg@fasdf.com',
                    password: 'fsadf32rfssf'
                })
                .expect(400)
})

test('Should not signup user with invalid email', async() => {
    await request(app)
        .post('/users')
        .send({
            name: 'Somebody',
            email: 'safs@dsf',
            password: 'fasdfasdf43325'
        })
        .expect(400)
})

test('Should not signup user with invalid password', async() => {
    await request(app)
            .post('/users')
            .send({
                name: 'fasdfasdfsaf',
                email: 'fasdfa@dafdsaf.com',
                password: 'abc123'
            })
            .expect(400)
})

test('Should not update user if unauthenticated', async() => {
    const response = await request(app)
            .patch('/users/me')
            .send({
                name: 'Zorro'
            })
            .expect(401)
})

test('Should not update user with invalid name', async() => {
    const response = await request(app)
                .patch('/users/me')
                .set('Authorization', `Bearer ${userTwo.tokens[0].token}`)
                .send({
                    name: ''
                })
                .expect(400)
    expect(userTwo.name).not.toEqual('')
})

test('Should not update user with invalid email', async() => {
    const response = await request(app)
                .patch('/users/me')
                .set('Authorization', `Bearer ${userTwo.tokens[0].token}`)
                .send({
                    email: 'user@afsda.'
                })
                .expect(400)
    expect(userTwo.email).not.toEqual('user@afsda.')
})

test('Should not update user with invalid password', async() => {
    const response = await request(app)
                .patch('/users/me')
                .set('Authorization', `Bearer ${userTwo.tokens[0].token}`)
                .send({
                    password: 'user'
                })
                .expect(400)
    expect(userTwo.password).not.toEqual('user')
})

test('Should not delete user if unauthenticated', async() => {
    const respone = await request(app)
                .delete('/users/me')
                .send()
                .expect(401)
})

