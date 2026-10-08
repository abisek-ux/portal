import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, '..', 'data');
const mongoMode = process.env.DB_MODE === 'mongo';

// ---------------------------------------------------------------
// MongoDB connection (isolated to the DB name in MONGODB_URI, e.g. /skillbridge)
// ---------------------------------------------------------------
export const connectDB = async () => {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('MONGODB_URI is missing in backend/.env');
  await mongoose.connect(uri);
  console.log(`MongoDB connected -> database: ${mongoose.connection.name}`);
  mongoose.connection.on('error', (err) => console.error('MongoDB error:', err.message));
};

export const disconnectDB = async () => {
  if (mongoose.connection.readyState) await mongoose.disconnect();
};

// ---------------------------------------------------------------
// shared auth / response helpers (both modes)
// ---------------------------------------------------------------
export const hashPassword = async (plain) => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(plain, salt);
};
export const matchPassword = (doc, plain) => bcrypt.compare(plain, doc.password);
export const safe = (doc) => {
  if (!doc) return null;
  const { password, __v, ...rest } = doc;
  return rest;
};
export const pick = (doc, select) => {
  if (!select) return doc;
  const fields = select.replace(/-/g, '').split(/[\s,]+/).filter(Boolean);
  const out = {};
  fields.forEach((f) => { if (f in doc) out[f] = doc[f]; });
  return out;
};

// ---------------------------------------------------------------
// Mongoose schemas (Mongo mode) — ISO field shapes, timestamps
// ---------------------------------------------------------------
const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true, lowercase: true },
  password: String,
  role: { type: String, enum: ['student', 'academician', 'industry', 'admin'], default: 'student' },
  phone: { type: String, default: '' },
  location: { type: String, default: '' },
  college: String,
  branch: String,
  year: String,
  degree: String,
  facultyDepartment: String,
  designation: String,
  expertise: { type: [String], default: [] },
  company: String,
  industrySector: String,
  description: String,
  website: String,
  institution: String,
  skills: { type: [{ name: String, level: String, years: Number }], default: [] },
  interests: { type: [String], default: [] },
  resumeUrl: { type: String, default: '' },
  profileProgress: { type: Number, default: 0 },
}, { timestamps: true });

const skillSchema = new mongoose.Schema({
  name: String,
  category: String,
  description: String,
  relatedRoles: { type: [String], default: [] },
  relatedIndustries: { type: [String], default: [] },
  popularity: { type: Number, default: 0 },
}, { timestamps: true });

const internshipSchema = new mongoose.Schema({
  company: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  companyName: String,
  title: String,
  type: { type: String, default: 'Internship' },
  description: String,
  category: String,
  requiredSkills: { type: [String], default: [] },
  preferredSkills: { type: [String], default: [] },
  stipend: String,
  duration: String,
  location: String,
  mode: String,
  seats: { type: Number, default: 1 },
  isInternshipForAcademician: { type: Boolean, default: false },
  academicProgramType: String,
  applicationsCount: { type: Number, default: 0 },
  status: { type: String, default: 'Open' },
  deadline: String,
}, { timestamps: true });

const applicationSchema = new mongoose.Schema({
  internship: { type: mongoose.Schema.Types.ObjectId, ref: 'Internship', required: true },
  applicant: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  applicantType: { type: String, default: '' },
  coverLetter: { type: String, default: '' },
  relevantSkills: { type: [String], default: [] },
  status: { type: String, default: 'Applied' },
  progress: { type: Number, default: 0 },
  feedback: { type: String, default: '' },
  rating: { type: Number, default: 0 },
  completionDate: String,
}, { timestamps: true });
applicationSchema.index({ internship: 1, applicant: 1 }, { unique: true });

const programSchema = new mongoose.Schema({
  company: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  companyName: String,
  title: String,
  type: String,
  description: String,
  skillsCovered: { type: [String], default: [] },
  duration: String,
  cost: String,
  maxSeats: { type: Number, default: 0 },
  enrolledStudents: { type: [mongoose.Schema.Types.ObjectId], ref: 'User', default: [] },
  status: { type: String, default: 'Open' },
}, { timestamps: true });

const collaborationSchema = new mongoose.Schema({
  title: String,
  type: String,
  description: String,
  proposedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  proposerName: String,
  proposerRole: String,
  industryDept: String,
  status: { type: String, default: 'Proposed' },
  startDate: { type: String, default: null },
  participants: { type: [mongoose.Schema.Types.ObjectId], ref: 'User', default: [] },
}, { timestamps: true });

const Models = {
  users: mongoose.model('User', userSchema),
  skills: mongoose.model('Skill', skillSchema),
  internships: mongoose.model('Internship', internshipSchema),
  applications: mongoose.model('Application', applicationSchema),
  programs: mongoose.model('LearningProgram', programSchema),
  collaborations: mongoose.model('Collaboration', collaborationSchema),
};

// ---------------------------------------------------------------
// JSON file storage (Json mode)
// ---------------------------------------------------------------
const ensure = (name) => {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  const file = path.join(DATA_DIR, `${name}.json`);
  if (!fs.existsSync(file)) fs.writeFileSync(file, '[]', 'utf-8');
  return file;
};
const readAll = (name) => JSON.parse(fs.readFileSync(ensure(name), 'utf-8'));
const writeAll = (name, arr) => fs.writeFileSync(ensure(name), JSON.stringify(arr, null, 2), 'utf-8');
const genId = () => Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
const now = () => new Date().toISOString();

