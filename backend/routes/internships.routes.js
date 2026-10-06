import express from 'express';
import { Internship, Application, User, populate } from '../src/db.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// @route  GET /api/internships  -> browse open internships (students) or own posts (industry)
router.get('/', protect, async (req, res) => {
  const { q, category, type, mode, location, forAcademician } = req.query;

  const filter = {};

  if (req.user.role === 'industry') {
    filter.company = req.user._id;
  } else if (forAcademician === 'true') {
    filter.isInternshipForAcademician = true;
  } else {
    // Students see student opportunities, academicians see academician ones
    filter.isInternshipForAcademician =
      req.user.role === 'academician' ? true : false;
  }

  if (category) filter.category = category;
  if (type) filter.type = type;
  if (mode) filter.mode = mode;
  if (location) filter.location = { $regex: location, $options: 'i' };
  if (q) {
    filter.$or = [
      { title: { $regex: q, $options: 'i' } },
      { companyName: { $regex: q, $options: 'i' } },
      { description: { $regex: q, $options: 'i' } },
    ];
  }

  const internships = await Internship.find(filter, { sort: { createdAt: -1 }, limit: 60 });
  res.json({ internships });
});

// @route  POST /api/internships  -> industry posts an internship/academic program
router.post('/', protect, async (req, res) => {
  if (!['industry', 'admin'].includes(req.user.role)) {
    return res.status(403).json({ message: 'Only industry can post opportunities' });
  }
  const data = { ...req.body, company: req.user._id, companyName: req.user.company || req.user.name };
  const internship = await Internship.create(data);
  res.status(201).json({ internship });
});

// @route  GET /api/internships/:id
router.get('/:id', protect, async (req, res) => {
  const internship = await Internship.findById(req.params.id);
  if (!internship) return res.status(404).json({ message: 'Not found' });
  await populate([internship], [{ field: 'company', collection: 'users', select: 'name company location website' }]);
  res.json({ internship });
});

// @route  PUT /api/internships/:id  -> edit own post
router.put('/:id', protect, async (req, res) => {
  const internship = await Internship.findById(req.params.id);
  if (!internship) return res.status(404).json({ message: 'Not found' });
  if (internship.company.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Not authorized' });
  }
  Object.assign(internship, req.body);
  await Internship.save(internship);
  res.json({ internship });
});

// @route  POST /api/internships/:id/apply
router.post('/:id/apply', protect, async (req, res) => {
  if (!['student', 'academician'].includes(req.user.role)) {
    return res.status(403).json({ message: 'Only students/academicians can apply' });
  }
  const internship = await Internship.findById(req.params.id);
  if (!internship) return res.status(404).json({ message: 'Internship not found' });
  if (internship.status === 'Closed') return res.status(400).json({ message: 'Internship closed' });

  const existing = await Application.findOne({ internship: internship._id, applicant: req.user._id });
  if (existing) return res.status(400).json({ message: 'You already applied to this opportunity' });

  const application = await Application.create({
    internship: internship._id,
    applicant: req.user._id,
    applicantType: req.user.role,
    coverLetter: req.body.coverLetter || '',
    relevantSkills: req.body.relevantSkills || (req.user.skills || []).map((s) => s.name),
  });

  internship.applicationsCount = (internship.applicationsCount || 0) + 1;
  await Internship.save(internship);
  res.status(201).json({ application });
});

export default router;