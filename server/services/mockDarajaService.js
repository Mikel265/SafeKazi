const { v4: uuidv4 } = require('uuid');
const { get, run } = require('../db');

/**
 * Format Kenyan phone numbers into 254XXXXXXXXX standard format
 */
function normalizeKenyanPhone(phone) {
  if (!phone) return '';
  let cleaned = phone.replace(/\D/g, '');
  if (cleaned.startsWith('0')) {
    cleaned = '254' + cleaned.slice(1);
  } else if (cleaned.startsWith('7') || cleaned.startsWith('1')) {
    cleaned = '254' + cleaned;
  }
  return cleaned;
}

/**
 * Generate realistic Safaricom M-Pesa Receipt Number (e.g., QK89X4M2PL)
 */
function generateMpesaReceipt() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let receipt = 'QK';
  for (let i = 0; i < 8; i++) {
    receipt += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return receipt;
}

class MockDarajaService {
  /**
   * Simulate M-Pesa STK Push Request for Client Deposit into Escrow
   */
  async initiateStkPush({ projectId, phone, amount }) {
    const formattedPhone = normalizeKenyanPhone(phone);
    if (!formattedPhone || formattedPhone.length !== 12) {
      throw new Error('Invalid Kenyan phone number. Must be 10 digits starting with 07/01 or 12 digits starting with 254.');
    }

    if (!amount || amount <= 0) {
      throw new Error('Invalid payment amount. Amount must be greater than KES 0.');
    }

    const project = await get('SELECT * FROM projects WHERE id = ?', [projectId]);
    if (!project) {
      throw new Error('Project not found.');
    }

    if (project.status !== 'pending') {
      throw new Error(`Cannot pay for project with status '${project.status}'. Escrow requires 'pending' status.`);
    }

    // Generate mock Daraja checkout identifiers
    const checkoutRequestId = `ws_CO_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
    const merchantRequestId = `${Math.floor(100000 + Math.random() * 900000)}-${Date.now()}`;
    const mpesaReceipt = generateMpesaReceipt();

    // Perform database status transition inside transaction logic
    await run('BEGIN TRANSACTION');
    try {
      // 1. Update Project Status to 'locked'
      await run(
        `UPDATE projects SET status = 'locked', client_phone = ? WHERE id = ?`,
        [formattedPhone, projectId]
      );

      // 2. Insert Deposit Transaction
      const trxId = `trx_${uuidv4()}`;
      await run(
        `INSERT INTO transactions (id, project_id, amount, type, mpesa_receipt, status, created_at)
         VALUES (?, ?, ?, 'deposit', ?, 'completed', datetime('now'))`,
        [trxId, projectId, amount, mpesaReceipt]
      );

      await run('COMMIT');

      return {
        success: true,
        MerchantRequestID: merchantRequestId,
        CheckoutRequestID: checkoutRequestId,
        ResponseCode: '0',
        ResponseDescription: 'Success. Request accepted for processing.',
        CustomerMessage: 'Success. Request accepted for processing. Please check your phone to complete the M-Pesa PIN prompt.',
        mpesaReceipt: mpesaReceipt,
        formattedPhone: formattedPhone,
        amount: amount
      };
    } catch (err) {
      await run('ROLLBACK');
      throw err;
    }
  }

  /**
   * Simulate B2C Payout to Freelancer when Client Approves Work
   */
  async initiateB2cPayout({ projectId }) {
    const project = await get(
      `SELECT p.*, u.phone as freelancer_phone, u.name as freelancer_name 
       FROM projects p 
       JOIN users u ON p.user_id = u.id 
       WHERE p.id = ?`,
      [projectId]
    );

    if (!project) {
      throw new Error('Project not found.');
    }

    if (project.status !== 'locked') {
      throw new Error(`Cannot release escrow for project with status '${project.status}'. Funds must be 'locked' first.`);
    }

    const mpesaReceipt = generateMpesaReceipt();
    const conversationId = `AG_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    const originatorConversationId = `${Math.floor(10000 + Math.random() * 90000)}-${Date.now()}`;

    await run('BEGIN TRANSACTION');
    try {
      // 1. Update project status to 'released'
      await run(`UPDATE projects SET status = 'released' WHERE id = ?`, [projectId]);

      // 2. Record B2C Payout Transaction
      const trxId = `trx_${uuidv4()}`;
      await run(
        `INSERT INTO transactions (id, project_id, amount, type, mpesa_receipt, status, created_at)
         VALUES (?, ?, ?, 'payout', ?, 'completed', datetime('now'))`,
        [trxId, projectId, project.amount, mpesaReceipt]
      );

      await run('COMMIT');

      return {
        success: true,
        ConversationID: conversationId,
        OriginatorConversationID: originatorConversationId,
        ResponseCode: '0',
        ResponseDescription: 'Accept the service request successfully.',
        mpesaReceipt: mpesaReceipt,
        payoutAmount: project.amount,
        freelancerPhone: normalizeKenyanPhone(project.freelancer_phone),
        freelancerName: project.freelancer_name
      };
    } catch (err) {
      await run('ROLLBACK');
      throw err;
    }
  }

  /**
   * Simulate Raising a Dispute by Client or Freelancer
   */
  async raiseDispute({ projectId, reason }) {
    const project = await get('SELECT * FROM projects WHERE id = ?', [projectId]);
    if (!project) {
      throw new Error('Project not found.');
    }

    if (project.status !== 'locked') {
      throw new Error(`Disputes can only be raised for projects with locked funds.`);
    }

    await run(`UPDATE projects SET status = 'disputed' WHERE id = ?`, [projectId]);
    return {
      success: true,
      message: 'Dispute filed successfully. SafeKazi resolution team notified.',
      reason: reason || 'Client disputed work delivery'
    };
  }
}

module.exports = new MockDarajaService();
