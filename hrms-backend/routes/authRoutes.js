const express = require('express');
const router = express.Router();
const multer = require('multer');
const { signup, verifyEmail, login, getCompanyLogo } = require('../controllers/authController');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/logos/'),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});
const upload = multer({ storage });

router.post('/signup', upload.single('logo'), signup);
router.get('/verify/:token', verifyEmail);
router.post('/login', login);

router.get('/company-logo', getCompanyLogo);

module.exports = router;
