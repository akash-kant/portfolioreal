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
import api from '../services/api';
import ProjectCard from '../components/projects/ProjectCard'
import BlogCard from '../components/blog/BlogCard'
import { SOCIAL_LINKS } from '../utils/constants'

const Home = () => {
  const [heroRef, heroInView] = useInView({ triggerOnce: true })
  const [aboutRef, aboutInView] = useInView({ triggerOnce: true, threshold: 0.3 })
  const [projectsRef, projectsInView] = useInView({ triggerOnce: true, threshold: 0.3 })
  const [experienceRef, experienceInView] = useInView({ triggerOnce: true, threshold: 0.3 })

  const { data: projects } = useQuery(
    'featuredProjects',
    () => api.get('/projects?featured=true&limit=3').then(res => res.data.data),
    { refetchOnWindowFocus: false }
  );
  const { data: blogs } = useQuery(
    'latestBlogs',
    () => api.get('/blog?limit=3').then(res => res.data.data),
    { refetchOnWindowFocus: false }
  );
  
  const whatIDo = [
    { name: 'Full-Stack Apps', icon: '⚛️', description: 'Building end-to-end applications with React, Node.js/Express, and MongoDB, from APIs to polished UIs.' },
    { name: 'Backend APIs', icon: '🚀', description: 'Developing robust backend services in Java and Spring Boot with a focus on REST, security, and modular design.' },
    { name: 'Machine Learning', icon: '🧠', description: 'Creating practical ML prototypes using Python and scikit‑learn/TensorFlow, including data cleaning and evaluation.' },
    { name: 'Community Building', icon: '🤝', description: 'Founder of Coding Mirchi, building tools like an ATS checker, job board, and coding challenges for students.' },
  ]

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section
        ref={heroRef}
        className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-purple-50 overflow-hidden"
      >
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-72 h-72 bg-primary-500 rounded-full mix-blend-multiply filter blur-xl animate-float"></div>
          <div className="absolute top-10 right-10 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl animate-float" style={{ animationDelay: '2s' }}></div>
          <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl animate-float" style={{ animationDelay: '4s' }}></div>
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
              <span className="text-secondary-900">Full‑Stack Developer</span>
              <br />
              <span className="gradient-text">MERN & Java/Spring Boot</span>
            </h1>

            <p className="text-xl md:text-2xl text-secondary-600 mb-8 max-w-3xl mx-auto">
              Building scalable web apps, ML-driven solutions, and community platforms that help students land jobs and grow skills.
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
              <a href={SOCIAL_LINKS.GITHUB} target="_blank" rel="noopener noreferrer" className="hover:text-primary-600 transition-colors">
                💻 GitHub
              </a>
              <a href={SOCIAL_LINKS.LINKEDIN} target="_blank" rel="noopener noreferrer" className="hover:text-primary-600 transition-colors">
                💼 LinkedIn
              </a>
              <a href={SOCIAL_LINKS.YOUTUBE} target="_blank" rel="noopener noreferrer" className="hover:text-primary-600 transition-colors">
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
      <section id="about" ref={aboutRef} className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={aboutInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-secondary-900 mb-6">
              About Me
            </h2>
            <p className="text-xl text-secondary-600 max-w-3xl mx-auto">
              I am a Computer Science graduate from VIT Bhopal with hands-on experience in React, Node.js, Java, and Spring Boot, delivering end‑to‑end products from APIs to polished UIs. I founded Coding Mirchi Community, building an ATS Resume Checker, a Tech Job Board, and Friday Coding Challenge platform, while driving product strategy and growth. My recent work includes an e‑commerce app (React/Node/MongoDB) and ML projects for Alzheimer’s and heart disease prediction with strong data preprocessing and model tuning.
            </p>
          </motion.div>
        </div>
      </section>

      {/* What I Do Section */}
      <section className="py-20 bg-secondary-50">
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
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            {whatIDo.map((skill, index) => (
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
        </div>
      </section>
      
      {/* Featured Projects */}
      <section ref={projectsRef} className="py-20 bg-white">
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
              A showcase of my recent work, from full-stack applications to machine learning models.
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
              <p className="text-secondary-500 mb-4">No featured projects available at the moment.</p>
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

      {/* Latest Blog Posts */}
      {blogs && blogs.length > 0 && (
        <section className="py-20 bg-secondary-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-secondary-900 mb-6">
                Latest From The Blog
              </h2>
              <p className="text-xl text-secondary-600 max-w-3xl mx-auto">
                Insights, tutorials, and career advice for developers.
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
            Let's Build Something Great Together
          </h2>
          <p className="text-xl text-primary-100 mb-8 max-w-3xl mx-auto">
            I'm open to Software Engineer, Full‑Stack, and Backend roles. Let’s collaborate on impactful developer tools and learning platforms.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/contact" className="btn bg-white text-primary-600 hover:bg-primary-50 text-lg px-8 py-3">
              Get In Touch
            </Link>
            <Link to="/projects" className="btn border-white text-white hover:bg-white hover:text-primary-600 text-lg px-8 py-3">
              View My Work
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Home