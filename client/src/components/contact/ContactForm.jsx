import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { motion } from 'framer-motion'
import { PaperAirplaneIcon } from '@heroicons/react/24/outline'
import { useMutation } from 'react-query'
import toast from 'react-hot-toast'
import api from '../../services/api'
import { SOCIAL_LINKS } from '../../utils/constants'

const schema = yup.object({
  name: yup.string().required('Name is required').min(2, 'Name must be at least 2 characters'),
  email: yup.string().email('Invalid email address').required('Email is required'),
  subject: yup.string().required('Subject is required').min(5, 'Subject must be at least 5 characters'),
  message: yup.string().required('Message is required').min(10, 'Message must be at least 10 characters'),
  category: yup.string().required('Please select a category')
})

const ContactForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      category: 'General'
    }
  })

  const submitContactMutation = useMutation(
    (data) => api.post('/contact', data),
    {
      onSuccess: () => {
        toast.success('Message sent successfully! I\'ll get back to you soon.')
        reset()
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to send message')
      },
      onSettled: () => {
        setIsSubmitting(false)
      }
    }
  )

  const onSubmit = async (data) => {
    setIsSubmitting(true)
    submitContactMutation.mutate(data)
  }

  const categories = [
    { value: 'General', label: 'General Inquiry' },
    { value: 'Business', label: 'Business Opportunity' },
    { value: 'Collaboration', label: 'Collaboration' },
    { value: 'Support', label: 'Support' },
    { value: 'Other', label: 'Other' }
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="bg-white rounded-lg shadow-lg p-8"
    >
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-secondary-900 mb-2">Send a Message</h2>
        <p className="text-secondary-600">
          I'd love to hear from you. Send me a message and I'll respond as soon as possible.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Name & Email */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-secondary-700 mb-2">
              Name *
            </label>
            <input
              type="text"
              id="name"
              {...register('name')}
              className={`input ${errors.name ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
              placeholder="Your full name"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-secondary-700 mb-2">
              Email *
            </label>
            <input
              type="email"
              id="email"
              {...register('email')}
              className={`input ${errors.email ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
              placeholder="your.email@example.com"
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
            )}
          </div>
        </div>

        {/* Category */}
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-secondary-700 mb-2">
            Category *
          </label>
          <select
            id="category"
            {...register('category')}
            className={`input ${errors.category ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
          >
            {categories.map((category) => (
              <option key={category.value} value={category.value}>
                {category.label}
              </option>
            ))}
          </select>
          {errors.category && (
            <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>
          )}
        </div>

        {/* Subject */}
        <div>
          <label htmlFor="subject" className="block text-sm font-medium text-secondary-700 mb-2">
            Subject *
          </label>
          <input
            type="text"
            id="subject"
            {...register('subject')}
            className={`input ${errors.subject ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
            placeholder="What's this about?"
          />
          {errors.subject && (
            <p className="mt-1 text-sm text-red-600">{errors.subject.message}</p>
          )}
        </div>

        {/* Message */}
        <div>
          <label htmlFor="message" className="block text-sm font-medium text-secondary-700 mb-2">
            Message *
          </label>
          <textarea
            id="message"
            rows={6}
            {...register('message')}
            className={`textarea ${errors.message ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
            placeholder="Tell me about your project, question, or how I can help you..."
          />
          {errors.message && (
            <p className="mt-1 text-sm text-red-600">{errors.message.message}</p>
          )}
        </div>

        {/* Submit Button */}
        <div>
          <button
            type="submit"
            disabled={isSubmitting}
            className={`btn btn-primary w-full flex items-center justify-center space-x-2 ${
              isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {isSubmitting ? (
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                <span>Sending...</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <PaperAirplaneIcon className="w-5 h-5" />
                <span>Send Message</span>
              </div>
            )}
          </button>
        </div>
      </form>

      {/* Additional Info */}
      <div className="mt-8 pt-8 border-t border-secondary-200">
        <div className="text-sm text-secondary-600">
          <p className="mb-2">
            <strong>Response Time:</strong> I typically respond within 24-48 hours.
          </p>
          <p className="mb-2">
            <strong>Preferred Contact:</strong> For urgent matters, you can also reach me on{' '}
            <a href={SOCIAL_LINKS.LINKEDIN} className="text-primary-600 hover:underline" target="_blank" rel="noopener noreferrer">
              LinkedIn
            </a>.
          </p>
        </div>
      </div>
    </motion.div>
  )
}

export default ContactForm