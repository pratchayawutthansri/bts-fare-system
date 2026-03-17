import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

// =============================================
// Reusable Modal Component
// =============================================
const Modal: React.FC<{
  show: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}> = ({ show, onClose, title, children }) => {
  if (!show) return null;
  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 2000, padding: '20px'
    }} onClick={onClose}>
      <div style={{
        background: 'var(--bg-secondary)', borderRadius: '24px',
        padding: '28px 24px', width: '100%', maxWidth: '380px',
        border: '1px solid var(--glass-border)',
        boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
        animation: 'fadeIn 0.2s ease-out'
      }} onClick={(e) => e.stopPropagation()}>
        <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '20px', textAlign: 'center' }}>{title}</h3>
        {children}
      </div>
    </div>
  );
};

// =============================================
// Input Component
// =============================================
const InputField: React.FC<{
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
}> = ({ label, value, onChange, type = 'text', placeholder }) => (
  <div style={{ marginBottom: '16px' }}>
    <label style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '6px', display: 'block' }}>{label}</label>
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      style={{
        width: '100%', padding: '12px 14px', borderRadius: '12px',
        border: '1px solid var(--glass-border)', background: 'var(--bg-primary)',
        color: 'var(--text-primary)', fontSize: '14px', outline: 'none',
        transition: 'border-color 0.2s',
        boxSizing: 'border-box'
      }}
      onFocus={(e) => { e.target.style.borderColor = 'var(--accent-blue)'; }}
      onBlur={(e) => { e.target.style.borderColor = 'var(--glass-border)'; }}
    />
  </div>
);

