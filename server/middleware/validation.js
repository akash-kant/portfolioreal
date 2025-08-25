const Joi = require('joi');

const validateRequest = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message
      });
    }
    next();
  };
};

// Validation schemas
const schemas = {
  register: Joi.object({
    name: Joi.string().min(2).max(50).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required()
  }),
  
  login: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
  }),
  
  blog: Joi.object({
    title: Joi.string().min(5).max(200).required(),
    excerpt: Joi.string().min(10).max(300).required(),
    content: Joi.string().min(50).required(),
    category: Joi.string().valid('Technical', 'Career', 'Tutorials', 'Tips', 'Industry News').required(),
    tags: Joi.array().items(Joi.string()),
    isPublished: Joi.boolean()
  }),
  
  project: Joi.object({
    title: Joi.string().min(3).max(100).required(),
    description: Joi.string().min(10).max(500).required(),
    technologies: Joi.array().items(Joi.string()).min(1).required(),
    category: Joi.string().valid('Web Development', 'Mobile App', 'AI/ML', 'Data Science', 'DevOps', 'Other').required(),
    demoUrl: Joi.string().uri().allow(''),
    githubUrl: Joi.string().uri().allow('')
  }),
  
  contact: Joi.object({
    name: Joi.string().min(2).max(50).required(),
    email: Joi.string().email().required(),
    subject: Joi.string().min(5).max(200).required(),
    message: Joi.string().min(10).max(1000).required(),
    category: Joi.string().valid('General', 'Business', 'Collaboration', 'Support', 'Other')
  })
};

module.exports = { validateRequest, schemas };