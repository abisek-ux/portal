import express from 'express';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';
import { User, safe, matchPassword } from '../src/db.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });

// @route  POST /api/auth/register
router.post(
  '/register',
  [
    body('name').notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email required'),
    body('password').isLength({ min: 6 }).withMessage('Password min 6 characters'),
    body('role').isIn(['student', 'academician', 'industry', 'admin']).withMessage('Invalid role'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { name, email, password, role, ...rest } = req.body;

    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: 'User already exists, please login' });

    const user = await User.create({ name, email, password, role, ...rest });
    res.status(201).json({
      token: generateToken(user._id),
      user: safe(user),
    });
  }
);

// @route  POST /api/auth/login
router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Valid email required'),
    body('password').notEmpty().withMessage('Password required'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await matchPassword(user, password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    res.json({
      token: generateToken(user._id),
      user: safe(user),
    });
  }
);

// @route  GET /api/auth/me
router.get('/me', protect, async (req, res) => {
  res.json({ user: req.user });
});

// @route  PUT /api/auth/profile
router.put('/profile', protect, async (req, res) => {
  const fields = [
    'phone', 'location', 'college', 'branch', 'year', 'degree',
    'facultyDepartment', 'designation', 'expertise', 'company',
    'industrySector', 'description', 'website', 'institution',
    'skills', 'interests', 'resumeUrl',
  ];
  try {
    const user = await User.findById(req.user._id);
    let updated = false;
    for (const f of fields) {
      if (req.body[f] !== undefined) {
        user[f] = req.body[f];
        updated = true;
      }
    }
    if (updated) {
      user.profileProgress = calculateProgress(user);
      await User.save(user);
    }
    res.json({ user: safe(user) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

function calculateProgress(user) {
  const checks = [
    Boolean(user.college || user.company || user.institution),
    Boolean(user.location),
    Boolean(user.phone),
    (user.skills || []).length > 0,
    (user.interests || []).length > 0,
  ];
  const done = checks.filter(Boolean).length;
  return Math.round((done / checks.length) * 100);
}

export default router;