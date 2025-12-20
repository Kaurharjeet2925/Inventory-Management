const router = require('express').Router();
const auth = require('../middleware/auth');
const { getNotifications, markRead, markAllRead } = require('../controller/notification.controller');

// Mounted at /api/notifications
router.get('/', auth, getNotifications);
router.put('/:id/read', auth, markRead);
router.put('/mark-all-read', auth, markAllRead);

module.exports = router;