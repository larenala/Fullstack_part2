const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const api = supertest(app)
const Blog = require('../models/blog')
const User = require('../models/user')
const helper = require('./test_helper')

beforeEach(async () => {
    await Blog.deleteMany({})

    let blogObject = new Blog(helper.initialBlogs[0])
    await blogObject.save()

    blogObject = new Blog(helper.initialBlogs[1])
    await blogObject.save()

    blogObject = new Blog(helper.initialBlogs[2])
    await blogObject.save()
})

test('blogs are returned as json', async () => {
    await api
      .get('/api/blogs')
      .expect(200)
      .expect('Content-Type', /application\/json/)
  })

test('there are three blogs', async () => {
    const response = await api.get('/api/blogs')
    expect(response.body.length).toBe(helper.initialBlogs.length)
})

test('returned blogs are identified by id', async () => {
    const response = await api.get('/api/blogs')
    expect(response.body[0].id).toBeDefined()
})

test('a new blog can be added', async () => {
    const newBlog = {
        "title": "First class tests",
        "author": "Robert C. Martin",
        "url": "http://blog.cleancoder.com/uncle-bob/2017/05/05/TestDefinitions.htmll",
        "likes": 10
    }

    await api
        .post('/api/blogs')
        .send(newBlog)
        .expect(200)
        .expect('Content-Type', /application\/json/)

    const blogsAtEnd = await helper.blogsInDb()
    expect(blogsAtEnd.length).toBe(helper.initialBlogs.length + 1)
    
    const title = blogsAtEnd.map(n => n.title)

    expect(title).toContain('First class tests')
})

test('if likes is not set, likes is set to zero', async () => {
    const newBlog = {
        "title": "TDD harms architecture",
        "author": "Robert C. Martin",
        "url": "http://blog.cleancoder.com/uncle-bob/2017/03/03/TDD-Harms-Architecture.html"
    }

    await api
        .post('/api/blogs')
        .send(newBlog)
        .expect(200)
        
        const response = await api.get('/api/blogs')
        expect(response.body[3].likes).toBe(0)
})

test('returned status code 404 when a new blog does not contain fields title or url', async () => {
    const newBlog = {
        "title": "TDD harms architecture",
        "author": "Robert C. Martin",
        "likes": 2
    }

    await api
        .post('/api/blogs')
        .send(newBlog)
        .expect(400)

        const blogsAtEnd = await helper.blogsInDb()
        expect(blogsAtEnd.length).toBe(helper.initialBlogs.length)
})

test('a blog can be deleted', async() => {
    const blogsAtStart = await helper.blogsInDb()
    const blogToDelete = blogsAtStart[0]
    await api
        .delete(`/api/blogs/${blogToDelete.id}`)
        .expect(204)

    const blogsAtEnd = await helper.blogsInDb()

    expect(blogsAtEnd.length).toBe(
        helper.initialBlogs.length - 1
      )

    const titles = blogsAtEnd.map(b => b.title)
    expect(titles).not.toContain(blogToDelete.title)
})

test('a blog can be updated', async () => {
    const blogsAtStart = await helper.blogsInDb()
    const blogToUpdate = blogsAtStart[0]
    const updatedBlog = {
        "likes": 40
    }
    await api
        .put(`/api/blogs/${ blogToUpdate.id }`)
        .send(updatedBlog)
        .expect(200)  
    const response = await api.get('/api/blogs/')  
    expect(response.body[0].likes).toBe(40)
})

describe('when there is initially one user at db', () => {
    beforeEach(async () => {
      await User.deleteMany({})
      const user = new User({ username: 'root', password: 'sekret' })
      await user.save()
    }) 
    test('creation succeeds with a fresh username', async () => {
      const usersAtStart = await helper.usersInDb()
      const newUser = {
        username: 'mluukkai',
        name: 'Matti Luukkainen',
        password: 'salainen',
      }
      await api
        .post('/api/users')
        .send(newUser)
        .expect(200)
        .expect('Content-Type', /application\/json/)
      const usersAtEnd = await helper.usersInDb()
      expect(usersAtEnd.length).toBe(usersAtStart.length + 1)
      const usernames = usersAtEnd.map(u => u.username)
      expect(usernames).toContain(newUser.username)
    })
  })

  describe('when there is initially one user at db', () => {
    test('creation fails with proper statuscode and message if username already taken', async () => {
      const usersAtStart = await helper.usersInDb()
      const newUser = {
        username: 'root',
        name: 'Superuser',
        password: 'salainen',
      }
  
      const result = await api
        .post('/api/users')
        .send(newUser)
        .expect(400)
        .expect('Content-Type', /application\/json/)

      expect(result.body.error).toContain('`username` to be unique')
  
      const usersAtEnd = await helper.usersInDb()
      expect(usersAtEnd.length).toBe(usersAtStart.length)
    })
  })

  describe ('when user tries to add a user', () => {
    test('without specifying a username', async () => {
        const newUser = {
            username: '',
            name: 'Matti H',
            password: 'topsecret'
        }
        const result = await api
          .post('/api/users')
          .send(newUser)
          .expect(400)
          

      const usersAtEnd = await helper.usersInDb()
      const names = usersAtEnd.map(user => user.name)
      expect(names).not.toContain('Matti H')
      expect(result.body.error).toContain("username must be at least 3 characters long")
    })
      test('with invalid username', async () => {
          const newUser = {
              username: 'xx',
              name: 'Matti H',
              password: 'topsecret'
          }
          const result = await api
            .post('/api/users')
            .send(newUser)
            .expect(400)
            

        const usersAtEnd = await helper.usersInDb()
        const usernames = usersAtEnd.map(user => user.username)
        expect(usernames).not.toContain('xx')
        expect(result.body.error).toContain("username must be at least 3 characters long")
      })
      test('without specifying a password', async () => {
        const newUser = {
            username: 'matti',
            name: 'Matti H',
            password: ''
        }
        const result = await api
          .post('/api/users')
          .send(newUser)
          .expect(400)       
        const usersAtEnd = await helper.usersInDb()
        const usernames = usersAtEnd.map(user => user.usernames)
        expect(usernames).not.toContain('matti')
        expect(result.body.error).toContain("password must be at least 3 characters long")
      })
      test('with invalid password', async () => {
        const newUser = {
            username: 'matti',
            name: 'Matti H',
            password: 'pw'
        }
        const result = await api
          .post('/api/users')
          .send(newUser)
          .expect(400)       
        const usersAtEnd = await helper.usersInDb()
        const passwords = usersAtEnd.map(user => user.password)
        expect(passwords).not.toContain('pw')
        expect(result.body.error).toContain("password must be at least 3 characters long")
      })
  })

afterAll(() => {
mongoose.connection.close()
})