// =============================================
// Main Settings Page
// =============================================
const SettingsPage: React.FC = () => {
  const { user, logout, login } = useAuth();
  const navigate = useNavigate();

  // Modal states
  const [showProfile, setShowProfile] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showLanguage, setShowLanguage] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  // Profile form
  const [profileName, setProfileName] = useState(user?.full_name || '');
  const [profileEmail, setProfileEmail] = useState(user?.email || '');
  const [profilePhone, setProfilePhone] = useState(user?.phone || '');
  const [profileMsg, setProfileMsg] = useState('');
  const [profileLoading, setProfileLoading] = useState(false);

  // Password form
  const [currentPwd, setCurrentPwd] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');
  const [pwdMsg, setPwdMsg] = useState('');
  const [pwdLoading, setPwdLoading] = useState(false);

  // Notifications
  const [notifTrip, setNotifTrip] = useState(true);
  const [notifTopup, setNotifTopup] = useState(true);
  const [notifPromo, setNotifPromo] = useState(false);

  // Language
  const [language, setLanguage] = useState<'th' | 'en'>('th');

  // ---- Handlers ----
  const handleSaveProfile = async () => {
    setProfileLoading(true);
    setProfileMsg('');
    try {
      const res = await api.put('/auth/profile', {
        full_name: profileName,
        email: profileEmail,
        phone: profilePhone
      });
      if (res.data.success) {
        const token = localStorage.getItem('bts_token');
        if (token) login(token, res.data.data);
        setProfileMsg('✅ บันทึกสำเร็จ!');
        setTimeout(() => setShowProfile(false), 1000);
      }
    } catch (err: any) {
      setProfileMsg('❌ ' + (err.response?.data?.message || 'เกิดข้อผิดพลาด'));
    } finally {
      setProfileLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (newPwd !== confirmPwd) {
      setPwdMsg('❌ รหัสผ่านใหม่ไม่ตรงกัน');
      return;
    }
    setPwdLoading(true);
    setPwdMsg('');
    try {
      const res = await api.put('/auth/change-password', {
        currentPassword: currentPwd,
        newPassword: newPwd
      });
      if (res.data.success) {
        setPwdMsg('✅ เปลี่ยนรหัสผ่านสำเร็จ!');
        setCurrentPwd(''); setNewPwd(''); setConfirmPwd('');
        setTimeout(() => setShowPassword(false), 1000);
      }
    } catch (err: any) {
      setPwdMsg('❌ ' + (err.response?.data?.message || 'เกิดข้อผิดพลาด'));
    } finally {
      setPwdLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = [
    { icon: '👤', label: 'แก้ไขโปรไฟล์', desc: 'ชื่อ, อีเมล, เบอร์โทร', action: () => { setProfileMsg(''); setShowProfile(true); } },
    { icon: '🔔', label: 'การแจ้งเตือน', desc: 'ตั้งค่าแจ้งเตือนการเดินทาง', action: () => setShowNotifications(true) },
    { icon: '🔒', label: 'เปลี่ยนรหัสผ่าน', desc: 'อัปเดตรหัสผ่านของคุณ', action: () => { setPwdMsg(''); setCurrentPwd(''); setNewPwd(''); setConfirmPwd(''); setShowPassword(true); } },
    { icon: '🌐', label: 'ภาษา', desc: language === 'th' ? 'ไทย' : 'English', action: () => setShowLanguage(true) },
    { icon: '📱', label: 'เกี่ยวกับแอป', desc: 'BTS Rabbit Card v1.0.0', action: () => {} },
  ];

  // Toggle component
  const Toggle: React.FC<{ on: boolean; onToggle: () => void }> = ({ on, onToggle }) => (
    <div onClick={onToggle} style={{
      width: '48px', height: '26px', borderRadius: '13px', cursor: 'pointer',
      background: on ? 'var(--accent-blue)' : 'rgba(255,255,255,0.1)',
      position: 'relative', transition: 'background 0.2s', flexShrink: 0
    }}>
      <div style={{
        width: '22px', height: '22px', borderRadius: '50%', background: 'white',
        position: 'absolute', top: '2px',
        left: on ? '24px' : '2px', transition: 'left 0.2s',
        boxShadow: '0 1px 3px rgba(0,0,0,0.3)'
      }} />
    </div>
  );

  return (
    <div className="animate-fade-in" style={{ padding: '20px', paddingBottom: '100px' }}>
      {/* Header */}
      <header style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 700 }}>ตั้งค่า</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>จัดการบัญชีและการตั้งค่า</p>
      </header>

      {/* Profile Card */}
      <div className="glass" style={{
        borderRadius: '20px', padding: '24px', marginBottom: '24px',
        display: 'flex', alignItems: 'center', gap: '16px'
      }}>
        <div style={{
          width: '60px', height: '60px', borderRadius: '50%',
          background: 'linear-gradient(135deg, #4facfe, #00f2fe)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '28px', flexShrink: 0
        }}>👤</div>
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
          <div key={i} onClick={item.action} className="glass" style={{
            borderRadius: '16px', padding: '16px', display: 'flex',
            alignItems: 'center', gap: '14px', cursor: 'pointer',
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
      <button onClick={() => setShowLogoutConfirm(true)} style={{
        width: '100%', padding: '14px', borderRadius: '14px',
        border: '1px solid rgba(244, 67, 54, 0.3)',
        background: 'rgba(244, 67, 54, 0.08)', color: '#f44336',
        fontSize: '15px', fontWeight: 600, cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
        transition: 'all 0.2s ease',
      }}
        onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(244, 67, 54, 0.15)'; }}
        onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(244, 67, 54, 0.08)'; }}
      >🚪 ออกจากระบบ</button>

      {/* ==================== MODALS ==================== */}

      {/* 1. Edit Profile Modal */}
      <Modal show={showProfile} onClose={() => setShowProfile(false)} title="👤 แก้ไขโปรไฟล์">
        <InputField label="ชื่อ-นามสกุล" value={profileName} onChange={setProfileName} placeholder="กรอกชื่อ-นามสกุล" />
        <InputField label="อีเมล" value={profileEmail} onChange={setProfileEmail} type="email" placeholder="example@email.com" />
        <InputField label="เบอร์โทรศัพท์" value={profilePhone} onChange={setProfilePhone} placeholder="0891234567" />
        {profileMsg && <p style={{ textAlign: 'center', fontSize: '14px', marginBottom: '12px' }}>{profileMsg}</p>}
        <button onClick={handleSaveProfile} disabled={profileLoading} className="btn-primary" style={{
          width: '100%', padding: '12px', borderRadius: '12px', fontSize: '14px', fontWeight: 600
        }}>{profileLoading ? 'กำลังบันทึก...' : '💾 บันทึก'}</button>
      </Modal>

      {/* 2. Notifications Modal */}
      <Modal show={showNotifications} onClose={() => setShowNotifications(false)} title="🔔 การแจ้งเตือน">
        {[
          { label: 'แจ้งเตือนการเดินทาง', desc: 'เมื่อเข้า/ออกสถานี', on: notifTrip, toggle: () => setNotifTrip(!notifTrip) },
          { label: 'แจ้งเตือนเติมเงิน', desc: 'เมื่อเติมเงินสำเร็จ', on: notifTopup, toggle: () => setNotifTopup(!notifTopup) },
          { label: 'โปรโมชั่นและข่าวสาร', desc: 'รับข้อเสนอพิเศษจาก BTS', on: notifPromo, toggle: () => setNotifPromo(!notifPromo) },
        ].map((item, i) => (
          <div key={i} style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '14px 0', borderBottom: i < 2 ? '1px solid var(--glass-border)' : 'none'
          }}>
            <div>
              <p style={{ fontSize: '14px', fontWeight: 500 }}>{item.label}</p>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{item.desc}</p>
            </div>
            <Toggle on={item.on} onToggle={item.toggle} />
          </div>
        ))}
        <button onClick={() => setShowNotifications(false)} className="btn-primary" style={{
          width: '100%', padding: '12px', borderRadius: '12px', fontSize: '14px', fontWeight: 600, marginTop: '20px'
        }}>✅ เสร็จสิ้น</button>
      </Modal>

      {/* 3. Change Password Modal */}
      <Modal show={showPassword} onClose={() => setShowPassword(false)} title="🔒 เปลี่ยนรหัสผ่าน">
        <InputField label="รหัสผ่านปัจจุบัน" value={currentPwd} onChange={setCurrentPwd} type="password" placeholder="กรอกรหัสผ่านปัจจุบัน" />
        <InputField label="รหัสผ่านใหม่" value={newPwd} onChange={setNewPwd} type="password" placeholder="อย่างน้อย 6 ตัวอักษร" />
        <InputField label="ยืนยันรหัสผ่านใหม่" value={confirmPwd} onChange={setConfirmPwd} type="password" placeholder="กรอกรหัสผ่านใหม่อีกครั้ง" />
        {pwdMsg && <p style={{ textAlign: 'center', fontSize: '14px', marginBottom: '12px' }}>{pwdMsg}</p>}
        <button onClick={handleChangePassword} disabled={pwdLoading} className="btn-primary" style={{
          width: '100%', padding: '12px', borderRadius: '12px', fontSize: '14px', fontWeight: 600
        }}>{pwdLoading ? 'กำลังเปลี่ยน...' : '🔐 เปลี่ยนรหัสผ่าน'}</button>
      </Modal>

      {/* 4. Language Modal */}
      <Modal show={showLanguage} onClose={() => setShowLanguage(false)} title="🌐 เลือกภาษา">
        {[
          { code: 'th' as const, label: '🇹🇭 ไทย', desc: 'ภาษาไทย' },
          { code: 'en' as const, label: '🇺🇸 English', desc: 'ภาษาอังกฤษ' },
        ].map((lang) => (
          <div key={lang.code} onClick={() => setLanguage(lang.code)} style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '16px', borderRadius: '14px', cursor: 'pointer', marginBottom: '8px',
            background: language === lang.code ? 'rgba(33, 150, 243, 0.15)' : 'var(--bg-primary)',
            border: language === lang.code ? '2px solid var(--accent-blue)' : '2px solid transparent',
            transition: 'all 0.2s'
          }}>
            <div>
              <p style={{ fontSize: '16px', fontWeight: 600 }}>{lang.label}</p>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{lang.desc}</p>
            </div>
            {language === lang.code && <span style={{ color: 'var(--accent-blue)', fontSize: '20px' }}>✓</span>}
          </div>
        ))}
        <button onClick={() => setShowLanguage(false)} className="btn-primary" style={{
          width: '100%', padding: '12px', borderRadius: '12px', fontSize: '14px', fontWeight: 600, marginTop: '12px'
        }}>✅ บันทึก</button>
      </Modal>

      {/* 5. Logout Confirm Modal */}
      <Modal show={showLogoutConfirm} onClose={() => setShowLogoutConfirm(false)} title="">
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>👋</div>
          <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '8px' }}>ออกจากระบบ?</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '24px' }}>คุณต้องการออกจากระบบใช่หรือไม่?</p>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button onClick={() => setShowLogoutConfirm(false)} style={{
              flex: 1, padding: '12px', borderRadius: '12px',
              border: '1px solid var(--glass-border)', background: 'transparent',
              color: 'var(--text-primary)', fontSize: '14px', fontWeight: 600, cursor: 'pointer'
            }}>ยกเลิก</button>
            <button onClick={handleLogout} style={{
              flex: 1, padding: '12px', borderRadius: '12px',
              border: 'none', background: '#f44336',
              color: 'white', fontSize: '14px', fontWeight: 600, cursor: 'pointer'
            }}>ออกจากระบบ</button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default SettingsPage;
