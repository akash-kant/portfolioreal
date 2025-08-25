const Blog = require('../models/Blog');
const cloudinary = require('../config/cloudinary');

// @desc    Get all blogs
// @route   GET /api/blog
// @access  Public
const getBlogs = async (req, res) => {
  try {
    let query = Blog.find({ isPublished: true });

    // Filtering
    const { category, tag, search } = req.query;
    
    if (category) {
      query = query.where('category').equals(category);
    }
    
    if (tag) {
      query = query.where('tags').in([tag]);
    }
    
    if (search) {
      query = query.where({
        $or: [
          { title: { $regex: search, $options: 'i' } },
          { excerpt: { $regex: search, $options: 'i' } },
          { content: { $regex: search, $options: 'i' } }
        ]
      });
    }

    // Sorting
    const sortBy = req.query.sort || '-createdAt';
    query = query.sort(sortBy);

    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const total = await Blog.countDocuments(query.getQuery());

    query = query.skip(startIndex).limit(limit).populate('author', 'name avatar');

    const blogs = await query;

    // Pagination result
    const pagination = {};

    if (endIndex < total) {
      pagination.next = {
        page: page + 1,
        limit
      };
    }

    if (startIndex > 0) {
      pagination.prev = {
        page: page - 1,
        limit
      };
    }

    res.status(200).json({
      success: true,
      count: blogs.length,
      total,
      pagination,
      data: blogs
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};

// @desc    Get single blog
// @route   GET /api/blog/:id
// @access  Public
const getBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id).populate('author', 'name avatar');

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found'
      });
    }

    // Increment views
    blog.views += 1;
    await blog.save({ validateBeforeSave: false });

    res.status(200).json({
      success: true,
      data: blog
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};

// @desc    Create new blog
// @route   POST /api/blog
// @access  Private (Admin)
const createBlog = async (req, res) => {
  try {
    // Add user to req.body
    req.body.author = req.user.id;

    // Handle cover image upload
    if (req.file) {
      req.body.coverImage = req.file.path;
    }

    const blog = await Blog.create(req.body);

    res.status(201).json({
      success: true,
      data: blog
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};

// @desc    Update blog
// @route   PUT /api/blog/:id
// @access  Private (Admin)
const updateBlog = async (req, res) => {
  try {
    let blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found'
      });
    }

    // Handle cover image upload
    if (req.file) {
      req.body.coverImage = req.file.path;
    }

    blog = await Blog.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: blog
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};

// @desc    Delete blog
// @route   DELETE /api/blog/:id
// @access  Private (Admin)
const deleteBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found'
      });
    }

    await blog.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Blog deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};

// @desc    Like/Unlike blog
// @route   PUT /api/blog/:id/like
// @access  Private
const toggleLike = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found'
      });
    }

    const isLiked = blog.likes.includes(req.user.id);

    if (isLiked) {
      blog.likes = blog.likes.filter(like => like.toString() !== req.user.id);
    } else {
      blog.likes.push(req.user.id);
    }

    await blog.save();

    res.status(200).json({
      success: true,
      data: {
        likes: blog.likes.length,
        isLiked: !isLiked
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};

module.exports = {
  getBlogs,
  getBlog,
  createBlog,
  updateBlog,
  deleteBlog,
  toggleLike
};
