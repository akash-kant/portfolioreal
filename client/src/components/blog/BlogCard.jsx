import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { CalendarIcon, ClockIcon, EyeIcon, HeartIcon, UserIcon } from '@heroicons/react/24/outline'

const BlogCard = ({ blog }) => {
  const {
    _id,
    title,
    slug,
    excerpt,
    coverImage,
    author,
    category,
    tags,
    readTime,
    publishedAt,
    views,
    likes
  } = blog

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  return (
    <motion.article
      whileHover={{ y: -5 }}
      transition={{ duration: 0.3 }}
      className="card overflow-hidden group"
    >
      {/* Cover Image */}
      <Link to={`/blog/${slug || _id}`} className="block relative h-48 overflow-hidden">
        {coverImage ? (
          <img
            src={coverImage}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary-100 to-purple-100 flex items-center justify-center">
            <span className="text-4xl">📝</span>
          </div>
        )}

        {/* Category Badge */}
        <div className="absolute top-3 left-3">
          <span className="px-2 py-1 text-xs font-medium bg-primary-600 text-white rounded-full">
            {category}
          </span>
        </div>
      </Link>

      {/* Content */}
      <div className="p-6">
        {/* Meta Info */}
        <div className="flex items-center justify-between text-sm text-secondary-500 mb-3">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <CalendarIcon className="w-4 h-4" />
              <span>{formatDate(publishedAt)}</span>
            </div>
            <div className="flex items-center space-x-1">
              <ClockIcon className="w-4 h-4" />
              <span>{readTime} min read</span>
            </div>
          </div>
        </div>

        {/* Title */}
        <Link to={`/blog/${slug || _id}`} className="block mb-3 group/title">
          <h2 className="text-xl font-semibold text-secondary-900 line-clamp-2 group-hover/title:text-primary-600 transition-colors">
            {title}
          </h2>
        </Link>

        {/* Excerpt */}
        <p className="text-secondary-600 mb-4 line-clamp-3">
          {excerpt}
        </p>

        {/* Tags */}
        {tags && tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className="px-2 py-1 text-xs font-medium bg-secondary-100 text-secondary-700 rounded-md"
              >
                #{tag}
              </span>
            ))}
            {tags.length > 3 && (
              <span className="px-2 py-1 text-xs font-medium bg-secondary-100 text-secondary-700 rounded-md">
                +{tags.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between">
          {/* Author */}
          <div className="flex items-center space-x-2">
            {author?.avatar ? (
              <img
                src={author.avatar}
                alt={author.name}
                className="w-6 h-6 rounded-full"
              />
            ) : (
              <UserIcon className="w-6 h-6 text-secondary-400" />
            )}
            <span className="text-sm text-secondary-600">
              {author?.name || 'Anonymous'}
            </span>
          </div>

          {/* Stats */}
          <div className="flex items-center space-x-3 text-sm text-secondary-500">
            <div className="flex items-center space-x-1">
              <EyeIcon className="w-4 h-4" />
              <span>{views || 0}</span>
            </div>
            <div className="flex items-center space-x-1">
              <HeartIcon className="w-4 h-4" />
              <span>{likes?.length || 0}</span>
            </div>
          </div>
        </div>
      </div>
    </motion.article>
  )
}

export default BlogCard