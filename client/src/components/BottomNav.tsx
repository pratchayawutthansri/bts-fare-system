import React from 'react';
import { NavLink } from 'react-router-dom';

const BottomNav: React.FC = () => {
  const navItems = [
    { path: '/', label: 'หน้าหลัก', icon: '🏠' },
    { path: '/calculate', label: 'คำนวณ', icon: '🔢' },
    { path: '/map', label: 'แผนที่', icon: '🗺️' },
    { path: '/history', label: 'ประวัติ', icon: '📋' },
    { path: '/settings', label: 'ตั้งค่า', icon: '⚙️' },
  ];

  return (
    <nav style={{
      position: 'fixed',
      bottom: 0,
      width: '100%',
      maxWidth: '450px',
      backgroundColor: 'var(--bg-secondary)',
      display: 'flex',
      justifyContent: 'space-around',
      padding: '12px 0',
      borderTop: '1px solid var(--glass-border)',
      borderTopLeftRadius: '20px',
      borderTopRightRadius: '20px',
      zIndex: 1000
    }}>
      {navItems.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          style={({ isActive }) => ({
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textDecoration: 'none',
            color: isActive ? 'var(--accent-blue)' : 'var(--text-secondary)',
            fontSize: '12px',
            gap: '4px'
          })}
        >
          <span style={{ fontSize: '20px' }}>{item.icon}</span>
          <span>{item.label}</span>
        </NavLink>
      ))}
    </nav>
  );
};

export default BottomNav;
