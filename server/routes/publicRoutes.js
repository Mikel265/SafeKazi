const express = require('express');
const router = express.Router();
const { get, all } = require('../db');
const mockDarajaService = require('../services/mockDarajaService');

/**
 * Mask phone number for public display (e.g., 0712345678 -> 0712***678)
 */
function maskPhone(phone) {
  if (!phone || phone.length < 8) return '07******';
  return phone.substring(0, 4) + '***' + phone.substring(phone.length - 3);
}

// GET /api/public/projects/:id - Fetch public project scope & status for client
router.get('/projects/:id', async (req, res) => {
  try {
    const project = await get(
      `SELECT p.id, p.title, p.description, p.amount, p.status, p.client_phone, p.created_at,
              u.name as freelancer_name, u.phone as freelancer_phone
       FROM projects p
       JOIN users u ON p.user_id = u.id
       WHERE p.id = ?`,
      [req.params.id]
    );

    if (!project) {
      return res.status(404).json({ success: false, error: 'Escrow payment link not found or expired.' });
    }

    // Fetch transactions for audit history (without sensitive user info)
    const transactions = await all(
      `SELECT id, amount, type, mpesa_receipt, status, created_at 
       FROM transactions 
       WHERE project_id = ? 
       ORDER BY created_at ASC`,
      [project.id]
    );

    res.json({
      success: true,
      project: {
        id: project.id,
        title: project.title,
        description: project.description,
        amount: project.amount,
        status: project.status,
        client_phone: project.client_phone ? maskPhone(project.client_phone) : null,
        created_at: project.created_at,
        freelancer: {
          name: project.freelancer_name,
          masked_phone: maskPhone(project.freelancer_phone)
        },
        transactions
      }
    });
  } catch (err) {
    console.error('Error fetching public project:', err);
    res.status(500).json({ success: false, error: 'Failed to retrieve project information.' });
  }
});

// POST /api/public/projects/:id/pay - Client pays via M-Pesa STK Push
router.post('/projects/:id/pay', async (req, res) => {
  try {
    const { phone, amount } = req.body;
    const projectId = req.params.id;

    if (!phone) {
      return res.status(400).json({ success: false, error: 'M-Pesa phone number is required.' });
    }

    const project = await get('SELECT * FROM projects WHERE id = ?', [projectId]);
    if (!project) {
      return res.status(404).json({ success: false, error: 'Project not found.' });
    }

    if (project.status !== 'pending') {
      return res.status(400).json({
        success: false,
        error: `Project funds are currently in '${project.status}' state.`
      });
    }

    // Call Mock Daraja STK Push service
    const result = await mockDarajaService.initiateStkPush({
      projectId,
      phone,
      amount: project.amount
    });

    res.json({
      success: true,
      message: 'M-Pesa STK Push initiated successfully! Funds held safely in SafeKazi Escrow.',
      data: result
    });
  } catch (err) {
    console.error('Payment error:', err);
    res.status(400).json({ success: false, error: err.message || 'Payment simulation failed.' });
  }
});

// POST /api/public/projects/:id/approve - Client approves work and releases B2C payout to freelancer
router.post('/projects/:id/approve', async (req, res) => {
  try {
    const projectId = req.params.id;

    const result = await mockDarajaService.initiateB2cPayout({ projectId });

    res.json({
      success: true,
      message: 'Work approved! Escrow funds released to freelancer via M-Pesa B2C payout.',
      data: result
    });
  } catch (err) {
    console.error('Approval error:', err);
    res.status(400).json({ success: false, error: err.message || 'Work approval failed.' });
  }
});

// POST /api/public/projects/:id/dispute - Raise dispute
router.post('/projects/:id/dispute', async (req, res) => {
  try {
    const { reason } = req.body;
    const projectId = req.params.id;

    const result = await mockDarajaService.raiseDispute({ projectId, reason });

    res.json({
      success: true,
      message: result.message,
      data: result
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message || 'Failed to raise dispute.' });
  }
});

module.exports = router;
