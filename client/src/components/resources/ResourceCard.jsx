import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  DocumentIcon, 
  StarIcon, 
  ArrowDownTrayIcon as DownloadIcon, // This line is corrected
  CurrencyRupeeIcon,
  TagIcon
} from '@heroicons/react/24/outline'
import { StarIcon as StarSolidIcon } from '@heroicons/react/24/solid'

const ResourceCard = ({ resource, onPurchase }) => {
  const [isLoading, setIsLoading] = useState(false)

  const {
    _id,
    title,
    description,
    category,
    type,
    price,
    originalPrice,
    currency,
    tags,
    difficulty,
    downloads,
    averageRating,
    totalRatings,
    preview
  } = resource

  const handlePurchase = async () => {
    setIsLoading(true)
    try {
      await onPurchase(resource)
    } finally {
      setIsLoading(false)
    }
  }

  const formatPrice = (amount) => {
    return currency === 'INR' ? `₹${amount}` : `${amount}`
  }

  const renderStars = (rating) => {
    return [...Array(5)].map((_, i) => (
      <div key={i} className="relative">
        {i < Math.floor(rating) ? (
          <StarSolidIcon className="w-4 h-4 text-yellow-400" />
        ) : (
          <StarIcon className="w-4 h-4 text-secondary-300" />
        )}
      </div>
    ))
  }

  const getDifficultyColor = (level) => {
    switch (level) {
      case 'Beginner': return 'bg-green-100 text-green-800'
      case 'Intermediate': return 'bg-yellow-100 text-yellow-800'
      case 'Advanced': return 'bg-red-100 text-red-800'
      default: return 'bg-secondary-100 text-secondary-800'
    }
  }

  const getTypeIcon = (resourceType) => {
    switch (resourceType) {
      case 'PDF': return '📄'
      case 'Template': return '📝'
      case 'Video': return '🎥'
      case 'Course': return '🎓'
      default: return '📁'
    }
  }

  return (
    <motion.div
      whileHover={{ y: -5 }}
      transition={{ duration: 0.3 }}
      className="card overflow-hidden group"
    >
      {/* Preview Image */}
      <div className="relative h-48 bg-gradient-to-br from-primary-100 to-purple-100">
        {preview?.images && preview.images.length > 0 ? (
          <img
            src={preview.images[0]}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-6xl">{getTypeIcon(type)}</div>
          </div>
        )}

        {/* Price Badge */}
        <div className="absolute top-3 right-3">
          <div className="bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2">
            <div className="flex items-center space-x-1">
              <CurrencyRupeeIcon className="w-4 h-4 text-primary-600" />
              <span className="font-bold text-primary-600">{price}</span>
              {originalPrice && originalPrice > price && (
                <span className="text-xs text-secondary-500 line-through">{originalPrice}</span>
              )}
            </div>
          </div>
        </div>

        {/* Type & Difficulty */}
        <div className="absolute top-3 left-3 flex flex-col space-y-2">
          <span className="px-2 py-1 text-xs font-medium bg-primary-600 text-white rounded-full">
            {type}
          </span>
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getDifficultyColor(difficulty)}`}>
            {difficulty}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Category */}
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-primary-600">{category}</span>
          <div className="flex items-center space-x-1 text-sm text-secondary-500">
            <DownloadIcon className="w-4 h-4" />
            <span>{downloads}</span>
          </div>
        </div>

        {/* Title */}
        <h3 className="text-xl font-semibold text-secondary-900 mb-2 line-clamp-2">
          {title}
        </h3>

        {/* Description */}
        <p className="text-secondary-600 mb-4 line-clamp-3">
          {description}
        </p>

        {/* Rating */}
        {totalRatings > 0 && (
          <div className="flex items-center space-x-2 mb-4">
            <div className="flex space-x-1">
              {renderStars(averageRating)}
            </div>
            <span className="text-sm text-secondary-600">
              {averageRating?.toFixed(1)} ({totalRatings} reviews)
            </span>
          </div>
        )}

        {/* Tags */}
        {tags && tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className="inline-flex items-center space-x-1 px-2 py-1 text-xs font-medium bg-secondary-100 text-secondary-700 rounded-md"
              >
                <TagIcon className="w-3 h-3" />
                <span>{tag}</span>
              </span>
            ))}
            {tags.length > 3 && (
              <span className="px-2 py-1 text-xs font-medium bg-secondary-100 text-secondary-700 rounded-md">
                +{tags.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Purchase Button */}
        <button
          onClick={handlePurchase}
          disabled={isLoading}
          className={`btn btn-primary w-full flex items-center justify-center space-x-2 ${
            isLoading ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {isLoading ? (
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
              <span>Processing...</span>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <span>{price > 0 ? `Buy for ${formatPrice(price)}` : 'Download Free'}</span>
              <DownloadIcon className="w-4 h-4" />
            </div>
          )}
        </button>

        {/* Preview Description */}
        {preview?.description && (
          <p className="mt-3 text-xs text-secondary-500">
            {preview.description}
          </p>
        )}
      </div>
    </motion.div>
  )
}

export default ResourceCard