import express from 'express';
import { Application, Internship, populate } from '../src/db.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// @route  GET /api/applications/my  -> student/academician: my applications with tracking
router.get('/my', protect, async (req, res) => {
  const applications = await Application.find(
    { applicant: req.user._id },
    { sort: { createdAt: -1 } }
  );
  await populate(applications, [
    { field: 'internship', collection: 'internships', select: 'title companyName type status stipend duration location category' },
  ]);
  res.json({ applications });
});

// @route  GET /api/applications/internship/:id  -> industry: applicants for one of my posts
router.get('/internship/:id', protect, async (req, res) => {
  const internship = await Internship.findById(req.params.id);
  if (!internship) return res.status(404).json({ message: 'Not found' });
  if (internship.company.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Not authorized' });
  }
  const applications = await Application.find({ internship: internship._id });
  await populate(applications, [
    { field: 'applicant', collection: 'users', select: 'name email college branch degree year skills location' },
  ]);
  res.json({ applications });
});

// @route  PUT /api/applications/:id/status  -> industry updates application status + progress + feedback
router.put('/:id/status', protect, async (req, res) => {
  const app = await Application.findById(req.params.id);
  if (!app) return res.status(404).json({ message: 'Application not found' });

  const internship = await Internship.findById(app.internship);
  if (!internship || (internship.company.toString() !== req.user._id.toString() && req.user.role !== 'admin')) {
    return res.status(403).json({ message: 'Not authorized' });
  }

  const { status, progress, feedback, rating } = req.body;
  if (status) app.status = status;
  if (progress !== undefined) app.progress = Math.min(100, Math.max(0, progress));
  if (feedback !== undefined) app.feedback = feedback;
  if (rating !== undefined) app.rating = rating;
  if (status === 'Completed') app.completionDate = new Date().toISOString();
  await Application.save(app);
  res.json({ application: app });
});

export default router;