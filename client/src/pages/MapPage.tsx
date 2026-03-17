import React from 'react';

const MapPage: React.FC = () => {
  return (
    <div className="animate-fade-in" style={{ padding: '20px', paddingBottom: '100px', height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <header style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 600 }}>แผนที่โครงข่าย</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>แผนที่เส้นทางรถไฟฟ้า BTS ทั้งหมด</p>
      </header>

      <div className="glass" style={{ flex: 1, borderRadius: '24px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyItems: 'center', backgroundColor: 'rgba(255,255,255,0.02)' }}>
        <div style={{ padding: '40px', textAlign: 'center', width: '100%' }}>
          <div style={{ fontSize: '64px', marginBottom: '20px' }}>🗺️</div>
          <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '12px' }}>แผนที่รถไฟฟ้า BTS</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '24px' }}>
            คุณสามารถดูแผนที่ฉบับเต็มได้ที่เว็บไซต์ทางการของ BTS
          </p>
          <a 
            href="https://www.bts.co.th/library/system-structur-route.html" 
            target="_blank" 
            rel="noopener noreferrer"
            className="btn-primary"
            style={{ textDecoration: 'none', display: 'inline-block' }}
          >
            ดูผ่านเว็บไซต์ BTS
          </a>
        </div>
      </div>
    </div>
  );
};

export default MapPage;
