const express = require('express');
const {
  getResources,
  getResource,
  createResource,
  updateResource,
  deleteResource,
  addRating
} = require('../controllers/resourceController');
const { protect, authorize } = require('../middleware/auth');
const { uploadImage, uploadDocument } = require('../middleware/upload');

const router = express.Router();

const uploadFiles = (req, res, next) => {
  const upload = uploadDocument.fields([
    { name: 'document', maxCount: 1 },
    { name: 'images', maxCount: 3 }
  ]);
  upload(req, res, next);
};

router.route('/')
  .get(getResources)
  .post(protect, authorize('admin'), uploadFiles, createResource);

router.route('/:id')
  .get(getResource)
  .put(protect, authorize('admin'), uploadFiles, updateResource)
  .delete(protect, authorize('admin'), deleteResource);

router.post('/:id/rating', protect, addRating);

module.exports = router;