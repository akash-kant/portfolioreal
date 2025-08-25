import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { EyeIcon, HeartIcon, CodeBracketIcon, ArrowTopRightOnSquareIcon } from '@heroicons/react/24/outline'

const ProjectCard = ({ project }) => {
  const {
    _id,
    title,
    description,
    images,
    technologies,
    category,
    demoUrl,
    githubUrl,
    views,
    likes,
    status
  } = project

  return (
    <motion.div
      whileHover={{ y: -5 }}
      transition={{ duration: 0.3 }}
      className="card overflow-hidden group"
    >
      {/* Project Image */}
      <div className="relative h-48 overflow-hidden">
        {images && images.length > 0 ? (
          <img
            src={images[0]}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary-100 to-purple-100 flex items-center justify-center">
            <CodeBracketIcon className="w-16 h-16 text-primary-400" />
          </div>
        )}

        {/* Status Badge */}
        {status && status !== 'Completed' && (
          <div className="absolute top-3 left-3">
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
              status === 'In Progress' 
                ? 'bg-yellow-100 text-yellow-800'
                : 'bg-blue-100 text-blue-800'
            }`}>
              {status}
            </span>
          </div>
        )}

        {/* Category */}
        <div className="absolute top-3 right-3">
          <span className="px-2 py-1 text-xs font-medium bg-white/90 text-secondary-700 rounded-full backdrop-blur-sm">
            {category}
          </span>
        </div>

        {/* Overlay with Links */}
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center space-x-4">
          {demoUrl && (
            <a
              href={demoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-3 bg-white/20 hover:bg-white/30 rounded-full backdrop-blur-sm transition-colors"
              title="Live Demo"
            >
              <ArrowTopRightOnSquareIcon className="w-5 h-5 text-white" />
            </a>
          )}
          {githubUrl && (
            <a
              href={githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-3 bg-white/20 hover:bg-white/30 rounded-full backdrop-blur-sm transition-colors"
              title="View Code"
            >
              <CodeBracketIcon className="w-5 h-5 text-white" />
            </a>
          )}
        </div>
      </div>

      {/* Project Info */}
      <div className="p-6">
        <Link to={`/projects/${_id}`} className="block mb-3 group/title">
          <h3 className="text-xl font-semibold text-secondary-900 group-hover/title:text-primary-600 transition-colors">
            {title}
          </h3>
        </Link>

        <p className="text-secondary-600 mb-4 line-clamp-2">
          {description}
        </p>

        {/* Technologies */}
        <div className="flex flex-wrap gap-2 mb-4">
          {technologies.slice(0, 4).map((tech, index) => (
            <span
              key={index}
              className="px-2 py-1 text-xs font-medium bg-primary-100 text-primary-700 rounded-md"
            >
              {tech}
            </span>
          ))}
          {technologies.length > 4 && (
            <span className="px-2 py-1 text-xs font-medium bg-secondary-100 text-secondary-700 rounded-md">
              +{technologies.length - 4}
            </span>
          )}
        </div>

        {/* Stats */}
        <div className="flex items-center justify-between text-sm text-secondary-500">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <EyeIcon className="w-4 h-4" />
              <span>{views || 0}</span>
            </div>
            <div className="flex items-center space-x-1">
              <HeartIcon className="w-4 h-4" />
              <span>{likes?.length || 0}</span>
            </div>
          </div>
          <Link
            to={`/projects/${_id}`}
            className="text-primary-600 hover:text-primary-700 font-medium"
          >
            View Details →
          </Link>
        </div>
      </div>
    </motion.div>
  )
}

export default ProjectCard