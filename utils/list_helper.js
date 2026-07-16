const dummy = (blogs) => {
    return 1
}

const totalLikes = (blogs) => {
    const reducer = (sum, blog) => {
        return sum + blog.likes
    }
    return blogs.reduce(reducer, 0)
}

const favoriteBlog = (blogs) => {
    if (blogs.length === 0) {
        return null
    }
    let favorite = blogs[0]
    for (let blog of blogs) {
        if (blog.likes > favorite.likes) {
            favorite = blog
        }
    }
    return favorite
}

module.exports = {
    dummy,
    totalLikes,
    favoriteBlog
}