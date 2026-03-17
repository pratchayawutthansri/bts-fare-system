const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const auth = require('../middleware/auth');

// =============================================
// GET /api/topups - ประวัติการเติมเงินทั้งหมด
// =============================================
router.get('/', auth, async (req, res) => {
  try {
    const { card_id, limit = 20, offset = 0 } = req.query;

    let query = `
      SELECT tp.*, c.card_number, c.card_name
      FROM topups tp
      JOIN cards c ON tp.card_id = c.id
      WHERE tp.user_id = ?
    `;
    const params = [req.user.id];

    if (card_id) {
      query += ' AND tp.card_id = ?';
      params.push(card_id);
    }

    const countQuery = query.replace('SELECT tp.*, c.card_number, c.card_name', 'SELECT COUNT(*) as total');
    const [countResult] = await pool.query(countQuery, params);

    query += ' ORDER BY tp.created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const [topups] = await pool.query(query, params);

    res.json({
      success: true,
      data: {
        topups,
        pagination: {
          total: countResult[0].total,
          limit: parseInt(limit),
          offset: parseInt(offset)
        }
      }
    });
  } catch (error) {
    console.error('Get Topups Error:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาด'
    });
  }
});

module.exports = router;
