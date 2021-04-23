const request = require('supertest')
const app = require('../src/app')
const Task = require('../src/models/task')
const { 
    userOneId, 
    userOne, 
    setupDatabase, 
    userTwoId, 
    userTwo, 
    taskOne, 
    taskTwo, 
    taskThree 
} = require('./fixtures/db')


beforeEach(setupDatabase)

test('Should create task for user', async () => {
    const response = await request(app)
            .post('/tasks')
            .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
            .send({
                description: 'From my test'
            })
            .expect(201)
    const task = await Task.findById(response.body._id)
    expect(task).not.toBeNull()
    expect(task.completed).toBe(false)
})

test('Should fetch user tasks', async() => {
    const response = await request(app)
                .get('/tasks')
                .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
                .send()
                .expect(200)
    expect(response.body.length).toEqual(2)
})

test('Should not delete other users tasks', async() => {
    const response = await request(app)
                .delete(`/tasks/${taskOne._id}`)
                .set('Authorization', `Bearer ${userTwo.tokens[0].token}`)
                .send()
                .expect(404)
    const task = await Task.findById(taskOne._id)
    expect(task).not.toBeNull()
})

// Task Test Ideas
//
// Should not create task with invalid description/completed
// Should not update task with invalid description/completed
// Should delete user task
// Should not delete task if unauthenticated
// Should not update other users task
// Should fetch user task by id
// Should not fetch user task by id if unauthenticated
// Should not fetch other users task by id
// Should fetch only completed tasks
// Should fetch only incomplete tasks
// Should sort tasks by description/completed/createdAt/updatedAt
// Should fetch page of tasks

test('Should not create task with invalid description', async() => {
    const response = await request(app)
                .post('/tasks')
                .set('Authorization', `Bearer ${userTwo.tokens[0].token}`)
                .send({
                    description: ''
                })
                .expect(400)
})

test('Should not create task with invalid completed', async() => {
    const response = await request(app)
            .post('/tasks')
            .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
            .send({
                completed: 'not yet'
            })
            .expect(400)
})

test('Should not update task with invalid description', async() => {
    const response = await request(app)
            .patch(`/tasks/${taskTwo._id}`)
            .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
            .send({
                description: ''
            })
            .expect(400)
    expect(taskTwo.description).not.toEqual('')
})

test('Should not update task with invalid completed', async() => {
    const response = await request(app)
            .patch(`/tasks/${taskTwo._id}`)
            .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
            .send({
                completed: 'completed'
            })
            .expect(400)
    expect(taskTwo.completed).not.toEqual('completed')
})

test('Should delete user task', async () => {
    const response = await request(app)
                .delete(`/tasks/${taskOne._id}`)
                .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
                .send()
                .expect(200)
    const task = await Task.findById(taskOne._id)
    expect(task).toEqual(null)
})

test('Should not delete task if unauthenticated', async () => {
    const response = await request(app)
                .delete(`/tasks/${taskTwo._id}`)
                .send()
                .expect(401)
    const task = await Task.findById(taskTwo._id)
    expect(task).not.toEqual(null)
})

test('Should fetch user task by id', async () => {
    const response = await request(app)
                .get(`/tasks/${taskTwo._id}`)
                .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
                .send()
                .expect(200)
    const task = await Task.findById(taskTwo._id)
    expect(response.body.description).toEqual(task.description)
})

test('Should not fetch user task by id if unauthenticated', async () => {
    const response = await request(app)
                .get(`/tasks/${taskTwo._id}`)
                .send()
                .expect(401)
    const task = await Task.findById(taskTwo._id)
    expect(response.body.description).not.toEqual(task.description)
})

test('Should not fetch other users task by id', async () => {
    const response = await request(app)
                .get(`/tasks/${taskThree._id}`)
                .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
                .send()
                .expect(404)
    const task = await Task.findById(taskThree._id)
    expect(response.body.description).not.toEqual(task.description)
})

test('Should fetch only completed tasks', async () => {
    const response = await request(app)
                .get('/tasks?completed=true')
                .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
                .send()
                .expect(200)
    const completed = response.body.every(task => task.completed === true)
    expect(completed).toBe(true)
})

test('Should fetch only incompleted tasks', async () => {
    const response = await request(app)
                .get('/tasks?completed=false')
                .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
                .send()
                .expect(200)
    const incompleted = response.body.every(task => task.completed === false)
    expect(incompleted).toBe(true)
})