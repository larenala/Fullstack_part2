const bcrypt = require('bcrypt')
const usersRouter = require('express').Router()
const User = require('../models/user')

usersRouter.get('/', async (request, response, next) => {
    try {
        const users = await User.find({}).populate('blogs', {likes: 0, user: 0})
        response.json(users.map(u => u.toJSON()))
    } catch(exception) {
        next(exception)
    }
  })

usersRouter.post('/', async (request, response, next) => {
  try {
    const body = request.body

    if (!body.username || body.username.length < 3) {
        return response.status(400).json({
              error: 'username must be at least 3 characters long'
            })
    } else if (!body.password || body.password.length < 3) {
        return response.status(400).json({
            error: 'password must be at least 3 characters long'
        })
    }

    const saltRounds = 10
    const passwordHash = await bcrypt.hash(body.password, saltRounds)

    const user = new User({
      username: body.username,
      name: body.name,
      passwordHash,
    })

    const savedUser = await user.save()

    response.json(savedUser)
  } catch (exception) {
    next(exception)
  }
})

module.exports = usersRouter