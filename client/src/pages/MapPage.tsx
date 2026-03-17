import React, { useEffect, useState } from 'react';
import api from '../api/axios';

interface Station {
  station_code: string;
  name_th: string;
  name_en: string;
  line_id: string;
  line_name_th: string;
  line_color: string;
  is_interchange: number;
}

interface LineGroup {
  id: string;
  name: string;
  color: string;
  stations: Station[];
}

const MapPage: React.FC = () => {
  const [lines, setLines] = useState<LineGroup[]>([]);
  const [activeLine, setActiveLine] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchStations = async () => {
      try {
        const res = await api.get('/fare/stations');
        if (res.data.success) {
          const responseData = res.data.data;
          const stationGroups = (responseData.lines || responseData) as Array<{ line_id: string; line_name: string; line_color: string; stations: Station[] }>;
          const mapped: LineGroup[] = stationGroups.map(g => ({
            id: g.line_id,
            name: g.line_name,
            color: g.line_color,
            stations: g.stations
          }));
          setLines(mapped);
        }
      } catch (err) {
        console.error('Error fetching stations:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStations();
  }, []);

  const allStations = lines.flatMap(l => l.stations.map(s => ({ ...s, lineColor: l.color, lineName: l.name })));

  const filteredStations = searchTerm
    ? allStations.filter(s =>
      s.name_th.includes(searchTerm) ||
      s.name_en.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.station_code.toLowerCase().includes(searchTerm.toLowerCase())
    )
    : [];

  const visibleLines = activeLine === 'all' ? lines : lines.filter(l => l.id === activeLine);

  if (loading) return <div style={{ padding: '20px', textAlign: 'center' }}>กำลังโหลด...</div>;

  return (
    <div className="animate-fade-in" style={{ padding: '20px', paddingBottom: '100px' }}>
      {/* Header */}
      <header style={{ marginBottom: '20px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 700 }}>🗺️ แผนที่โครงข่าย</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>เส้นทางรถไฟฟ้า BTS ทั้งหมด</p>
      </header>

      {/* Search */}
      <div style={{ marginBottom: '16px', position: 'relative' }}>
        <input
          type="text"
          placeholder="🔍 ค้นหาสถานี..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            width: '100%', padding: '12px 16px', borderRadius: '14px',
            border: '1px solid var(--glass-border)', background: 'var(--bg-secondary)',
            color: 'var(--text-primary)', fontSize: '14px', outline: 'none',
            boxSizing: 'border-box'
          }}
          onFocus={(e) => { e.target.style.borderColor = 'var(--accent-blue)'; }}
          onBlur={(e) => { e.target.style.borderColor = 'var(--glass-border)'; }}
        />
        {/* Search Results */}
        {searchTerm && (
          <div style={{
            position: 'absolute', top: '52px', left: 0, right: 0, zIndex: 100,
            background: 'var(--bg-secondary)', borderRadius: '14px',
            border: '1px solid var(--glass-border)', maxHeight: '250px', overflowY: 'auto',
            boxShadow: '0 8px 30px rgba(0,0,0,0.4)'
          }}>
            {filteredStations.length > 0 ? filteredStations.map((s, i) => (
              <div key={i} style={{
                padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '10px',
                borderBottom: '1px solid var(--glass-border)'
              }}>
                <div style={{
                  width: '10px', height: '10px', borderRadius: '50%',
                  background: s.lineColor, flexShrink: 0
                }} />
                <div>
                  <p style={{ fontSize: '14px', fontWeight: 500 }}>{s.station_code} {s.name_th}</p>
                  <p style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{s.name_en} · {s.lineName}</p>
                </div>
              </div>
            )) : (
              <div style={{ padding: '16px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '14px' }}>
                ไม่พบสถานี
              </div>
            )}
          </div>
        )}
      </div>

      {/* Line Filter Tabs */}
      <div style={{
        display: 'flex', gap: '8px', marginBottom: '20px', overflowX: 'auto',
        paddingBottom: '4px', scrollbarWidth: 'none'
      }}>
        <button onClick={() => setActiveLine('all')} style={{
          padding: '8px 16px', borderRadius: '20px', border: 'none', cursor: 'pointer',
          fontSize: '13px', fontWeight: 600, whiteSpace: 'nowrap',
          background: activeLine === 'all' ? 'var(--accent-blue)' : 'var(--bg-secondary)',
          color: activeLine === 'all' ? 'white' : 'var(--text-secondary)',
          transition: 'all 0.2s'
        }}>ทั้งหมด</button>
        {lines.map(line => (
          <button key={line.id} onClick={() => setActiveLine(line.id)} style={{
            padding: '8px 16px', borderRadius: '20px', border: 'none', cursor: 'pointer',
            fontSize: '13px', fontWeight: 600, whiteSpace: 'nowrap',
            background: activeLine === line.id ? line.color : 'var(--bg-secondary)',
            color: activeLine === line.id ? 'white' : 'var(--text-secondary)',
            transition: 'all 0.2s'
          }}>{line.name}</button>
        ))}
      </div>

      {/* Station Count */}
      <div style={{ marginBottom: '16px' }}>
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
          ทั้งหมด {visibleLines.reduce((s, l) => s + l.stations.length, 0)} สถานี
          {activeLine !== 'all' && ` · ${visibleLines[0]?.name}`}
        </p>
      </div>

      {/* Route Lines */}
      {visibleLines.map(line => (
        <div key={line.id} className="glass" style={{
          borderRadius: '20px', padding: '20px', marginBottom: '16px',
          borderLeft: `4px solid ${line.color}`
        }}>
          {/* Line Header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
            <div style={{
              width: '32px', height: '32px', borderRadius: '8px', background: line.color,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '14px', fontWeight: 700, color: line.color === '#FFD700' ? '#333' : 'white'
            }}>🚇</div>
            <div>
              <p style={{ fontWeight: 600, fontSize: '15px' }}>{line.name}</p>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{line.stations.length} สถานี</p>
            </div>
          </div>

          {/* Stations List */}
          <div style={{ paddingLeft: '4px' }}>
            {line.stations.map((station, idx) => (
              <div key={station.station_code} style={{
                display: 'flex', alignItems: 'flex-start', gap: '12px',
                position: 'relative', minHeight: '40px'
              }}>
                {/* Timeline */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '20px', flexShrink: 0 }}>
                  {/* Dot */}
                  <div style={{
                    width: station.is_interchange ? '16px' : '10px',
                    height: station.is_interchange ? '16px' : '10px',
                    borderRadius: '50%',
                    background: station.is_interchange ? 'white' : line.color,
                    border: station.is_interchange ? `3px solid ${line.color}` : 'none',
                    boxShadow: station.is_interchange ? `0 0 8px ${line.color}` : 'none',
                    zIndex: 1, flexShrink: 0
                  }} />
                  {/* Line connector */}
                  {idx < line.stations.length - 1 && (
                    <div style={{
                      width: '2px', flex: 1, minHeight: '24px',
                      background: `linear-gradient(180deg, ${line.color}, ${line.color}80)`
                    }} />
                  )}
                </div>

                {/* Station Info */}
                <div style={{ paddingBottom: '12px', flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{
                      fontSize: '11px', fontWeight: 700, color: line.color === '#FFD700' ? '#333' : 'white',
                      background: line.color, borderRadius: '4px', padding: '1px 6px',
                    }}>{station.station_code}</span>
                    <span style={{ fontSize: '14px', fontWeight: station.is_interchange ? 700 : 400 }}>
                      {station.name_th}
                    </span>
                    {station.is_interchange === 1 && (
                      <span style={{ fontSize: '11px', background: 'rgba(255,193,7,0.2)', color: '#ffc107', padding: '1px 6px', borderRadius: '4px' }}>🔄 เชื่อมต่อ</span>
                    )}
                  </div>
                  <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>{station.name_en}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default MapPage;
