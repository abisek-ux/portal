import {
  User, Skill, Internship, LearningProgram, Collaboration, Application,
  resetCollections,
} from './src/db.js';

const skillCatalog = [
  { name: 'Python', category: 'Technical', roles: ['Software Developer', 'Data Scientist', 'AI Engineer'], industries: ['IT Services', 'Fintech', 'Healthcare'] },
  { name: 'JavaScript', category: 'Technical', roles: ['Web Developer', 'Full Stack Developer'], industries: ['IT Services', 'E-commerce', 'Media'] },
  { name: 'React.js', category: 'Technical', roles: ['Frontend Developer', 'Full Stack Developer'], industries: ['IT Services', 'E-commerce'] },
  { name: 'Node.js', category: 'Technical', roles: ['Backend Developer', 'Full Stack Developer'], industries: ['IT Services', 'Fintech'] },
  { name: 'MongoDB', category: 'Technical', roles: ['Database Administrator', 'Backend Developer'], industries: ['IT Services', 'Fintech'] },
  { name: 'Data Analytics', category: 'Analytics', roles: ['Data Analyst', 'Business Analyst'], industries: ['Consulting', 'Retail', 'Banking'] },
  { name: 'Machine Learning', category: 'Analytics', roles: ['ML Engineer', 'Data Scientist', 'AI Engineer'], industries: ['IT Services', 'Healthcare', 'Automotive'] },
  { name: 'Deep Learning', category: 'Analytics', roles: ['AI Researcher', 'ML Engineer'], industries: ['Healthcare', 'IT Services'] },
  { name: 'Ayurveda Pharmacology', category: 'Ayurveda', roles: ['Ayurvedic Pharmacologist', 'Quality Analyst'], industries: ['Pharmaceuticals', 'Ayurveda Wellness'] },
  { name: 'Panchakarma Therapy', category: 'Ayurveda', roles: ['Ayurvedic Therapist', 'Wellness Consultant'], industries: ['Ayurveda Wellness', 'Healthcare'] },
  { name: 'Herbal Medicine', category: 'Ayurveda', roles: ['Herbal Formulation Scientist', 'R&D Analyst'], industries: ['Pharmaceuticals', 'Ayurveda Wellness'] },
  { name: 'Dravya Guna (Herbal Properties)', category: 'Ayurveda', roles: ['Pharmacognosist', 'Ayurvedic Researcher'], industries: ['Pharmaceuticals', 'Labs'] },
  { name: 'Communication', category: 'Communication', roles: ['Project Manager', 'Sales Executive', 'Consultant'], industries: ['All Industries'] },
  { name: 'Public Speaking', category: 'Communication', roles: ['Trainer', 'Corporate Communicator'], industries: ['Education', 'Media'] },
  { name: 'Project Management', category: 'Management', roles: ['Project Manager', 'Product Manager'], industries: ['IT Services', 'Construction', 'Consulting'] },
  { name: 'Product Management', category: 'Management', roles: ['Product Manager', 'Program Manager'], industries: ['IT Services', 'Startups'] },
  { name: 'UI/UX Design', category: 'Design', roles: ['UX Designer', 'Product Designer'], industries: ['IT Services', 'E-commerce'] },
  { name: 'Graphic Design', category: 'Design', roles: ['Graphic Designer', 'Creative Lead'], industries: ['Media', 'Marketing'] },
  { name: 'Clinical Research', category: 'Research', roles: ['Clinical Research Associate', 'Research Scientist'], industries: ['Pharmaceuticals', 'Biotech'] },
  { name: 'Scientific Writing', category: 'Research', roles: ['Medical Writer', 'Research Analyst'], industries: ['Pharmaceuticals', 'Publishing'] },
  { name: 'Community Medicine', category: 'Healthcare', roles: ['Public Health Officer', 'Epidemiologist'], industries: ['Healthcare', 'Public Health'] },
  { name: 'Biostatistics', category: 'Analytics', roles: ['Biostatistician', 'Data Scientist'], industries: ['Pharmaceuticals', 'Healthcare'] },
  { name: 'Entrepreneurship', category: 'Management', roles: ['Startup Founder', 'Business Owner'], industries: ['Startups'] },
  { name: 'Financial Analysis', category: 'Finance', roles: ['Financial Analyst', 'Investment Banker'], industries: ['Banking', 'Consulting'] },
];

