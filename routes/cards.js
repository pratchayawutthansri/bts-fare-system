const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const auth = require('../middleware/auth');

// =============================================
// GET /api/cards - ดูบัตร Rabbit Card ของ User
// =============================================
router.get('/', auth, async (req, res) => {
  try {
    const [cards] = await pool.query(
      `SELECT c.*, 
        (SELECT COUNT(*) FROM trips t WHERE t.card_id = c.id) as total_trips,
        (SELECT SUM(amount) FROM topups tp WHERE tp.card_id = c.id AND tp.status = 'completed') as total_topup
       FROM cards c 
       WHERE c.user_id = ? AND c.is_active = 1 
       ORDER BY c.created_at DESC`,
      [req.user.id]
    );

    res.json({
      success: true,
      data: cards
    });
  } catch (error) {
    console.error('Get Cards Error:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการดึงข้อมูลบัตร'
    });
  }
});

// =============================================
// GET /api/cards/:id - ดูรายละเอียดบัตร
// =============================================
router.get('/:id', auth, async (req, res) => {
  try {
    const [cards] = await pool.query(
      `SELECT c.*,
        (SELECT COUNT(*) FROM trips t WHERE t.card_id = c.id) as total_trips,
        (SELECT SUM(amount) FROM topups tp WHERE tp.card_id = c.id AND tp.status = 'completed') as total_topup
       FROM cards c 
       WHERE c.id = ? AND c.user_id = ?`,
      [req.params.id, req.user.id]
    );

    if (cards.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'ไม่พบบัตร'
      });
    }

    res.json({
      success: true,
      data: cards[0]
    });
  } catch (error) {
    console.error('Get Card Error:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาด'
    });
  }
});

// =============================================
// POST /api/cards - เพิ่มบัตร Rabbit Card ใหม่
// =============================================
router.post('/', auth, async (req, res) => {
  try {
    const { card_number, card_name } = req.body;

    if (!card_number) {
      return res.status(400).json({
        success: false,
        message: 'กรุณากรอกหมายเลขบัตร'
      });
    }

    // Check if card number already exists
    const [existing] = await pool.query(
      'SELECT id FROM cards WHERE card_number = ?',
      [card_number]
    );

    if (existing.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'หมายเลขบัตรนี้มีอยู่ในระบบแล้ว'
      });
    }

    const [result] = await pool.query(
      'INSERT INTO cards (user_id, card_number, card_name, balance, issued_date, expiry_date) VALUES (?, ?, ?, 0.00, CURDATE(), DATE_ADD(CURDATE(), INTERVAL 5 YEAR))',
      [req.user.id, card_number, card_name || 'Rabbit Card']
    );

    const [newCard] = await pool.query(
      'SELECT * FROM cards WHERE id = ?',
      [result.insertId]
    );

    res.status(201).json({
      success: true,
      message: 'เพิ่มบัตรสำเร็จ',
      data: newCard[0]
    });
  } catch (error) {
    console.error('Add Card Error:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการเพิ่มบัตร'
    });
  }
});

// =============================================
// POST /api/cards/:id/topup - เติมเงิน
// =============================================
router.post('/:id/topup', auth, async (req, res) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const { amount, method } = req.body;
    const cardId = req.params.id;

    // Validate
    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'กรุณาระบุจำนวนเงินที่ถูกต้อง'
      });
    }

    if (amount < 100) {
      return res.status(400).json({
        success: false,
        message: 'จำนวนเงินขั้นต่ำ ฿100'
      });
    }

    if (amount > 4000) {
      return res.status(400).json({
        success: false,
        message: 'จำนวนเงินสูงสุด ฿4,000'
      });
    }

    // Check card ownership
    const [cards] = await conn.query(
      'SELECT * FROM cards WHERE id = ? AND user_id = ? AND is_active = 1',
      [cardId, req.user.id]
    );

    if (cards.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'ไม่พบบัตร'
      });
    }

    const card = cards[0];
    const newBalance = parseFloat(card.balance) + parseFloat(amount);

    // Max balance check
    if (newBalance > 10000) {
      return res.status(400).json({
        success: false,
        message: 'ยอดเงินในบัตรสูงสุดไม่เกิน ฿10,000'
      });
    }

    // Generate payment reference
    const paymentRef = `TU${Date.now()}${Math.floor(Math.random() * 1000)}`;

    // Update balance
    await conn.query(
      'UPDATE cards SET balance = ? WHERE id = ?',
      [newBalance, cardId]
    );

    // Record topup
    await conn.query(
      `INSERT INTO topups (card_id, user_id, amount, method, payment_ref, status, completed_at)
       VALUES (?, ?, ?, ?, ?, 'completed', NOW())`,
      [cardId, req.user.id, amount, method || 'promptpay', paymentRef]
    );

    await conn.commit();

    res.json({
      success: true,
      message: `เติมเงินสำเร็จ ฿${parseFloat(amount).toLocaleString()}`,
      data: {
        card_id: parseInt(cardId),
        previous_balance: parseFloat(card.balance),
        topup_amount: parseFloat(amount),
        new_balance: newBalance,
        payment_ref: paymentRef,
        method: method || 'promptpay'
      }
    });
  } catch (error) {
    await conn.rollback();
    console.error('Top-up Error:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการเติมเงิน'
    });
  } finally {
    conn.release();
  }
});

module.exports = router;
