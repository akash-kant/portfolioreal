import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { useInView } from 'react-intersection-observer'
import { 
  ArrowDownIcon, 
  CodeBracketIcon, 
  ChatBubbleLeftRightIcon,
  AcademicCapIcon,
  BriefcaseIcon
} from '@heroicons/react/24/outline'
import { useQuery } from 'react-query'
import api from '../services/api'; // Correctly import the api service
// Corrected Imports:
import ProjectCard from '../components/projects/ProjectCard' 
import BlogCard from '../components/blog/BlogCard'

const Home = () => {
  const [heroRef, heroInView] = useInView({ triggerOnce: true })
  const [aboutRef, aboutInView] = useInView({ triggerOnce: true, threshold: 0.3 })
  const [projectsRef, projectsInView] = useInView({ triggerOnce: true, threshold: 0.3 })

  // Fetch featured projects
const { data: projects } = useQuery(
  'featuredProjects',
  () => api.get('/projects?featured=true&limit=3').then(res => res.data.data),
  { refetchOnWindowFocus: false }
)

// Corrected useQuery for latest blog posts
const { data: blogs } = useQuery(
  'latestBlogs',
  () => api.get('/blog?limit=3').then(res => res.data.data),
  { refetchOnWindowFocus: false }
)

  const skills = [
    { name: 'Frontend', icon: '⚛️', description: 'React, Vue, Angular' },
    { name: 'Backend', icon: '🚀', description: 'Node.js, Python, Java' },
    { name: 'Mobile', icon: '📱', description: 'React Native, Flutter' },
    { name: 'Cloud', icon: '☁️', description: 'AWS, Azure, GCP' },
  ]

  const stats = [
    { label: 'Projects Completed', value: '50+' },
    { label: 'Blog Posts', value: '100+' },
    { label: 'Students Mentored', value: '500+' },
    { label: 'Years Experience', value: '5+' }
  ]

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section
        ref={heroRef}
        className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-purple-50 overflow-hidden"
      >
        {/* Background decoration */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-72 h-72 bg-primary-500 rounded-full mix-blend-multiply filter blur-xl animate-float"></div>
          <div className="absolute top-10 right-10 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl animate-float" style={{animationDelay: '2s'}}></div>
          <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl animate-float" style={{animationDelay: '4s'}}></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={heroInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8 }}
          >
            <motion.img
              src="/images/profile.jpg"
              alt="Profile"
              className="w-32 h-32 rounded-full mx-auto mb-8 border-4 border-white shadow-xl"
              initial={{ scale: 0 }}
              animate={heroInView ? { scale: 1 } : {}}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            />

            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6">
              <span className="text-secondary-900">Building Projects,</span>
              <br />
              <span className="gradient-text">Sharing Knowledge</span>
            </h1>

            <p className="text-xl md:text-2xl text-secondary-600 mb-8 max-w-3xl mx-auto">
              Full-stack developer and content creator helping others build better software and grow their careers
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
              <Link to="/projects" className="btn btn-primary text-lg px-8 py-3">
                View My Work
              </Link>
              <Link to="/contact" className="btn btn-outline text-lg px-8 py-3">
                Get In Touch
              </Link>
            </div>

            <div className="flex items-center justify-center space-x-6 text-sm text-secondary-500">
              <a href="/resume.pdf" target="_blank" className="hover:text-primary-600 transition-colors">
                📄 Resume
              </a>
              <a href="https://github.com/yourusername" target="_blank" className="hover:text-primary-600 transition-colors">
                💻 GitHub
              </a>
              <a href="https://linkedin.com/in/yourusername" target="_blank" className="hover:text-primary-600 transition-colors">
                💼 LinkedIn
              </a>
              <a href="https://youtube.com/@yourchannel" target="_blank" className="hover:text-primary-600 transition-colors">
                🎥 YouTube
              </a>
            </div>
          </motion.div>

          <motion.div
            className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
            animate={{ y: [0, -10, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
          >
            <ArrowDownIcon className="w-6 h-6 text-secondary-400" />
          </motion.div>
        </div>
      </section>

      {/* About Section */}
      <section ref={aboutRef} className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={aboutInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-secondary-900 mb-6">
              What I Do
            </h2>
            <p className="text-xl text-secondary-600 max-w-3xl mx-auto">
              I'm passionate about creating innovative solutions and helping others succeed in their developer journey
            </p>
          </motion.div>

          {/* Skills Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            {skills.map((skill, index) => (
              <motion.div
                key={skill.name}
                initial={{ opacity: 0, y: 30 }}
                animate={aboutInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                className="text-center group hover:transform hover:scale-105 transition-transform duration-300"
              >
                <div className="text-6xl mb-4 group-hover:animate-bounce">{skill.icon}</div>
                <h3 className="text-xl font-semibold text-secondary-900 mb-2">{skill.name}</h3>
                <p className="text-secondary-600">{skill.description}</p>
              </motion.div>
            ))}
          </div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={aboutInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-8"
          >
            {stats.map((stat, index) => (
              <div key={stat.label} className="text-center">
                <div className="text-4xl md:text-5xl font-bold text-primary-600 mb-2">
                  {stat.value}
                </div>
                <div className="text-secondary-600">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Featured Projects */}
      <section ref={projectsRef} className="py-20 bg-secondary-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={projectsInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-secondary-900 mb-6">
              Featured Projects
            </h2>
            <p className="text-xl text-secondary-600 max-w-3xl mx-auto">
              A showcase of my recent work and the technologies I love working with
            </p>
          </motion.div>

          {projects && projects.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
              {projects.map((project, index) => (
                <motion.div
                  key={project._id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={projectsInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.8, delay: index * 0.1 }}
                >
                  <ProjectCard project={project} />
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-secondary-500 mb-4">No featured projects available</p>
            </div>
          )}

          <motion.div
            initial={{ opacity: 0 }}
            animate={projectsInView ? { opacity: 1 } : {}}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="text-center"
          >
            <Link to="/projects" className="btn btn-outline text-lg px-8 py-3">
              View All Projects
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Services Preview */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-secondary-900 mb-6">
              How I Can Help You
            </h2>
            <p className="text-xl text-secondary-600 max-w-3xl mx-auto">
              Professional services to accelerate your career growth
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <div className="text-center p-6 rounded-lg hover:bg-secondary-50 transition-colors">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <BriefcaseIcon className="w-8 h-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold text-secondary-900 mb-2">Resume Reviews</h3>
              <p className="text-secondary-600 mb-4">Get your resume reviewed by industry experts</p>
              <span className="text-primary-600 font-semibold">Starting at ₹499</span>
            </div>

            <div className="text-center p-6 rounded-lg hover:bg-secondary-50 transition-colors">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <ChatBubbleLeftRightIcon className="w-8 h-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold text-secondary-900 mb-2">Mock Interviews</h3>
              <p className="text-secondary-600 mb-4">Practice with real interview scenarios</p>
              <span className="text-primary-600 font-semibold">Starting at ₹999</span>
            </div>

            <div className="text-center p-6 rounded-lg hover:bg-secondary-50 transition-colors">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AcademicCapIcon className="w-8 h-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold text-secondary-900 mb-2">Mentorship</h3>
              <p className="text-secondary-600 mb-4">1-on-1 career guidance and mentoring</p>
              <span className="text-primary-600 font-semibold">Starting at ₹1999</span>
            </div>
          </div>

          <div className="text-center">
            <Link to="/services" className="btn btn-primary text-lg px-8 py-3">
              View All Services
            </Link>
          </div>
        </div>
      </section>

      {/* Latest Blog Posts */}
      {blogs && blogs.length > 0 && (
        <section className="py-20 bg-secondary-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-secondary-900 mb-6">
                Latest From Blog
              </h2>
              <p className="text-xl text-secondary-600 max-w-3xl mx-auto">
                Insights, tutorials, and career advice for developers
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
              {blogs.map((blog, index) => (
                <motion.div
                  key={blog._id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: index * 0.1 }}
                >
                  <BlogCard blog={blog} />
                </motion.div>
              ))}
            </div>

            <div className="text-center">
              <Link to="/blog" className="btn btn-outline text-lg px-8 py-3">
                Read More Articles
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-20 bg-primary-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Start Your Journey?
          </h2>
          <p className="text-xl text-primary-100 mb-8 max-w-3xl mx-auto">
            Whether you need help with your projects, career guidance, or want to collaborate, I'm here to help you succeed.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/contact" className="btn bg-white text-primary-600 hover:bg-primary-50 text-lg px-8 py-3">
              Get In Touch
            </Link>
            <Link to="/services" className="btn border-white text-white hover:bg-white hover:text-primary-600 text-lg px-8 py-3">
              View Services
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Home