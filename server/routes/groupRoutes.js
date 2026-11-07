const express = require('express');
const {
  createGroup,
  getMyGroups,
  getGroupById,
  joinGroupByCode,
  leaveGroup,
} = require('../controllers/groupController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.post('/', createGroup);
router.get('/', getMyGroups);
router.post('/join', joinGroupByCode);
router.get('/:id', getGroupById);
router.post('/:id/leave', leaveGroup);

module.exports = router;
