import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, '..', 'data');

// ---------- file helpers ----------
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

// ---------- query matching ----------
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

const pick = (doc, select) => {
  if (!select) return doc;
  const fields = select.replace(/-/g, '').split(/[\s,]+/).filter(Boolean);
  const out = {};
  fields.forEach((f) => { if (f in doc) out[f] = doc[f]; });
  return out;
};

// ---------- collection factory ----------
export const collection = (name, options = {}) => ({
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
  reset() {
    writeAll(name, []);
  },
});

// ---------- auth helpers ----------
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

export const resetCollections = (...names) => names.forEach((n) => collection(n).reset());