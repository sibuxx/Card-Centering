import { Router } from 'express';
import { queryAll, queryOne, execute } from '../database.js';
import { optionalAuth } from '../middleware/auth.js';

const router = Router();

// GET /api/companies
router.get('/companies', (req, res) => {
  const companies = queryAll('SELECT * FROM companies ORDER BY name');
  res.json(companies);
});

// GET /api/companies/:code/standards
router.get('/companies/:code/standards', (req, res) => {
  const company = queryOne('SELECT * FROM companies WHERE code = ?', [req.params.code]);
  if (!company) {
    return res.status(404).json({ error: 'Company not found' });
  }
  const standards = queryAll(
    'SELECT * FROM grading_standards WHERE company_id = ? ORDER BY sort_order ASC',
    [company.id]
  );
  res.json({ company, standards });
});

// GET /api/standards
router.get('/standards', (req, res) => {
  const companies = queryAll('SELECT * FROM companies ORDER BY name');
  const result = companies.map((company) => {
    const standards = queryAll(
      'SELECT * FROM grading_standards WHERE company_id = ? ORDER BY sort_order ASC',
      [company.id]
    );
    return { ...company, standards };
  });
  res.json(result);
});

// POST /api/sessions
router.post('/sessions', optionalAuth, (req, res) => {
  const {
    companyId, frontLrRatio, frontTbRatio,
    backLrRatio, backTbRatio, calculatedGrade,
  } = req.body;

  const { lastId } = execute(
    `INSERT INTO grading_sessions
      (user_id, company_id, front_lr_ratio, front_tb_ratio, back_lr_ratio, back_tb_ratio, calculated_grade)
    VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [req.user?.id || null, companyId, frontLrRatio, frontTbRatio, backLrRatio, backTbRatio, calculatedGrade]
  );

  res.status(201).json({ id: lastId });
});

export default router;
