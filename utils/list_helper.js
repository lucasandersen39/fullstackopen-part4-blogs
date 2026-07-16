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

const mostBlogs = (blogs) => {
    if (blogs.length === 0) {
        return null
    }
    // Contar cuantos blogs tiene cada autor
    const counts = blogs.reduce((acc, blog) => {
        acc[blog.author] = (acc[blog.author] || 0) + 1
        return acc
    }, {})

    let topAuthor = ''
    let maxBlogs = 0
    // Buscar cual es el autor con mas blogs
    for (const author in counts) {
        if (counts[author] > maxBlogs) {
            maxBlogs = counts[author]
            topAuthor = author
        }
    }

    return {
        author: topAuthor,
        blogs: maxBlogs
    }
}

const mostLikes = (blogs) => {
    if (blogs.length === 0) {
        return null
    }
    // Contar cuantos likes tienen los blogs de cada autor
    const counts = blogs.reduce((acc, blog) => {
        acc[blog.author] = (acc[blog.author] || 0) + blog.likes
        return acc
    }, {})

    let topAuthor = ''
    let maxLikes = 0
    // Buscar cual es el autor con mas likes
    for (const author in counts) {
        if (counts[author] > maxLikes) {
            maxLikes = counts[author]
            topAuthor = author
        }
    }

    return {
        author: topAuthor,
        likes: maxLikes
    }
}
module.exports = {
    dummy,
    totalLikes,
    favoriteBlog,
    mostBlogs,
    mostLikes
}