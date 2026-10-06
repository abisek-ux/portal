import express from 'express';
import { LearningProgram } from '../src/db.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// @route  GET /api/programs  -> list open learning programs (students)
router.get('/', protect, async (req, res) => {
  const filter = {};
  if (req.user.role === 'industry') filter.company = req.user._id;
  const programs = await LearningProgram.find(filter, { sort: { createdAt: -1 }, limit: 60 });
  res.json({ programs });
});

// @route  POST /api/programs  -> industry creates a learning program
router.post('/', protect, async (req, res) => {
  if (!['industry', 'admin'].includes(req.user.role)) {
    return res.status(403).json({ message: 'Only industry can create programs' });
  }
  const program = await LearningProgram.create({
    ...req.body,
    company: req.user._id,
    companyName: req.user.company || req.user.name,
  });
  res.status(201).json({ program });
});

// @route  POST /api/programs/:id/enroll  -> student enrolls
router.post('/:id/enroll', protect, async (req, res) => {
  if (req.user.role !== 'student') return res.status(403).json({ message: 'Only students can enroll' });

  const program = await LearningProgram.findById(req.params.id);
  if (!program) return res.status(404).json({ message: 'Program not found' });
  if (program.status === 'Closed') return res.status(400).json({ message: 'Program closed' });
  if (program.enrolledStudents && program.enrolledStudents.includes(req.user._id)) {
    return res.status(400).json({ message: 'Already enrolled' });
  }
  if ((program.enrolledStudents || []).length >= program.maxSeats) {
    return res.status(400).json({ message: 'Program full' });
  }

  program.enrolledStudents = [...(program.enrolledStudents || []), req.user._id];
  await LearningProgram.save(program);
  res.json({ program });
});

export default router;