const express = require('express');
const {
  submitContact,
  getContacts,
  updateContactStatus,
  replyToContact
} = require('../controllers/contactController');
const { protect, authorize } = require('../middleware/auth');
const { validateRequest, schemas } = require('../middleware/validation');

const router = express.Router();

router.route('/')
  .post(validateRequest(schemas.contact), submitContact)
  .get(protect, authorize('admin'), getContacts);

router.put('/:id/status', protect, authorize('admin'), updateContactStatus);
router.post('/:id/reply', protect, authorize('admin'), replyToContact);

module.exports = router;
