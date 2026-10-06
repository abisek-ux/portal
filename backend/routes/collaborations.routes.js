import express from 'express';
import { Collaboration } from '../src/db.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// @route  GET /api/collaborations  -> list collaborations (academicians see all for collaboration)
router.get('/', protect, async (req, res) => {
  const { type, status } = req.query;
  const filter = {};
  if (type) filter.type = type;
  if (status) filter.status = status;
  const items = await Collaboration.find(filter, { sort: { createdAt: -1 }, limit: 60 });
  res.json({ collaborations: items });
});

// @route  POST /api/collaborations  -> industry/academician/admin proposes collaboration
router.post('/', protect, async (req, res) => {
  if (!['industry', 'academician', 'admin'].includes(req.user.role)) {
    return res.status(403).json({ message: 'Not allowed' });
  }
  const collaboration = await Collaboration.create({
    ...req.body,
    proposedBy: req.user._id,
    proposerName: req.user.company || req.user.name,
    proposerRole: req.user.role,
  });
  res.status(201).json({ collaboration });
});

// @route  PUT /api/collaborations/:id/status  -> admin approves / sets ongoing / completed
router.put('/:id/status', protect, async (req, res) => {
  const item = await Collaboration.findById(req.params.id);
  if (!item) return res.status(404).json({ message: 'Not found' });
  if (!['admin'].includes(req.user.role)) {
    return res.status(403).json({ message: 'Only admin can change status' });
  }
  item.status = req.body.status;
  if (req.body.startDate) item.startDate = req.body.startDate;
  await Collaboration.save(item);
  res.json({ collaboration: item });
});

// @route  POST /api/collaborations/:id/join  -> academician/industry joins
router.post('/:id/join', protect, async (req, res) => {
  if (!['academician', 'industry'].includes(req.user.role)) {
    return res.status(403).json({ message: 'Not allowed' });
  }
  const item = await Collaboration.findById(req.params.id);
  if (!item) return res.status(404).json({ message: 'Not found' });
  if (!(item.participants || []).includes(req.user._id)) {
    item.participants = [...(item.participants || []), req.user._id];
    await Collaboration.save(item);
  }
  res.json({ collaboration: item });
});

export default router;