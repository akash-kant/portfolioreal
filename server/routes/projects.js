const express = require('express');
const {
  getProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
  toggleLike
} = require('../controllers/projectController');
const { protect, authorize } = require('../middleware/auth');
const { uploadImage } = require('../middleware/upload');
const { validateRequest, schemas } = require('../middleware/validation');

const router = express.Router();

router.route('/')
  .get(getProjects)
  .post(protect, authorize('admin'), uploadImage.array('images', 5), validateRequest(schemas.project), createProject);

router.route('/:id')
  .get(getProject)
  .put(protect, authorize('admin'), uploadImage.array('images', 5), updateProject)
  .delete(protect, authorize('admin'), deleteProject);

router.put('/:id/like', protect, toggleLike);

module.exports = router;