const run = async () => {
  try {
    resetCollections('users', 'skills', 'internships', 'programs', 'collaborations', 'applications');
    console.log('Data reset. Rebuilding fresh...');

    console.log('Seeding skills...');
    for (const [i, s] of skillCatalog.entries()) {
      await Skill.create({
        name: s.name,
        category: s.category,
        description: `${s.name} - an in-demand skill`,
        relatedRoles: s.roles,
        relatedIndustries: s.industries,
        popularity: 60 + (i * 3) % 40,
      });
    }

    console.log('Seeding users...');
    const student = await User.create({
      name: 'Arjun Sharma',
      email: 'student@demo.com',
      password: 'password123',
      role: 'student',
      college: 'National Institute of Ayurveda',
      branch: 'BAMS',
      degree: 'Bachelor of Ayurvedic Medicine',
      year: '3rd Year',
      location: 'Jaipur, Rajasthan',
      phone: '9812345670',
      skills: [
        { name: 'Ayurveda Pharmacology', level: 'Advanced', years: 2 },
        { name: 'Herbal Medicine', level: 'Intermediate', years: 2 },
        { name: 'Data Analytics', level: 'Beginner', years: 1 },
      ],
      interests: ['Ayurveda', 'Pharmaceuticals', 'Research'],
    });

    const student2 = await User.create({
      name: 'Priya Nair',
      email: 'student2@demo.com',
      password: 'password123',
      role: 'student',
      college: 'St. Xavier College',
      branch: 'Computer Science',
      degree: 'B.Tech',
      year: 'Final Year',
      location: 'Kochi, Kerala',
      skills: [
        { name: 'Python', level: 'Advanced', years: 3 },
        { name: 'Machine Learning', level: 'Intermediate', years: 2 },
        { name: 'React.js', level: 'Intermediate', years: 1 },
      ],
      interests: ['Software', 'AI', 'Analytics'],
    });

    const academic = await User.create({
      name: 'Dr. Meena Joshi',
      email: 'faculty@demo.com',
      password: 'password123',
      role: 'academician',
      institution: 'All India Institute of Ayurveda',
      facultyDepartment: 'Dravyaguna Vigyan',
      designation: 'Associate Professor',
      expertise: ['Ayurveda Pharmacology', 'Herbal Medicine', 'Clinical Research'],
      location: 'New Delhi',
    });

    const industry = await User.create({
      name: 'Himalaya Wellness',
      email: 'industry@demo.com',
      password: 'password123',
      role: 'industry',
      company: 'Himalaya Wellness',
      industrySector: 'Pharmaceuticals',
      description: 'Herbal healthcare company focused on Ayurveda-based wellness products.',
      website: 'https://himalayawellness.in',
      location: 'Bengaluru, Karnataka',
    });

    const industry2 = await User.create({
      name: 'Patanjali Ayurved',
      email: 'industry2@demo.com',
      password: 'password123',
      role: 'industry',
      company: 'Patanjali Ayurved',
      industrySector: 'Pharmaceuticals & FMCG',
      description: 'Ayurveda based FMCG and pharmaceutical company.',
      location: 'Haridwar, Uttarakhand',
    });

    const admin = await User.create({
      name: 'System Admin',
      email: 'admin@demo.com',
      password: 'admin123',
      role: 'admin',
      institution: 'SkillBridge Platform',
    });

    console.log('Seeding internships...');
    const i1 = await Internship.create({
      company: industry._id,
      companyName: 'Himalaya Wellness',
      title: 'Ayurveda Research Intern',
      type: 'Internship',
      description: 'Work on formulation research for herbal wellness products. Assist senior pharmacologists in herb-drug interaction studies.',
      category: 'Ayurveda',
      requiredSkills: ['Ayurveda Pharmacology', 'Herbal Medicine'],
      preferredSkills: ['Dravya Guna (Herbal Properties)'],
      stipend: 'Rs. 12,000/month',
      duration: '3 months',
      location: 'Bengaluru',
      mode: 'Hybrid',
      seats: 3,
    });

    const i2 = await Internship.create({
      company: industry._id,
      companyName: 'Himalaya Wellness',
      title: 'Data Analytics Intern - Healthcare',
      type: 'Internship',
      description: 'Analyze clinical trial data and consumer health insights. Build dashboards for the R&D team.',
      category: 'Analytics',
      requiredSkills: ['Data Analytics'],
      preferredSkills: ['Python', 'Biostatistics'],
      stipend: 'Rs. 10,000/month',
      duration: '2 months',
      location: 'Remote',
      mode: 'Remote',
      seats: 2,
    });

    const i3 = await Internship.create({
      company: industry2._id,
      companyName: 'Patanjali Ayurved',
      title: 'Herbal Quality Control Trainee',
      type: 'Apprenticeship',
      description: 'Learn pharmacognosy and quality testing of herbal raw materials in our state-of-the-art lab.',
      category: 'Ayurveda',
      requiredSkills: ['Ayurveda Pharmacology', 'Herbal Medicine'],
      stipend: 'Rs. 8,000/month',
      duration: '6 months',
      location: 'Haridwar',
      mode: 'On-site',
      seats: 5,
    });

    const i4 = await Internship.create({
      company: industry2._id,
      companyName: 'Patanjali Ayurved',
      title: 'Faculty Industrial Training - Dravyaguna',
      type: 'Internship',
      description: 'Two-week industrial immersion for Ayurveda faculty to observe modern extraction, QC and manufacturing processes.',
      category: 'Ayurveda',
      requiredSkills: ['Ayurveda Pharmacology'],
      preferredSkills: ['Clinical Research'],
      stipend: 'Unpaid (TA/DA provided)',
      duration: '2 weeks',
      location: 'Haridwar',
      mode: 'On-site',
      isInternshipForAcademician: true,
      academicProgramType: 'FDP',
      seats: 10,
    });

    console.log('Seeding learning programs...');
    for (const p of [
      {
        company: industry._id,
        companyName: 'Himalaya Wellness',
        title: 'Certification in Ayurvedic Product Development',
        type: 'Certification Course',
        description: 'Learn the complete lifecycle of Ayurveda product development from raw herb to finished formulation.',
        skillsCovered: ['Ayurveda Pharmacology', 'Herbal Medicine'],
        duration: '8 weeks',
        cost: 'Free',
        maxSeats: 200,
      },
      {
        company: industry2._id,
        companyName: 'Patanjali Ayurved',
        title: 'Workshop: Pharmacognosy & Herb Quality Testing',
        type: 'Workshop',
        description: 'Hands-on virtual workshop covering macroscopic & microscopic herb identification.',
        skillsCovered: ['Dravya Guna (Herbal Properties)', 'Ayurveda Pharmacology'],
        duration: '1 week',
        cost: 'Free',
        maxSeats: 150,
      },
      {
        company: industry._id,
        companyName: 'Himalaya Wellness',
        title: 'Mentorship Initiative: Careers in Healthcare Analytics',
        type: 'Mentorship Initiative',
        description: 'Get mentored 1:1 by data scientists working in healthcare analytics.',
        skillsCovered: ['Data Analytics', 'Machine Learning'],
        duration: '4 weeks',
        cost: 'Free',
        maxSeats: 50,
      },
    ]) {
      await LearningProgram.create(p);
    }

    console.log('Seeding collaborations...');
    await Collaboration.create({
      title: 'Joint Curriculum Design for BAMS IT Elective',
      type: 'Joint Curriculum Design',
      description: 'Industry and academia co-design an elective on digital health & informatics for BAMS students.',
      proposedBy: industry._id,
      proposerName: 'Himalaya Wellness',
      proposerRole: 'industry',
      industryDept: 'IT & R&D',
      status: 'Approved',
      startDate: new Date().toISOString(),
      participants: [academic._id],
    });

    await Collaboration.create({
      title: 'Guest Lecture Series: Herbal R&D at Scale',
      type: 'Guest Lecture',
      description: 'Monthly guest lectures by industry R&D scientists for Ayurveda students and faculty.',
      proposedBy: academic._id,
      proposerName: 'Dr. Meena Joshi',
      proposerRole: 'academician',
      industryDept: 'All India Institute of Ayurveda',
      status: 'Ongoing',
      startDate: new Date().toISOString(),
      participants: [industry._id, industry2._id],
    });

    await Collaboration.create({
      title: 'National Herbal Innovation Challenge 2026',
      type: 'Innovation Challenge',
      description: 'Students and faculty teams compete to solve real formulation challenges posed by industry.',
      proposedBy: industry2._id,
      proposerName: 'Patanjali Ayurved',
      proposerRole: 'industry',
      industryDept: 'R&D',
      status: 'Proposed',
      participants: [academic._id],
    });

    console.log('Seeding applications...');
    await Application.create({
      internship: i1._id,
      applicant: student._id,
      applicantType: 'student',
      coverLetter: 'I have 2 years of hands-on exposure in Ayurveda pharmacology and passion for herbal research.',
      relevantSkills: ['Ayurveda Pharmacology', 'Herbal Medicine'],
      status: 'Applied',
    });

    await Application.create({
      internship: i2._id,
      applicant: student2._id,
      applicantType: 'student',
      coverLetter: 'Data analytics student with ML experience, eager to apply analytics in healthcare.',
      relevantSkills: ['Data Analytics', 'Python', 'Machine Learning'],
      status: 'Shortlisted',
      progress: 30,
      feedback: 'Strong technical background. Scheduling technical round.',
    });

    console.log('Seeded new demo users:');
    console.log('  student@demo.com / password123');
    console.log('  student2@demo.com / password123');
    console.log('  faculty@demo.com / password123');
    console.log('  industry@demo.com / password123');
    console.log('  industry2@demo.com / password123');
    console.log('  admin@demo.com / admin123');

    console.log('Seed complete!');
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
};

run();