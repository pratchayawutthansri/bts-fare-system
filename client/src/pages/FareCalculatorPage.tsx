import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import type { StationGroup, FareResult, Station } from '../types';

const FareCalculatorPage: React.FC = () => {
  const [stationLines, setStationLines] = useState<StationGroup[]>([]);
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [result, setResult] = useState<FareResult | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchStations = async () => {
      try {
        const res = await api.get('/fare/stations');
        if (res.data.success) {
          setStationLines(res.data.data.lines);
        }
      } catch (err) {
        console.error('Error fetching stations:', err);
      }
    };
    fetchStations();
  }, []);

  const handleCalculate = async () => {
    if (!from || !to) return;
    setLoading(true);
    try {
      const res = await api.get(`/fare/calculate?from=${from}&to=${to}`);
      if (res.data.success) {
        setResult(res.data.data);
      }
    } catch (err) {
      console.error('Calculation error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (from && to) {
      handleCalculate();
    }
  }, [from, to]);

  return (
    <div className="animate-fade-in" style={{ padding: '20px', paddingBottom: '100px' }}>
      <header style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 600 }}>คำนวณค่าโดยสาร</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>ตรวจสอบราคาและเวลาในการเดินทาง</p>
      </header>

      <div className="glass" style={{ padding: '24px', borderRadius: '24px', display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label htmlFor="from-station" style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>🔴 สถานีต้นทาง</label>
          <select 
            id="from-station"
            value={from} 
            onChange={(e) => setFrom(e.target.value)}
            style={{ padding: '14px', borderRadius: '12px', background: 'var(--bg-secondary)', color: 'white', border: '1px solid var(--glass-border)', outline: 'none' }}
          >
            <option value="">เลือกสถานีต้นทาง</option>
            {stationLines.map((line: StationGroup) => (
              <optgroup key={line.line_id} label={line.line_name}>
                {line.stations.map((s: Station) => (
                  <option key={s.station_code} value={s.station_code}>{s.name_th} ({s.station_code})</option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', color: 'var(--text-secondary)' }}>⇅</div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label htmlFor="to-station" style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>🟢 สถานีปลายทาง</label>
          <select 
            id="to-station"
            value={to} 
            onChange={(e) => setTo(e.target.value)}
            style={{ padding: '14px', borderRadius: '12px', background: 'var(--bg-secondary)', color: 'white', border: '1px solid var(--glass-border)', outline: 'none' }}
          >
            <option value="">เลือกสถานีปลายทาง</option>
            {stationLines.map((line: StationGroup) => (
              <optgroup key={line.line_id} label={line.line_name}>
                {line.stations.map((s: Station) => (
                  <option key={s.station_code} value={s.station_code}>{s.name_th} ({s.station_code})</option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>
      </div>

      {loading && <p style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>กำลังคำนวณ...</p>}

      {result && !loading && (
        <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', gap: '12px' }}>
            <div className="glass" style={{ flex: 1, padding: '20px', borderRadius: '20px', textAlign: 'center' }}>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>ค่าโดยสาร</p>
              <h3 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--accent-blue)' }}>{result.fare.formatted}</h3>
            </div>
            <div className="glass" style={{ flex: 1, padding: '20px', borderRadius: '20px', textAlign: 'center' }}>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>ใช้เวลาประมาณ</p>
              <h3 style={{ fontSize: '24px', fontWeight: 700 }}>{result.travel.estimated_minutes} <span style={{ fontSize: '14px', fontWeight: 400 }}>นาที</span></h3>
            </div>
          </div>

          <div className="glass" style={{ padding: '20px', borderRadius: '20px' }}>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '12px' }}>ข้อมูลเส้นทาง</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ 
                padding: '8px 12px', 
                borderRadius: '8px', 
                background: result.line_info.type === 'direct' ? result.line_info.line_color : '#334155', 
                fontSize: '12px', 
                fontWeight: 600 
              }}>
                {result.line_info.type === 'direct' ? result.line_info.line : 'หลายสาย'}
              </div>
              <p style={{ fontSize: '14px' }}>ผ่านทั้งหมด {result.travel.station_count} สถานี</p>
            </div>
            {result.line_info.type === 'interchange' && (
              <p style={{ fontSize: '12px', color: 'var(--warning)', marginTop: '8px' }}>⚠️ เปลี่ยนขบวนที่สถานี {result.line_info.interchange_station}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default FareCalculatorPage;
