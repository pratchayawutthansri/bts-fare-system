import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const SettingsPage: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showConfirm, setShowConfirm] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = [
    { icon: '👤', label: 'แก้ไขโปรไฟล์', desc: 'ชื่อ, อีเมล, เบอร์โทร', action: () => {} },
    { icon: '🔔', label: 'การแจ้งเตือน', desc: 'ตั้งค่าแจ้งเตือนการเดินทาง', action: () => {} },
    { icon: '🔒', label: 'เปลี่ยนรหัสผ่าน', desc: 'อัปเดตรหัสผ่านของคุณ', action: () => {} },
    { icon: '🌐', label: 'ภาษา', desc: 'ไทย', action: () => {} },
    { icon: '📱', label: 'เกี่ยวกับแอป', desc: 'BTS Rabbit Card v1.0.0', action: () => {} },
  ];

  return (
    <div className="animate-fade-in" style={{ padding: '20px', paddingBottom: '100px' }}>
      {/* Header */}
      <header style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 700 }}>ตั้งค่า</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>จัดการบัญชีและการตั้งค่า</p>
      </header>

      {/* Profile Card */}
      <div className="glass" style={{
        borderRadius: '20px',
        padding: '24px',
        marginBottom: '24px',
        display: 'flex',
        alignItems: 'center',
        gap: '16px'
      }}>
        <div style={{
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #4facfe, #00f2fe)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '28px',
          flexShrink: 0
        }}>
          👤
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '4px' }}>
            {user?.full_name || user?.username}
          </h3>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {user?.email}
          </p>
          {user?.phone && (
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '2px' }}>
              📞 {user.phone}
            </p>
          )}
        </div>
      </div>

      {/* Settings Menu */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '32px' }}>
        {menuItems.map((item, i) => (
          <div
            key={i}
            onClick={item.action}
            className="glass"
            style={{
              borderRadius: '16px',
              padding: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '14px',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateX(4px)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateX(0)'; }}
          >
            <span style={{ fontSize: '22px' }}>{item.icon}</span>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: '14px', fontWeight: 500 }}>{item.label}</p>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{item.desc}</p>
            </div>
            <span style={{ color: 'var(--text-secondary)', fontSize: '16px' }}>›</span>
          </div>
        ))}
      </div>

      {/* Logout Button */}
      <button
        onClick={() => setShowConfirm(true)}
        style={{
          width: '100%',
          padding: '14px',
          borderRadius: '14px',
          border: '1px solid rgba(244, 67, 54, 0.3)',
          background: 'rgba(244, 67, 54, 0.08)',
          color: '#f44336',
          fontSize: '15px',
          fontWeight: 600,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          transition: 'all 0.2s ease',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'rgba(244, 67, 54, 0.15)';
          e.currentTarget.style.borderColor = 'rgba(244, 67, 54, 0.5)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'rgba(244, 67, 54, 0.08)';
          e.currentTarget.style.borderColor = 'rgba(244, 67, 54, 0.3)';
        }}
      >
        🚪 ออกจากระบบ
      </button>

      {/* Confirmation Modal */}
      {showConfirm && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.6)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 2000,
          padding: '20px'
        }} onClick={() => setShowConfirm(false)}>
          <div
            style={{
              background: 'var(--bg-secondary)',
              borderRadius: '24px',
              padding: '32px 24px',
              width: '100%',
              maxWidth: '340px',
              textAlign: 'center',
              border: '1px solid var(--glass-border)',
              boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
              animation: 'fadeIn 0.2s ease-out'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>👋</div>
            <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '8px' }}>
              ออกจากระบบ?
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '24px' }}>
              คุณต้องการออกจากระบบใช่หรือไม่?
            </p>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => setShowConfirm(false)}
                style={{
                  flex: 1,
                  padding: '12px',
                  borderRadius: '12px',
                  border: '1px solid var(--glass-border)',
                  background: 'transparent',
                  color: 'var(--text-primary)',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                ยกเลิก
              </button>
              <button
                onClick={handleLogout}
                style={{
                  flex: 1,
                  padding: '12px',
                  borderRadius: '12px',
                  border: 'none',
                  background: '#f44336',
                  color: 'white',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                ออกจากระบบ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsPage;
