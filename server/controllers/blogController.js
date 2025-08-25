const Blog = require('../models/Blog');

// GET /api/blog
const getBlogs = async (req, res) => {
  try {
    let query = Blog.find({ isPublished: true });

    const { category, tag, search, limit, page, sort } = req.query;

    if (category) query = query.where('category').equals(category);
    if (tag) query = query.where('tags').in([tag]);
    if (search) {
      query = query.where({
        $or: [
          { title: { $regex: search, $options: 'i' } },
          { excerpt: { $regex: search, $options: 'i' } },
          { content: { $regex: search, $options: 'i' } },
        ],
      });
    }

    query = query.sort(sort || '-createdAt');

    const pg = parseInt(page, 10) || 1;
    const lim = parseInt(limit, 10) || 10;
    const skip = (pg - 1) * lim;

    const total = await Blog.countDocuments(query.getQuery());
    const blogs = await query.skip(skip).limit(lim).populate('author', 'name avatar');

    const pagination = {};
    if (skip + blogs.length < total) pagination.next = { page: pg + 1, limit: lim };
    if (skip > 0) pagination.prev = { page: pg - 1, limit: lim };

    res.status(200).json({ success: true, count: blogs.length, total, pagination, data: blogs });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// GET /api/blog/:idOrSlug
const getBlog = async (req, res) => {
  try {
    const param = req.params.id;
    const byId = await Blog.findById(param).populate('author', 'name avatar').catch(() => null);
    const blog = byId || (await Blog.findOne({ slug: param }).populate('author', 'name avatar'));

    if (!blog || !blog.isPublished) {
      return res.status(404).json({ success: false, message: 'Blog not found' });
    }

    blog.views += 1;
    await blog.save({ validateBeforeSave: false });

    res.status(200).json({ success: true, data: blog });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

const createBlog = async (req, res) => {
  try {
    req.body.author = req.user.id;
    if (req.file) req.body.coverImage = req.file.path;

    const blog = await Blog.create(req.body);
    res.status(201).json({ success: true, data: blog });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

const updateBlog = async (req, res) => {
  try {
    let blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ success: false, message: 'Blog not found' });

    if (req.file) req.body.coverImage = req.file.path;

    blog = await Blog.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    res.status(200).json({ success: true, data: blog });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

const deleteBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ success: false, message: 'Blog not found' });
    await blog.deleteOne();
    res.status(200).json({ success: true, message: 'Blog deleted successfully' });
  } catch {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

const toggleLike = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ success: false, message: 'Blog not found' });

    const idx = blog.likes.findIndex((u) => u.toString() === req.user.id);
    if (idx >= 0) blog.likes.splice(idx, 1);
    else blog.likes.push(req.user.id);

    await blog.save();
    res.status(200).json({ success: true, data: { likes: blog.likes.length, isLiked: idx < 0 } });
  } catch {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

module.exports = { getBlogs, getBlog, createBlog, updateBlog, deleteBlog, toggleLike };
