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

    // =============================================
    // Real BTS Fare Calculation (2024 rates)
    // Based on number of stations traveled
    // =============================================
    // BTS fare table (station count -> fare in baht)
    const BTS_FARE_TABLE = {
      0: 0,     // สถานีเดียวกัน
      1: 17,    // 1 สถานี
      2: 17,    // 2 สถานี  
      3: 25,    // 3 สถานี
      4: 28,    // 4 สถานี
      5: 32,    // 5 สถานี
      6: 35,    // 6 สถานี
      7: 37,    // 7 สถานี
      8: 40,    // 8 สถานี
      9: 42,    // 9 สถานี
      10: 44,   // 10 สถานี
      11: 47,   // 11 สถานี
      12: 50,   // 12 สถานี
      13: 54,   // 13 สถานี
      14: 59,   // 14 สถานี หรือมากกว่า
    };

    // Calculate station count
    let stationCount;
    let lineInfo;

    if (fromStation.line_id === toStation.line_id) {
      // Same line - direct route
      stationCount = Math.abs(fromStation.station_order - toStation.station_order);
      lineInfo = {
        type: 'direct',
        line: fromStation.line_name_th,
        line_color: fromStation.line_color
      };
    } else {
      // Different lines - need interchange at Siam (CEN)
      // Get Siam station for each line
      const [siamStations] = await pool.query(
        'SELECT * FROM bts_stations WHERE station_code = ? OR (name_en = ? AND line_id = ?)',
        ['CEN', 'Siam', fromStation.line_id]
      );
      
      // For sukhumvit line, Siam is at order 24
      // For silom line, need to find the connection point
      let fromToSiam, siamToTo;
      
      if (fromStation.line_id === 'sukhumvit') {
        fromToSiam = Math.abs(fromStation.station_order - 24); // CEN is order 24 in sukhumvit
        // For silom, W1 (National Stadium) is near Siam
        siamToTo = toStation.station_order; // from start of silom line
      } else if (fromStation.line_id === 'silom') {
        fromToSiam = fromStation.station_order; // from silom to Siam area
        siamToTo = Math.abs(toStation.station_order - 24); // to destination in sukhumvit
      } else {
        // Gold line or other
        fromToSiam = fromStation.station_order + 8; // rough estimate via Krung Thon Buri
        siamToTo = Math.abs(toStation.station_order - 24);
      }
      
      stationCount = fromToSiam + siamToTo + 1; // +1 for interchange
      
      lineInfo = {
        type: 'interchange',
        lines: [
          { name: fromStation.line_name_th, color: fromStation.line_color },
          { name: toStation.line_name_th, color: toStation.line_color }
        ],
        interchange_station: 'สยาม (CEN)'
      };
    }

    // Look up fare from table
    const fareKey = Math.min(stationCount, 14);
    const fare = BTS_FARE_TABLE[fareKey] || 59;

    // Extension surcharge for stations beyond core network
    // Core network: N10-E14 (Sukhumvit), W1-S12 (Silom)
    // Extension stations get +15 baht surcharge
    let extensionSurcharge = 0;
    const extensionStations = ['E15','E16','E17','E18','E19','E20','E21','E22','E23','N11','N12','N13','N14','N15','N16','N17','N18','N19','N20','N21','N22','N23','N24'];
    
    if (extensionStations.includes(fromStation.station_code) || extensionStations.includes(toStation.station_code)) {
      extensionSurcharge = 15;
    }

    const totalFare = fare + extensionSurcharge;
    const estimatedMinutes = stationCount * 2;

    // Description
    let fareDesc = `${stationCount} สถานี`;
    if (extensionSurcharge > 0) {
      fareDesc += ` (รวมส่วนต่อขยาย +฿${extensionSurcharge})`;
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
          amount: totalFare,
          formatted: `฿${totalFare.toFixed(0)}`,
          zone_count: stationCount,
          description: fareDesc
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
