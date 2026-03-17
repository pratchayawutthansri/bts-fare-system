import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const res = await api.post('/auth/login', { email, password });
      if (res.data.success) {
        login(res.data.data.token, res.data.data.user);
        navigate('/');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'การเข้าสู่ระบบล้มเหลว');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in" style={{ padding: '40px 20px', display: 'flex', flexDirection: 'column', minHeight: '100vh', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <div style={{ fontSize: '60px', marginBottom: '20px' }}>🚇</div>
        <h1 style={{ fontSize: '28px', fontWeight: 700, marginBottom: '8px' }}>BTS Rabbit Card</h1>
        <p style={{ color: 'var(--text-secondary)' }}>เข้าสู่ระบบเพื่อจัดการบัตรและการเดินทาง</p>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>อีเมล</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="demo@btsrabbit.com"
            style={{
              padding: '14px',
              borderRadius: '12px',
              border: '1px solid var(--glass-border)',
              backgroundColor: 'var(--bg-secondary)',
              color: 'white',
              outline: 'none'
            }}
            required
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>รหัสผ่าน</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="รหัสผ่านของคุณ"
            style={{
              padding: '14px',
              borderRadius: '12px',
              border: '1px solid var(--glass-border)',
              backgroundColor: 'var(--bg-secondary)',
              color: 'white',
              outline: 'none'
            }}
            required
          />
        </div>

        {error && <p style={{ color: 'var(--danger)', fontSize: '14px', textAlign: 'center' }}>{error}</p>}

        <button 
          className="btn-primary" 
          type="submit" 
          disabled={loading}
          style={{ marginTop: '10px', opacity: loading ? 0.7 : 1 }}
        >
          {loading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
        </button>
      </form>

      <div style={{ marginTop: 'auto', textAlign: 'center', padding: '20px 0' }}>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
          ยังไม่มีบัญชี? <span style={{ color: 'var(--accent-blue)', cursor: 'pointer' }}>สมัครสมาชิก</span>
        </p>
        <div style={{ marginTop: '20px', padding: '15px', borderRadius: '12px', backgroundColor: 'rgba(33, 150, 243, 0.1)', fontSize: '12px', color: 'var(--accent-blue)' }}>
          <strong>ทดสอบระบบ:</strong><br />
          Email: <code>demo@btsrabbit.com</code><br />
          Pass: <code>demo1234</code>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
