
const _ = require('lodash')

const dummy = (blogs) => {
  return 1
}

const totalLikes = blogs => {
  let sum = 0
  return blogs.reduce((sum, blog) => {
    return sum += blog.likes
  }, 0)

}

const favoriteBlog = blogs => {
  let result = blogs
    .map(blog => blog.likes)
    .reduce((a, b) => {
      return Math.max(a, b)
  })
  let blog = blogs.find(blog => blog.likes === result)
  let returnedBlog = {
    title: blog.title,
    author: blog.author,
    likes: blog.likes
  }
  return returnedBlog
}

const mostBlogs = blogs => {
  let authors=blogs.map(blog => blog.author)
  const result = _.entries(_.countBy(authors))
    .map(([name, count]) => ({ name, count }))
  let maxNum = 0
  let authorWithMostBlogs = ''
  for (let i=0; i<result.length; i++) {
    if (result[i].count > maxNum) {
      maxNum = result[i].count
      authorWithMostBlogs = result[i].name
    }
  }
  return {
    "author": authorWithMostBlogs,
    "blogs": maxNum
  }
}

const mostLikes = blogs => {
  const combinedLikes =
  _(blogs)
  .groupBy('author')
  .map((objs, key) => ({

    'author': key,
    'likes': _.sumBy(objs, 'likes')
  }))
  .value();
  let bestLikedAuthor = ''
  let mostLikes = 0 
  for (let i=0; i<combinedLikes.length; i++) {
    if (combinedLikes[i].likes > mostLikes) {
      bestLikedAuthor= combinedLikes[i].author
      mostLikes = combinedLikes[i].likes
    }
  }
  return {
    "author": bestLikedAuthor,
    "likes": mostLikes
  }
}

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog,
  mostBlogs,
  mostLikes
}
