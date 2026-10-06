import express from 'express';
import { Skill, User } from '../src/db.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// @route  GET /api/skills  -> list skill catalog
router.get('/', async (req, res) => {
  const { category, search } = req.query;
  const filter = {};
  if (category) filter.category = category;
  if (search) filter.name = { $regex: search, $options: 'i' };
  const skills = await Skill.find(filter, { sort: { popularity: -1 }, limit: 100 });
  res.json({ skills });
});

// @route  GET /api/skills/categories
router.get('/categories', async (req, res) => {
  const categories = await Skill.distinct('category');
  res.json({ categories });
});

// @route  PUT /api/skills/my-skills  -> update logged in user's skills
router.put('/my-skills', protect, async (req, res) => {
  const { skills } = req.body; // [{name, level, years}]
  if (!Array.isArray(skills)) return res.status(400).json({ message: 'skills must be an array' });

  const user = await User.findById(req.user._id);
  user.skills = skills;
  user.profileProgress = undefined;
  await User.save(user);
  res.json({ skills: user.skills });
});

// @route  GET /api/skills/recommend  -> skill matching: recommend roles/industries/programs
router.get('/recommend', protect, async (req, res) => {
  const user = await User.findById(req.user._id);

  const userSkillNames = (user.skills || []).map((s) => s.name.toLowerCase());
  const allSkills = await Skill.find();
  const interests = (user.interests || []).map((i) => i.toLowerCase());

  // Match next best skills: skill categories overlap with user's interests or existing skills
  const recommendedSkills = allSkills
    .filter((s) => !userSkillNames.includes(s.name.toLowerCase()))
    .map((s) => {
      let score = 0;
      const cat = s.category.toLowerCase();
      if (interests.some((i) => cat.includes(i) || i.includes(cat))) score += 3;
      if (s.relatedRoles.some((r) => interests.some((i) => r.toLowerCase().includes(i)))) score += 2;
      score += s.popularity / 100;
      return { ...s, score };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 10);

  // Recommended job roles from user's skills
  const recommendedRoles = [];
  const recommendedIndustries = new Set();
  for (const s of allSkills) {
    if (userSkillNames.includes(s.name.toLowerCase())) {
      s.relatedRoles.forEach((r) => {
        if (!recommendedRoles.includes(r)) recommendedRoles.push(r);
      });
      s.relatedIndustries.forEach((i) => recommendedIndustries.add(i));
    }
  }

  res.json({
    recommendedSkills,
    recommendedRoles: recommendedRoles.slice(0, 8),
    recommendedIndustries: [...recommendedIndustries].slice(0, 8),
    skillCount: user.skills?.length || 0,
  });
});

export default router;