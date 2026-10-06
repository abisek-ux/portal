import express from 'express';
import { User, Skill, Internship, Application, LearningProgram, Collaboration, populate } from '../src/db.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// @route  GET /api/dashboard  -> role-specific analytics
router.get('/', protect, async (req, res) => {
  const u = req.user;

  if (u.role === 'student') {
    const applications = await Application.find({ applicant: u._id }, { sort: { createdAt: -1 } });
    await populate(applications, [{ field: 'internship', collection: 'internships' }]);
    const statusCounts = {};
    applications.forEach((a) => {
      statusCounts[a.status] = (statusCounts[a.status] || 0) + 1;
    });
    const programs = await LearningProgram.find({ enrolledStudents: { $in: [u._id] } });
    const openInternships = await Internship.countDocuments({ status: 'Open', isInternshipForAcademician: false });

    return res.json({
      dashboard: {
        appliedCount: applications.length,
        openInternships,
        enrolledPrograms: programs.length,
        statusCounts,
        profileProgress: u.profileProgress || 0,
        skillCount: u.skills?.length || 0,
        recentApplications: applications.slice(-5),
      },
    });
  }

  if (u.role === 'industry') {
    const postings = await Internship.find({ company: u._id });
    const allApps = await Application.find({
      internship: { $in: postings.map((p) => p._id) },
    });
    const programs = await LearningProgram.find({ company: u._id });
    const statusCounts = {};
    allApps.forEach((a) => {
      statusCounts[a.status] = (statusCounts[a.status] || 0) + 1;
    });

    return res.json({
      dashboard: {
        totalPostings: postings.length,
        totalApplications: allApps.length,
        totalPrograms: programs.length,
        statusCounts,
        postings,
      },
    });
  }

  if (u.role === 'academician') {
    const internships = await Internship.countDocuments({ isInternshipForAcademician: true, status: 'Open' });
    const applications = await Application.find({ applicant: u._id });
    const collaborations = await Collaboration.find({
      $or: [{ proposedBy: u._id }, { participants: { $in: [u._id] } }],
    });

    return res.json({
      dashboard: {
        openAcademicOpportunities: internships,
        myApplications: applications.length,
        myCollaborations: collaborations.length,
        collaborations,
      },
    });
  }

  // Admin / Institution analytics
  const totalStudents = await User.countDocuments({ role: 'student' });
  const totalIndustry = await User.countDocuments({ role: 'industry' });
  const totalAcademic = await User.countDocuments({ role: 'academician' });
  const totalInternships = await Internship.countDocuments();
  const openInternships = await Internship.countDocuments({ status: 'Open' });
  const totalApplications = await Application.countDocuments();
  const placedStudents = await Application.distinct('applicant', { status: 'Selected' });
  const completedApps = await Application.find({ status: 'Completed' });
  const programs = await LearningProgram.countDocuments();
  const collaborations = await Collaboration.countDocuments();

  const placedApps = await Application.find({ status: { $in: ['Selected', 'Completed'] } });
  const branchMap = {};
  for (const a of placedApps) {
    const student = await User.findById(a.applicant);
    const b = (student && student.branch) || 'Not specified';
    branchMap[b] = (branchMap[b] || 0) + 1;
  }
  const placementByBranch = Object.entries(branchMap).map(([_id, count]) => ({ _id, count }));

  return res.json({
    dashboard: {
      totalStudents,
      totalIndustry,
      totalAcademic,
      totalInternships,
      openInternships,
      totalApplications,
      placedStudents: placedStudents.length,
      completedApplications: completedApps.length,
      totalPrograms: programs,
      totalCollaborations: collaborations,
      placementByBranch,
    },
  });
});

router.get('/top-skills', async (req, res) => {
  const skills = await Skill.find({}, { sort: { popularity: -1 }, limit: 10 });
  res.json({ skills });
});

export default router;