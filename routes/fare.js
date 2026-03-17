const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// =============================================
// GET /api/fare/stations - รายชื่อสถานี BTS ทั้งหมด
// =============================================
router.get('/stations', async (req, res) => {
  try {
    const { line_id, search } = req.query;

    let query = 'SELECT * FROM bts_stations WHERE is_active = 1';
    const params = [];

    if (line_id) {
      query += ' AND line_id = ?';
      params.push(line_id);
    }

    if (search) {
      query += ' AND (name_th LIKE ? OR name_en LIKE ? OR station_code LIKE ?)';
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    query += ' ORDER BY line_id, station_order';

    const [stations] = await pool.query(query, params);

    // Group by line
    const grouped = {};
    stations.forEach(station => {
      const lineKey = station.line_id;
      if (!grouped[lineKey]) {
        grouped[lineKey] = {
          line_id: station.line_id,
          line_name: station.line_name_th,
          line_color: station.line_color,
          stations: []
        };
      }
      grouped[lineKey].stations.push(station);
    });

    res.json({
      success: true,
      data: {
        total: stations.length,
        lines: Object.values(grouped),
        all_stations: stations
      }
    });
  } catch (error) {
    console.error('Get Stations Error:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการดึงข้อมูลสถานี'
    });
  }
});

// =============================================
// GET /api/fare/calculate - คำนวณค่าโดยสาร
// =============================================
router.get('/calculate', async (req, res) => {
  try {
    const { from, to } = req.query;

    if (!from || !to) {
      return res.status(400).json({
        success: false,
        message: 'กรุณาระบุสถานีต้นทาง (from) และปลายทาง (to)'
      });
    }

    // Get station info
    const [fromStations] = await pool.query(
      'SELECT * FROM bts_stations WHERE station_code = ?',
      [from.toUpperCase()]
    );
    const [toStations] = await pool.query(
      'SELECT * FROM bts_stations WHERE station_code = ?',
      [to.toUpperCase()]
    );

    if (fromStations.length === 0) {
      return res.status(404).json({
        success: false,
        message: `ไม่พบสถานี ${from}`
      });
    }

    if (toStations.length === 0) {
      return res.status(404).json({
        success: false,
        message: `ไม่พบสถานี ${to}`
      });
    }

    const fromStation = fromStations[0];
    const toStation = toStations[0];

    // Calculate zone difference
    const zoneDiff = Math.abs(fromStation.zone - toStation.zone);
    const cappedZone = Math.min(zoneDiff, 12);

    // Get fare from rules
    const [fareRules] = await pool.query(
      'SELECT * FROM fare_rules WHERE zone_count = ?',
      [cappedZone]
    );

    const fare = fareRules.length > 0 ? parseFloat(fareRules[0].fare) : 59;

    // Calculate approximate travel time (2 min per station)
    let stationCount;
    if (fromStation.line_id === toStation.line_id) {
      stationCount = Math.abs(fromStation.station_order - toStation.station_order);
    } else {
      // Cross line - rough estimate via Siam interchange
      stationCount = Math.abs(fromStation.station_order - 24) + Math.abs(toStation.station_order - 1) + 2;
    }
    const estimatedMinutes = stationCount * 2;

    // Determine line info
    let lineInfo;
    if (fromStation.line_id === toStation.line_id) {
      lineInfo = {
        type: 'direct',
        line: fromStation.line_name_th,
        line_color: fromStation.line_color
      };
    } else {
      lineInfo = {
        type: 'interchange',
        lines: [
          { name: fromStation.line_name_th, color: fromStation.line_color },
          { name: toStation.line_name_th, color: toStation.line_color }
        ],
        interchange_station: 'สยาม (CEN)'
      };
    }

    res.json({
      success: true,
      data: {
        from: {
          code: fromStation.station_code,
          name_th: fromStation.name_th,
          name_en: fromStation.name_en,
          line: fromStation.line_name_th,
          zone: fromStation.zone
        },
        to: {
          code: toStation.station_code,
          name_th: toStation.name_th,
          name_en: toStation.name_en,
          line: toStation.line_name_th,
          zone: toStation.zone
        },
        fare: {
          amount: fare,
          formatted: `฿${fare.toFixed(0)}`,
          zone_count: zoneDiff,
          description: fareRules.length > 0 ? fareRules[0].description : 'ข้าม 12+ zones'
        },
        travel: {
          station_count: stationCount,
          estimated_minutes: estimatedMinutes,
          estimated_text: `ประมาณ ${estimatedMinutes} นาที`
        },
        line_info: lineInfo
      }
    });
  } catch (error) {
    console.error('Calculate Fare Error:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการคำนวณค่าโดยสาร'
    });
  }
});

// =============================================
// GET /api/fare/rules - ตารางค่าโดยสาร
// =============================================
router.get('/rules', async (req, res) => {
  try {
    const [rules] = await pool.query(
      'SELECT * FROM fare_rules ORDER BY zone_count'
    );

    res.json({
      success: true,
      data: rules
    });
  } catch (error) {
    console.error('Get Fare Rules Error:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาด'
    });
  }
});

module.exports = router;
