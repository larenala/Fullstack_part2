


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


module.exports = {
  dummy,
  totalLikes,
  favoriteBlog
}
