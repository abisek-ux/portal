import express from 'express';
import { User, Application, safe, populate } from '../src/db.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// @route  GET /api/portfolio/:userId  -> public digital portfolio
router.get('/:userId', async (req, res) => {
  const user = await User.findById(req.params.userId);
  if (!user || user.role !== 'student') return res.status(404).json({ message: 'Student not found' });

  const completed = await Application.find({
    applicant: user._id,
    status: 'Completed',
  });
  await populate(completed, [
    { field: 'internship', collection: 'internships', select: 'title companyName type category' },
  ]);

  const certifications = completed
    .filter((a) => a.internship)
    .map((a) => ({
      name: a.internship.title,
      issuer: a.internship.companyName,
      date: a.completionDate,
      verified: true,
    }));

  res.json({
    portfolio: {
      name: user.name,
      college: user.college,
      branch: user.branch,
      degree: user.degree,
      email: user.email,
      location: user.location,
      skills: user.skills || [],
      interests: user.interests || [],
      certifications,
      internships: completed.filter((a) => a.internship).map((a) => a.internship),
      resumeUrl: user.resumeUrl,
    },
  });
});

// @route  PUT /api/portfolio/resume  -> student uploads/links resume
router.put('/resume', protect, async (req, res) => {
  const user = await User.findById(req.user._id);
  user.resumeUrl = req.body.resumeUrl || '';
  await User.save(user);
  res.json({ resumeUrl: user.resumeUrl });
});

export default router;