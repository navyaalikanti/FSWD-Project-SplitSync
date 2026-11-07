const express = require('express');
const {
  recordSettlement,
  getGroupSettlements,
} = require('../controllers/settlementController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.post('/', recordSettlement);
router.get('/group/:groupId', getGroupSettlements);

module.exports = router;
