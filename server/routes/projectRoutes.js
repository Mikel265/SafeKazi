const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { get, all, run } = require('../db');
const { authenticateToken } = require('../middleware/auth');

// Protect all project routes
router.use(authenticateToken);

// GET /api/projects - Get all projects for authenticated freelancer with summary stats
router.get('/', async (req, res) => {
  try {
    const projects = await all(
      `SELECT p.*, 
              (SELECT COUNT(*) FROM transactions t WHERE t.project_id = p.id) as transaction_count
       FROM projects p 
       WHERE p.user_id = ? 
       ORDER BY p.created_at DESC`,
      [req.user.id]
    );

    // Calculate Freelancer Escrow Summary Metrics
    let totalVolume = 0;
    let lockedAmount = 0;
    let releasedAmount = 0;
    let pendingAmount = 0;
    let disputedAmount = 0;

    projects.forEach(p => {
      const amt = Number(p.amount);
      totalVolume += amt;
      if (p.status === 'locked') lockedAmount += amt;
      else if (p.status === 'released') releasedAmount += amt;
      else if (p.status === 'pending') pendingAmount += amt;
      else if (p.status === 'disputed') disputedAmount += amt;
    });

    res.json({
      success: true,
      metrics: {
        totalVolume,
        lockedAmount,
        releasedAmount,
        pendingAmount,
        disputedAmount,
        totalProjects: projects.length
      },
      projects
    });
  } catch (err) {
    console.error('Error fetching projects:', err);
    res.status(500).json({ success: false, error: 'Failed to fetch projects.' });
  }
});

// POST /api/projects - Create a new Project and generate payment link
router.post('/', async (req, res) => {
  try {
    const { title, description, amount, client_phone } = req.body;

    if (!title || !description || amount === undefined || amount === null) {
      return res.status(400).json({
        success: false,
        error: 'Title, description, and amount are required.'
      });
    }

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Amount must be a positive number greater than KES 0.'
      });
    }

    if (parsedAmount > 1000000) {
      return res.status(400).json({
        success: false,
        error: 'Maximum single escrow transaction amount is KES 1,000,000.'
      });
    }

    const projectId = `prj_${uuidv4().substring(0, 8)}`;
    await run(
      `INSERT INTO projects (id, user_id, title, description, amount, client_phone, status, created_at)
       VALUES (?, ?, ?, ?, ?, ?, 'pending', datetime('now'))`,
      [projectId, req.user.id, title.trim(), description.trim(), parsedAmount, client_phone ? client_phone.trim() : null]
    );

    const newProject = await get('SELECT * FROM projects WHERE id = ?', [projectId]);

    res.status(201).json({
      success: true,
      message: 'Project escrow link generated successfully!',
      project: newProject,
      paymentUrl: `/p/${projectId}`
    });
  } catch (err) {
    console.error('Error creating project:', err);
    res.status(500).json({ success: false, error: 'Failed to create project.' });
  }
});

// GET /api/projects/:id - Get specific project owned by freelancer
router.get('/:id', async (req, res) => {
  try {
    const project = await get(
      `SELECT * FROM projects WHERE id = ? AND user_id = ?`,
      [req.params.id, req.user.id]
    );

    if (!project) {
      return res.status(404).json({ success: false, error: 'Project not found or access denied.' });
    }

    const transactions = await all(
      `SELECT * FROM transactions WHERE project_id = ? ORDER BY created_at DESC`,
      [project.id]
    );

    res.json({
      success: true,
      project: {
        ...project,
        transactions
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Error retrieving project details.' });
  }
});

// DELETE /api/projects/:id - Delete a pending project
router.delete('/:id', async (req, res) => {
  try {
    const project = await get('SELECT * FROM projects WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
    if (!project) {
      return res.status(404).json({ success: false, error: 'Project not found.' });
    }

    if (project.status !== 'pending') {
      return res.status(400).json({
        success: false,
        error: `Cannot delete project in '${project.status}' status. Escrow funds are active or processed.`
      });
    }

    await run('DELETE FROM projects WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Pending project deleted successfully.' });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to delete project.' });
  }
});

module.exports = router;
