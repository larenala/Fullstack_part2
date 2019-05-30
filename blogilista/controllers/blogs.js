const blogsRouter = require('express').Router()
const Blog = require('../models/blog')
const User = require('../models/user')
const middleware = require('../utils/middleware')
const app = require('../app')

blogsRouter.get('/', async (request, response, next) => {

    try {
        const blogs = await Blog.find({}).populate('user', {username: 1, name: 1, id: 1})
        response.json(blogs.map(blog => blog.toJSON()))
    } catch (exception) {
        next(exception)
    }
})
  
blogsRouter.post('/', async (request, response, next) => {

    const body = request.body
    const user = body.userId === undefined ? await User.findById("5cef89f3b4ee3b2f16db7dc2") : await User.findById(body.userId)
    const blog = new Blog({
        title: body.title,
        author: body.author,
        url: body.url,
        likes: body.likes,
        user: user._id
    })
    try {
        const savedBlog = await blog.save()
        user.blogs = user.blogs.concat(savedBlog._id)
        await user.save()
        response.json(savedBlog.toJSON())
    } catch (exception) {
        next(exception)
    }

})

blogsRouter.delete('/:id', async (request, response, next) => {
    try{
        await Blog.findByIdAndRemove(request.params.id)
        response.status(204).end()
    } catch (exception) {
        next(exception)
    }
})

blogsRouter.put('/:id', async (request, response, next) => {
    const blog = await Blog.findById(request.params.id)
    const body = request.body
    
    const newblog = {
        id: body.id !== undefined ? body.id : blog.id,
        title: body.title !== undefined ? body.title : blog.title,
        author: body.author !== undefined ? body.author : blog.author,
        url: body.url !== undefined ? body.url : blog.url,
        likes: body.likes !== undefined ? body.likes : blog.likes
    }
    try{
        const blog = await Blog.findByIdAndUpdate(request.params.id, newblog, {new: true})
        response.json(blog.toJSON())
    } catch(exception) {
        next(exception)
    }
  })
  

module.exports = blogsRouter