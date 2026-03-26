import { mkdirSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { getDb, execute, queryOne, saveDb } from './database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

mkdirSync(join(__dirname, '..', 'data'), { recursive: true });
mkdirSync(join(__dirname, '..', 'uploads'), { recursive: true });

const db = await getDb();

// Clear existing data
db.run('DELETE FROM grading_standards');
db.run('DELETE FROM companies');

function insertCompany(name, code, description, website) {
  const { lastId } = execute(
    'INSERT INTO companies (name, code, description, website) VALUES (?, ?, ?, ?)',
    [name, code, description, website]
  );
  return lastId;
}

function insertStandard(companyId, grade, label, front, back, notes, sortOrder) {
  execute(
    'INSERT INTO grading_standards (company_id, grade, label, front_centering, back_centering, notes, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [companyId, grade, label, front, back, notes, sortOrder]
  );
}

// --- PSA ---
const psaId = insertCompany(
  'PSA', 'PSA',
  'Professional Sports Authenticator. Updated early 2025 — PSA 10 tightened from 60/40 to 55/45 front centering. Does not use half-point grades.',
  'https://www.psacard.com/gradingstandards'
);

[
  ['10',  'Gem Mint',   '55/45',    '75/25',    'Premium grade — very tight tolerances'],
  ['9',   'Mint',       '60/40',    '90/10',    'Excellent centering with minimal deviation'],
  ['8',   'NM-MT',      '65/35',    '90/10',    null],
  ['7',   'Near Mint',  '70/30',    '90/10',    null],
  ['6',   'EX-MT',      '75/25',    '90/10',    null],
  ['5',   'Excellent',  '85/15',    '90/10',    null],
  ['4',   'VG-EX',      '85/15',    '90/10',    null],
  ['3',   'Very Good',  '90/10',    '90/10',    null],
  ['2',   'Good',       '90/10',    'No Limit', null],
  ['1',   'Poor',       'No Limit', 'No Limit', null],
].forEach(([grade, label, front, back, notes], i) => {
  insertStandard(psaId, grade, label, front, back, notes, i);
});

// --- BGS ---
const bgsId = insertCompany(
  'BGS', 'BGS',
  'Beckett Grading Services. Uses four subgrades (Centering, Corners, Edges, Surface). Strictest for top grades — requires 50/50 front for Pristine 10.',
  'https://www.beckett.com/grading-standards'
);

[
  ['10',  'Pristine',   '50/50', '60/40', 'Highest possible — near-perfect centering required'],
  ['9.5', 'Gem Mint',   '55/45', '60/40', 'Excellent centering with minimal deviation'],
  ['9',   'Mint',       '55/45', '65/35', 'Excellent centering with minimal deviation'],
  ['8.5', 'NM-MT+',     '60/40', '70/30', null],
  ['8',   'NM-MT',      '60/40', '80/20', null],
  ['7.5', 'Near Mint+', '65/35', '85/15', null],
  ['7',   'Near Mint',  '70/30', '90/10', null],
  ['6.5', 'EX-NM+',     '75/25', '90/10', null],
  ['6',   'EX-NM',      '80/20', '90/10', null],
  ['5',   'Excellent',  '85/15', 'No Limit', null],
].forEach(([grade, label, front, back, notes], i) => {
  insertStandard(bgsId, grade, label, front, back, notes, i);
});

// --- CGC ---
const cgcId = insertCompany(
  'CGC', 'CGC',
  'Certified Guaranty Company. Distinguishes Pristine 10 (50/50) from Gem Mint 10 (55/45). Uses AI-assisted centering measurement.',
  'https://www.cgccards.com/card-grading/grading-scale/'
);

[
  ['10 (Pristine)', 'Pristine',   '50/50', '50/50', 'Highest possible — near-perfect centering required'],
  ['10 (Gem Mint)', 'Gem Mint',   '55/45', '75/25', 'Premium grade — very tight tolerances'],
  ['9.5',           'Mint+',      '55/45', '80/20', 'Excellent centering with minimal deviation'],
  ['9',             'Mint',       '60/40', '90/10', 'Excellent centering with minimal deviation'],
  ['8.5',           'NM-MT+',     '65/35', '90/10', null],
  ['8',             'NM-MT',      '65/35', '90/10', null],
  ['7.5',           'Near Mint+', '70/30', '90/10', null],
  ['7',             'Near Mint',  '70/30', '90/10', null],
  ['6.5',           'EX-NM+',     '75/25', '90/10', null],
  ['6',             'EX-NM',      '80/20', '90/10', null],
].forEach(([grade, label, front, back, notes], i) => {
  insertStandard(cgcId, grade, label, front, back, notes, i);
});

// --- SGC ---
const sgcId = insertCompany(
  'SGC', 'SGC',
  'Sportscard Guaranty Corporation. Strictest on back centering — requires 55/45 back for Gem Mint 10, tightest in the industry.',
  'https://www.gosgc.com/card-grading/scale'
);

[
  ['10 (Pristine)', 'Pristine',   '50/50', '50/50', 'Highest possible — near-perfect centering required'],
  ['10 (Gem Mint)', 'Gem Mint',   '55/45', '55/45', 'Premium grade — very tight tolerances'],
  ['9.5',           'Mint+',      '60/40', '60/40', 'Excellent centering with minimal deviation'],
  ['9',             'Mint',       '60/40', '65/35', 'Excellent centering with minimal deviation'],
  ['8.5',           'NM-MT+',     '65/35', '65/35', null],
  ['8',             'NM-MT',      '65/35', '70/30', null],
  ['7.5',           'Near Mint+', '70/30', '75/25', null],
  ['7',             'Near Mint',  '70/30', '80/20', null],
  ['6',             'EX-NM',      '75/25', '85/15', null],
  ['5',             'Excellent',  '80/20', '90/10', null],
].forEach(([grade, label, front, back, notes], i) => {
  insertStandard(sgcId, grade, label, front, back, notes, i);
});

// --- TAG ---
const tagId = insertCompany(
  'TAG', 'TAG',
  'Technical Authentication & Grading. Uses a 1000-point scoring system. Most precise tolerances (e.g., 51/49). Values shown are for Sports cards.',
  'https://taggrading.com/pages/rubric'
);

[
  ['10',  'Pristine',   '51/49',     '55/45',    'Highest possible — near-perfect centering required'],
  ['9.5', 'Gem Mint',   '51/49',     '55/45',    'Excellent centering with minimal deviation'],
  ['9',   'Mint',       '55/45',     '70/30',    'Excellent centering with minimal deviation'],
  ['8.5', 'NM-MT+',     '60/40',     '90/10',    null],
  ['8',   'NM-MT',      '65/35',     '90/10',    null],
  ['7.5', 'Near Mint+', '67.5/32.5', '95/5',     null],
  ['7',   'Near Mint',  '70/30',     '95/5',     null],
  ['6',   'EX-NM',      '75/25',     'No Limit', null],
  ['5',   'Excellent',  '80/20',     'No Limit', null],
  ['4',   'VG-EX',      '85/15',     'No Limit', null],
].forEach(([grade, label, front, back, notes], i) => {
  insertStandard(tagId, grade, label, front, back, notes, i);
});

saveDb();

const companyCount = queryOne('SELECT COUNT(*) as c FROM companies');
const standardCount = queryOne('SELECT COUNT(*) as c FROM grading_standards');
console.log('Database seeded successfully.');
console.log(`  Companies: ${companyCount.c}`);
console.log(`  Standards: ${standardCount.c}`);
