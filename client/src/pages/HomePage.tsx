import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import type { Card, Trip } from '../types';
import { useAuth } from '../context/AuthContext';

const HomePage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [card, setCard] = useState<Card | null>(null);
  const [recentTrips, setRecentTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const [cardRes, tripsRes] = await Promise.all([
          api.get('/cards'),
          api.get('/trips/recent')
        ]);
        if (cardRes.data.success && cardRes.data.data.length > 0) {
          setCard(cardRes.data.data[0]);
        }
        if (tripsRes.data.success) {
          setRecentTrips(tripsRes.data.data);
        }
      } catch (err) {
        console.error('Error fetching dashboard:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  const quickActions = [
    { icon: '🔢', label: 'คำนวณ', color: '#4facfe', path: '/calculate' },
    { icon: '📋', label: 'ประวัติ', color: '#00f2fe', path: '/history' },
    { icon: '🗺️', label: 'แผนที่', color: '#43e97b', path: '/map' },
    { icon: '⚙️', label: 'ตั้งค่า', color: '#fa709a', path: '/settings' }
  ];

  if (loading) return <div style={{ padding: '20px', textAlign: 'center' }}>กำลังโหลด...</div>;

  return (
    <div className="animate-fade-in" style={{ padding: '20px', paddingBottom: '140px' }}>
      {/* Header */}
      <header style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: 500 }}>สวัสดี, {user?.full_name || user?.username}</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>พร้อมเดินทางไปกับ BTS หรือยัง?</p>
        </div>
        <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'var(--bg-card)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          👤
        </div>
      </header>

      {/* Rabbit Card */}
      <div style={{
        background: 'linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%)',
        borderRadius: '24px',
        padding: '24px',
        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.4)',
        position: 'relative',
        overflow: 'hidden',
        marginBottom: '20px'
      }}>
        <div style={{ position: 'absolute', top: '-10%', right: '-10%', width: '150px', height: '150px', background: 'rgba(255,255,255,0.05)', borderRadius: '50%' }}></div>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
          <div>
            <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.7)', marginBottom: '4px' }}>Rabbit Card</p>
            <h3 style={{ fontSize: '18px', fontWeight: 600, letterSpacing: '2px' }}>{card?.card_number || 'XXXX XXXX XXXX XXXX'}</h3>
          </div>
          <div style={{ padding: '4px 8px', background: 'rgba(255,255,255,0.1)', borderRadius: '8px', fontSize: '12px' }}>
            {card?.card_name}
          </div>
        </div>

        <div>
          <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.7)', marginBottom: '4px' }}>ยอดเงินคงเหลือ</p>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
            <span style={{ fontSize: '28px', fontWeight: 700 }}>฿ {card?.balance?.toLocaleString() || '0.00'}</span>
          </div>
          <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', marginTop: '8px' }}>อัปเดตล่าสุด: วันนี้</p>
        </div>
      </div>

      {/* Quick Actions - Now clickable! */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '24px' }}>
        {quickActions.map((action, i) => (
          <div
            key={i}
            onClick={() => action.path && navigate(action.path)}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '8px',
              cursor: action.path ? 'pointer' : 'default',
              transition: 'transform 0.15s ease',
            }}
            onMouseEnter={(e) => { if (action.path) e.currentTarget.style.transform = 'scale(1.08)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
          >
            <div style={{
              width: '50px',
              height: '50px',
              borderRadius: '16px',
              padding: '1px',
              background: `linear-gradient(135deg, ${action.color}33, ${action.color}11)`,
              border: `1px solid ${action.color}44`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '20px'
            }}>
              {action.icon}
            </div>
            <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{action.label}</span>
          </div>
        ))}
      </div>

      {/* Recent Trips */}
      <section>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 600 }}>การเดินทางล่าสุด</h3>
          <span
            onClick={() => navigate('/history')}
            style={{ color: 'var(--accent-blue)', fontSize: '13px', cursor: 'pointer' }}
          >
            ดูทั้งหมด
          </span>
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {recentTrips.length > 0 ? recentTrips.map((trip) => (
            <div key={trip.id} className="glass" style={{
              padding: '16px',
              borderRadius: '16px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>
                  🚇
                </div>
                <div>
                  <h4 style={{ fontSize: '14px', fontWeight: 500 }}>{trip.from_station_name} → {trip.to_station_name}</h4>
                  <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{trip.line_name}</p>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ color: '#ef4444', fontWeight: 600 }}>-฿{Number(trip.fare).toFixed(0)}</p>
                <p style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{new Date(trip.trip_date).toLocaleDateString('th-TH', { day: 'numeric', month: 'short' })}</p>
              </div>
            </div>
          )) : (
            <p style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: '14px', padding: '20px' }}>ไม่มีประวัติการเดินทาง</p>
          )}
        </div>
      </section>

      {/* Top up Button - positioned above bottom nav with proper spacing */}
      <button className="btn-primary" onClick={() => navigate('/topup')} style={{
        position: 'fixed',
        bottom: '75px',
        left: '50%',
        transform: 'translateX(-50%)',
        width: 'calc(100% - 40px)',
        maxWidth: '410px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        boxShadow: '0 4px 15px rgba(33, 150, 243, 0.4)',
        zIndex: 999
      }}>
        <span style={{ fontSize: '20px' }}>+</span> เติมเงิน Rabbit Card
      </button>
    </div>
  );
};

export default HomePage;
