const express = require('express');

const router = express.Router();


const { protect } = require('../middleware/authMiddleware');

const upload = require('../middleware/uploadMiddleware');

const { uploadProfile } = require('../controllers/uploadController');


// upload profile image

router.post(
    '/profile',
    protect,
    upload.single('image'),
    uploadProfile
);


module.exports = router;