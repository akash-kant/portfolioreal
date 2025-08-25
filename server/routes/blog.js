const express = require('express');
const { getBlogs, getBlog, createBlog, updateBlog, deleteBlog, toggleLike } = require('../controllers/blogController');
const { protect, authorize } = require('../middleware/auth');
const { uploadImage } = require('../middleware/upload');
const { validateRequest, schemas } = require('../middleware/validation');

const router = express.Router();

router
  .route('/')
  .get(getBlogs)
  .post(protect, authorize('admin'), uploadImage.single('coverImage'), validateRequest(schemas.blog), createBlog);

// Accepts either Mongo ObjectId or slug in :id
router
  .route('/:id')
  .get(getBlog)
  .put(protect, authorize('admin'), uploadImage.single('coverImage'), updateBlog)
  .delete(protect, authorize('admin'), deleteBlog);

router.put('/:id/like', protect, toggleLike);

module.exports = router;