const match = (doc, filter) => {
  if (!filter) return true;
  for (const [k, v] of Object.entries(filter)) {
    if (k === '$or') {
      if (!v.some((sub) => match(doc, sub))) return false;
      continue;
    }
    if (v && typeof v === 'object' && !Array.isArray(v)) {
      for (const [op, val] of Object.entries(v)) {
        if (op === '$regex') {
          const flags = v.$options === 'i' ? 'i' : '';
          if (!new RegExp(val, flags).test(String(doc[k] ?? ''))) return false;
        } else if (op === '$in') {
          if (!val.includes(doc[k])) return false;
        } else if (op === '$ne') {
          if (doc[k] === val) return false;
        } else if (op === '$gte') {
          if ((doc[k] ?? 0) < val) return false;
        } else if (op === '$lte') {
          if ((doc[k] ?? 0) > val) return false;
        }
      }
    } else if (doc[k] !== v) {
      return false;
    }
  }
  return true;
};

const cmp = (a, b) => {
  const x = a ?? '';
  const y = b ?? '';
  if (typeof x === 'number' && typeof y === 'number') return x - y;
  return new Date(x) - new Date(y);
};

const mongoCollection = (name, options = {}) => {
  const Model = Models[name];
  return {
    async find(filter = {}, { sort, limit, select } = {}) {
      let q = Model.find(filter);
      if (sort) q = q.sort(sort);
      if (limit) q = q.limit(limit);
      if (select) q = q.select(select);
      return (await q.lean()).map((d) => ({ ...(options.defaults || {}), ...d }));
    },
    async findOne(filter = {}) {
      const d = await Model.findOne(filter).lean();
      return d ? { ...(options.defaults || {}), ...d } : null;
    },
    async findById(id) {
      return Model.findById(id) || null;
    },
    async create(doc) {
      const d = { ...(options.defaults || {}), ...doc };
      if (options.beforeCreate) await options.beforeCreate(d);
      return Model.create(d);
    },
    async save(doc) {
      if (options.beforeSave) await options.beforeSave(doc);
      return doc.save();
    },
    async countDocuments(filter = {}) {
      return Model.countDocuments(filter);
    },
    async distinct(field, filter = {}) {
      return Model.distinct(field, filter);
    },
    async reset() {
      await Model.deleteMany({});
    },
  };
};

const jsonCollection = (name, options = {}) => ({
  async find(filter = {}, { sort, limit, select } = {}) {
    let arr = readAll(name).filter((d) => match(d, filter));
    if (options.defaults) arr = arr.map((d) => ({ ...options.defaults, ...d }));
    if (sort) {
      const [key, dir] = Object.entries(sort)[0];
      arr.sort((a, b) => (dir === -1 ? -1 : 1) * cmp(a[key], b[key]));
    }
    if (limit) arr = arr.slice(0, limit);
    if (select) arr = arr.map((d) => pick(d, select));
    return arr;
  },
  async findOne(filter = {}) {
    const d = readAll(name).find((x) => match(x, filter));
    return d ? { ...(options.defaults || {}), ...d } : null;
  },
  async findById(id) {
    const d = readAll(name).find((x) => String(x._id) === String(id));
    return d ? { ...(options.defaults || {}), ...d } : null;
  },
  async create(doc) {
    const arr = readAll(name);
    const d = { _id: genId(), ...(options.defaults || {}), ...doc, createdAt: now(), updatedAt: now() };
    if (options.beforeCreate) await options.beforeCreate(d);
    arr.push(d);
    writeAll(name, arr);
    return d;
  },
  async save(doc) {
    const arr = readAll(name);
    if (options.beforeSave) await options.beforeSave(doc);
    doc.updatedAt = now();
    const idx = arr.findIndex((d) => String(d._id) === String(doc._id));
    if (idx >= 0) arr[idx] = doc;
    else arr.push(doc);
    writeAll(name, arr);
    return doc;
  },
  async countDocuments(filter = {}) {
    return readAll(name).filter((d) => match(d, filter)).length;
  },
  async distinct(field, filter = {}) {
    return [...new Set(readAll(name).filter((d) => match(d, filter)).map((d) => d[field]))];
  },
  async reset() {
    writeAll(name, []);
  },
});

// ---------------------------------------------------------------
// collection factory (routes use the same API in both modes)
// ---------------------------------------------------------------
export const collection = (name, options = {}) =>
  mongoMode ? mongoCollection(name, options) : jsonCollection(name, options);

// ---------- populate helper ----------
export const populate = async (arr, specs) => {
  for (const item of arr) {
    for (const spec of specs) {
      const target = await collection(spec.collection).findById(item[spec.field]);
      item[spec.field] = target ? (spec.select ? pick(target, spec.select) : target) : null;
    }
  }
  return arr;
};

// ---------- named collections ----------
const USER_HOOKS = {
  async beforeCreate(doc) {
    if (doc.password) doc.password = await hashPassword(doc.password);
  },
  async beforeSave(doc) {
    if (doc.__newPassword) {
      doc.password = await hashPassword(doc.__newPassword);
      delete doc.__newPassword;
    }
  },
};

export const User = collection('users', {
  defaults: { skills: [], interests: [], profileProgress: 0, phone: '', location: '' },
  ...USER_HOOKS,
});
export const Skill = collection('skills');
export const Internship = collection('internships', {
  defaults: { status: 'Open', isInternshipForAcademician: false, applicationsCount: 0, preferredSkills: [] },
});
export const Application = collection('applications', {
  defaults: { status: 'Applied', progress: 0, feedback: '', rating: 0, relevantSkills: [], coverLetter: '' },
});
export const LearningProgram = collection('programs', {
  defaults: { status: 'Open', enrolledStudents: [], skillsCovered: [] },
});
export const Collaboration = collection('collaborations', {
  defaults: { status: 'Proposed', participants: [], startDate: null },
});

export const resetCollections = async (...names) => {
  for (const n of names) await collection(n).reset();
};