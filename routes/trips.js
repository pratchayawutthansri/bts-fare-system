const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const auth = require('../middleware/auth');

// =============================================
// GET /api/trips - ประวัติการเดินทางทั้งหมด
// =============================================
router.get('/', auth, async (req, res) => {
  try {
    const { card_id, limit = 20, offset = 0, start_date, end_date } = req.query;

    let query = `
      SELECT t.*, c.card_number, c.card_name
      FROM trips t
      JOIN cards c ON t.card_id = c.id
      WHERE t.user_id = ?
    `;
    const params = [req.user.id];

    if (card_id) {
      query += ' AND t.card_id = ?';
      params.push(card_id);
    }

    if (start_date) {
      query += ' AND t.trip_date >= ?';
      params.push(start_date);
    }

    if (end_date) {
      query += ' AND t.trip_date <= ?';
      params.push(end_date);
    }

    // Get total count
    const countQuery = query.replace('SELECT t.*, c.card_number, c.card_name', 'SELECT COUNT(*) as total');
    const [countResult] = await pool.query(countQuery, params);
    const total = countResult[0].total;

    // Get paginated results
    query += ' ORDER BY t.entry_time DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const [trips] = await pool.query(query, params);

    // Calculate summary
    const [summary] = await pool.query(
      `SELECT 
        COUNT(*) as total_trips,
        COALESCE(SUM(fare), 0) as total_fare,
        COALESCE(AVG(fare), 0) as avg_fare
       FROM trips WHERE user_id = ?`,
      [req.user.id]
    );

    res.json({
      success: true,
      data: {
        trips,
        summary: summary[0],
        pagination: {
          total,
          limit: parseInt(limit),
          offset: parseInt(offset),
          has_more: parseInt(offset) + parseInt(limit) < total
        }
      }
    });
  } catch (error) {
    console.error('Get Trips Error:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการดึงประวัติการเดินทาง'
    });
  }
});

// =============================================
// GET /api/trips/recent - เดินทางล่าสุด (3 รายการ)
// =============================================
router.get('/recent', auth, async (req, res) => {
  try {
    const [trips] = await pool.query(
      `SELECT t.*, c.card_number
       FROM trips t
       JOIN cards c ON t.card_id = c.id
       WHERE t.user_id = ?
       ORDER BY t.entry_time DESC
       LIMIT 3`,
      [req.user.id]
    );

    res.json({
      success: true,
      data: trips
    });
  } catch (error) {
    console.error('Get Recent Trips Error:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาด'
    });
  }
});

// =============================================
// POST /api/trips - บันทึกการเดินทางใหม่
// =============================================
router.post('/', auth, async (req, res) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const { card_id, from_station_code, to_station_code } = req.body;

    if (!card_id || !from_station_code || !to_station_code) {
      return res.status(400).json({
        success: false,
        message: 'กรุณาระบุ card_id, from_station_code, to_station_code'
      });
    }

    // Verify card ownership
    const [cards] = await conn.query(
      'SELECT * FROM cards WHERE id = ? AND user_id = ? AND is_active = 1',
      [card_id, req.user.id]
    );

    if (cards.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'ไม่พบบัตร'
      });
    }

    const card = cards[0];

    // Get station info
    const [fromStations] = await conn.query(
      'SELECT * FROM bts_stations WHERE station_code = ?',
      [from_station_code]
    );
    const [toStations] = await conn.query(
      'SELECT * FROM bts_stations WHERE station_code = ?',
      [to_station_code]
    );

    if (fromStations.length === 0 || toStations.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'ไม่พบสถานี'
      });
    }

    const fromStation = fromStations[0];
    const toStation = toStations[0];

    // Calculate fare
    const zoneDiff = Math.abs(fromStation.zone - toStation.zone);
    const [fareRules] = await conn.query(
      'SELECT fare FROM fare_rules WHERE zone_count = ?',
      [Math.min(zoneDiff, 12)]
    );

    const fare = fareRules.length > 0 ? parseFloat(fareRules[0].fare) : 59;

    // Check balance
    if (parseFloat(card.balance) < fare) {
      return res.status(400).json({
        success: false,
        message: `ยอดเงินไม่เพียงพอ (ต้องการ ฿${fare}, คงเหลือ ฿${card.balance})`
      });
    }

    // Determine line name
    let lineName = 'ข้ามสาย';
    if (fromStation.line_id === toStation.line_id) {
      lineName = fromStation.line_name_th;
    }

    // Deduct fare
    const newBalance = parseFloat(card.balance) - fare;
    await conn.query(
      'UPDATE cards SET balance = ? WHERE id = ?',
      [newBalance, card_id]
    );

    // Record trip
    const now = new Date();
    const exitTime = new Date(now.getTime() + (Math.abs(fromStation.station_order - toStation.station_order) * 2 * 60000));

    const [result] = await conn.query(
      `INSERT INTO trips (card_id, user_id, from_station_code, from_station_name, to_station_code, to_station_name, fare, line_name, entry_time, exit_time, trip_date)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURDATE())`,
      [card_id, req.user.id, from_station_code, fromStation.name_th, to_station_code, toStation.name_th, fare, lineName, now, exitTime]
    );

    await conn.commit();

    res.status(201).json({
      success: true,
      message: 'บันทึกการเดินทางสำเร็จ',
      data: {
        trip_id: result.insertId,
        from: `${fromStation.name_th} (${from_station_code})`,
        to: `${toStation.name_th} (${to_station_code})`,
        fare,
        line: lineName,
        previous_balance: parseFloat(card.balance),
        new_balance: newBalance
      }
    });
  } catch (error) {
    await conn.rollback();
    console.error('Create Trip Error:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการบันทึกการเดินทาง'
    });
  } finally {
    conn.release();
  }
});

module.exports = router;
