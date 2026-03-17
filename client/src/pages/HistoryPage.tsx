import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import type { Trip } from '../types';

const HistoryPage: React.FC = () => {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await api.get('/trips');
        if (res.data.success) {
          setTrips(res.data.data.trips);
          setSummary(res.data.data.summary);
        }
      } catch (err) {
        console.error('Error fetching history:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  if (loading) return <div style={{ padding: '20px', color: 'var(--text-secondary)' }}>กำลังโหลด...</div>;

  return (
    <div className="animate-fade-in" style={{ padding: '20px', paddingBottom: '100px' }}>
      <header style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 600 }}>ประวัติการเดินทาง</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>รายการเดินทางทั้งหมดของคุณ</p>
      </header>

      {summary && (
        <div className="glass" style={{ padding: '20px', borderRadius: '24px', display: 'flex', justifyContent: 'space-around', marginBottom: '24px' }}>
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>ทั้งหมด</p>
            <p style={{ fontSize: '18px', fontWeight: 600 }}>{summary.total_trips} ครั้ง</p>
          </div>
          <div style={{ width: '1px', background: 'var(--glass-border)' }}></div>
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>ค่าใช้จ่ายรวม</p>
            <p style={{ fontSize: '18px', fontWeight: 600, color: 'var(--accent-blue)' }}>฿{Math.round(summary.total_fare)}</p>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {trips.length > 0 ? trips.map((trip) => (
          <div key={trip.id} className="glass" style={{ padding: '16px', borderRadius: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
              <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                {new Date(trip.trip_date).toLocaleDateString('th-TH', { day: 'numeric', month: 'long', year: 'numeric' })}
              </span>
              <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                {new Date(trip.entry_time).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent-blue)' }}></div>
                <div>
                  <h4 style={{ fontSize: '14px', fontWeight: 500 }}>{trip.from_station_name} → {trip.to_station_name}</h4>
                  <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>{trip.line_name}</p>
                </div>
              </div>
              <p style={{ color: '#ef4444', fontWeight: 600 }}>-฿{Number(trip.fare).toFixed(0)}</p>
            </div>
          </div>
        )) : (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>ยังไม่มีประวัติการเดินทาง</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default HistoryPage;
