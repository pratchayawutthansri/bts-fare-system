-- =============================================
-- BTS Rabbit Card Management System
-- Database Schema
-- =============================================

CREATE DATABASE IF NOT EXISTS bts_rabbit_card
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE bts_rabbit_card;

-- =============================================
-- 1. Users Table - ผู้ใช้งาน
-- =============================================
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  email VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  full_name VARCHAR(100) DEFAULT NULL,
  phone VARCHAR(20) DEFAULT NULL,
  avatar_url VARCHAR(500) DEFAULT NULL,
  is_active TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_username (username)
) ENGINE=InnoDB;

-- =============================================
-- 2. Cards Table - บัตร Rabbit Card
-- =============================================
CREATE TABLE IF NOT EXISTS cards (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  card_number VARCHAR(19) NOT NULL COMMENT 'XXXX XXXX XXXX XXXX format',
  card_name VARCHAR(50) DEFAULT 'Rabbit Card',
  balance DECIMAL(10,2) DEFAULT 0.00,
  is_active TINYINT(1) DEFAULT 1,
  issued_date DATE DEFAULT NULL,
  expiry_date DATE DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_card_number (card_number)
) ENGINE=InnoDB;

-- =============================================
-- 3. Trips Table - ประวัติการเดินทาง
-- =============================================
CREATE TABLE IF NOT EXISTS trips (
  id INT AUTO_INCREMENT PRIMARY KEY,
  card_id INT NOT NULL,
  user_id INT NOT NULL,
  from_station_code VARCHAR(10) NOT NULL,
  from_station_name VARCHAR(100) NOT NULL,
  to_station_code VARCHAR(10) NOT NULL,
  to_station_name VARCHAR(100) NOT NULL,
  fare DECIMAL(6,2) NOT NULL,
  line_name VARCHAR(50) NOT NULL COMMENT 'BTS สุขุมวิท / BTS สีลม / ข้ามสาย',
  entry_time DATETIME NOT NULL,
  exit_time DATETIME DEFAULT NULL,
  trip_date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (card_id) REFERENCES cards(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_card_id (card_id),
  INDEX idx_user_id (user_id),
  INDEX idx_trip_date (trip_date)
) ENGINE=InnoDB;

-- =============================================
-- 4. Top-up History - ประวัติการเติมเงิน
-- =============================================
CREATE TABLE IF NOT EXISTS topups (
  id INT AUTO_INCREMENT PRIMARY KEY,
  card_id INT NOT NULL,
  user_id INT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  method ENUM('credit_card', 'promptpay', 'bank_transfer', 'cash') NOT NULL DEFAULT 'promptpay',
  payment_ref VARCHAR(100) DEFAULT NULL,
  status ENUM('pending', 'completed', 'failed', 'refunded') DEFAULT 'pending',
  completed_at DATETIME DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (card_id) REFERENCES cards(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_card_id (card_id),
  INDEX idx_status (status)
) ENGINE=InnoDB;

-- =============================================
-- 5. BTS Stations - สถานี BTS (Reference Data)
-- =============================================
CREATE TABLE IF NOT EXISTS bts_stations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  station_code VARCHAR(10) NOT NULL UNIQUE,
  name_th VARCHAR(100) NOT NULL,
  name_en VARCHAR(100) NOT NULL,
  line_id VARCHAR(10) NOT NULL COMMENT 'sukhumvit / silom / gold',
  line_name_th VARCHAR(50) NOT NULL,
  line_color VARCHAR(7) NOT NULL COMMENT 'hex color code',
  zone INT NOT NULL DEFAULT 1,
  station_order INT NOT NULL,
  latitude DECIMAL(10,8) DEFAULT NULL,
  longitude DECIMAL(11,8) DEFAULT NULL,
  is_interchange TINYINT(1) DEFAULT 0,
  is_active TINYINT(1) DEFAULT 1,
  INDEX idx_line_id (line_id),
  INDEX idx_station_code (station_code)
) ENGINE=InnoDB;

-- =============================================
-- 6. Fare Rules - ตารางค่าโดยสาร
-- =============================================
CREATE TABLE IF NOT EXISTS fare_rules (
  id INT AUTO_INCREMENT PRIMARY KEY,
  zone_count INT NOT NULL UNIQUE COMMENT 'จำนวน zone ที่ข้าม',
  fare DECIMAL(6,2) NOT NULL COMMENT 'ค่าโดยสาร (บาท)',
  description VARCHAR(100) DEFAULT NULL
) ENGINE=InnoDB;

-- =============================================
-- SEED DATA: BTS Stations
-- =============================================

-- Sukhumvit Line (สายสุขุมวิท) - สีเขียวเข้ม
INSERT INTO bts_stations (station_code, name_th, name_en, line_id, line_name_th, line_color, zone, station_order, is_interchange) VALUES
-- ฝั่งเหนือ (คูคต - หมอชิต)
('N24', 'คูคต', 'Khu Khot', 'sukhumvit', 'สายสุขุมวิท', '#5EB954', 12, 1, 0),
('N23', 'แยก คปอ.', 'Yaek Kor Por Aor', 'sukhumvit', 'สายสุขุมวิท', '#5EB954', 12, 2, 0),
('N22', 'รังสิต', 'Rangsit', 'sukhumvit', 'สายสุขุมวิท', '#5EB954', 11, 3, 0),
('N21', 'มหาวิทยาลัยกรุงเทพ', 'Bangkok University', 'sukhumvit', 'สายสุขุมวิท', '#5EB954', 11, 4, 0),
('N20', 'กรมทหารราบที่ 11', 'Royal Thai Army 11th Infantry Regiment', 'sukhumvit', 'สายสุขุมวิท', '#5EB954', 10, 5, 0),
('N19', 'วัดพระศรีมหาธาตุ', 'Wat Phra Sri Mahathat', 'sukhumvit', 'สายสุขุมวิท', '#5EB954', 10, 6, 0),
('N18', 'พหลโยธิน 59', 'Phahon Yothin 59', 'sukhumvit', 'สายสุขุมวิท', '#5EB954', 9, 7, 0),
('N17', 'สายหยุด', 'Sai Yud', 'sukhumvit', 'สายสุขุมวิท', '#5EB954', 9, 8, 0),
('N16', 'พหลโยธิน 24', 'Phahon Yothin 24', 'sukhumvit', 'สายสุขุมวิท', '#5EB954', 8, 9, 0),
('N15', 'รัชโยธิน', 'Ratchayothin', 'sukhumvit', 'สายสุขุมวิท', '#5EB954', 8, 10, 0),
('N14', 'เสนานิคม', 'Sena Nikhom', 'sukhumvit', 'สายสุขุมวิท', '#5EB954', 7, 11, 0),
('N13', 'มหาวิทยาลัยเกษตรศาสตร์', 'Kasetsart University', 'sukhumvit', 'สายสุขุมวิท', '#5EB954', 7, 12, 0),
('N12', 'ห้าแยกลาดพร้าว', 'Ha Yaek Lat Phrao', 'sukhumvit', 'สายสุขุมวิท', '#5EB954', 6, 13, 1),
('N11', 'พหลโยธิน', 'Phahon Yothin', 'sukhumvit', 'สายสุขุมวิท', '#5EB954', 6, 14, 0),
('N10', 'หมอชิต', 'Mo Chit', 'sukhumvit', 'สายสุขุมวิท', '#5EB954', 5, 15, 1),
('N9', 'สะพานควาย', 'Saphan Khwai', 'sukhumvit', 'สายสุขุมวิท', '#5EB954', 5, 16, 0),
('N8', 'อารีย์', 'Ari', 'sukhumvit', 'สายสุขุมวิท', '#5EB954', 4, 17, 0),
('N7', 'เสนาร่วม', 'Sena Ruam', 'sukhumvit', 'สายสุขุมวิท', '#5EB954', 4, 18, 0),
('N5', 'ราชเทวี', 'Ratchathewi', 'sukhumvit', 'สายสุขุมวิท', '#5EB954', 3, 19, 0),
('N4', 'อนุสาวรีย์ชัยสมรภูมิ', 'Victory Monument', 'sukhumvit', 'สายสุขุมวิท', '#5EB954', 3, 20, 0),
('N3', 'พญาไท', 'Phaya Thai', 'sukhumvit', 'สายสุขุมวิท', '#5EB954', 3, 21, 1),
('N2', 'สนามกีฬาแห่งชาติ', 'National Stadium', 'sukhumvit', 'สายสุขุมวิท', '#5EB954', 2, 22, 0),
('N1', 'ราชดำริ', 'Ratchadamri', 'sukhumvit', 'สายสุขุมวิท', '#5EB954', 2, 23, 0),
-- สยาม (จุดเชื่อมต่อ)
('CEN', 'สยาม', 'Siam', 'sukhumvit', 'สายสุขุมวิท', '#5EB954', 1, 24, 1),
-- ฝั่งใต้/ตะวันออก
('E1', 'ชิดลม', 'Chit Lom', 'sukhumvit', 'สายสุขุมวิท', '#5EB954', 1, 25, 0),
('E2', 'เพลินจิต', 'Phloen Chit', 'sukhumvit', 'สายสุขุมวิท', '#5EB954', 1, 26, 0),
('E3', 'นานา', 'Nana', 'sukhumvit', 'สายสุขุมวิท', '#5EB954', 2, 27, 0),
('E4', 'อโศก', 'Asok', 'sukhumvit', 'สายสุขุมวิท', '#5EB954', 2, 28, 1),
('E5', 'พร้อมพงษ์', 'Phrom Phong', 'sukhumvit', 'สายสุขุมวิท', '#5EB954', 2, 29, 0),
('E6', 'ทองหล่อ', 'Thong Lo', 'sukhumvit', 'สายสุขุมวิท', '#5EB954', 3, 30, 0),
('E7', 'เอกมัย', 'Ekkamai', 'sukhumvit', 'สายสุขุมวิท', '#5EB954', 3, 31, 0),
('E8', 'พระโขนง', 'Phra Khanong', 'sukhumvit', 'สายสุขุมวิท', '#5EB954', 4, 32, 0),
('E9', 'อ่อนนุช', 'On Nut', 'sukhumvit', 'สายสุขุมวิท', '#5EB954', 4, 33, 0),
('E10', 'บางจาก', 'Bang Chak', 'sukhumvit', 'สายสุขุมวิท', '#5EB954', 5, 34, 0),
('E11', 'ปุณณวิถี', 'Punnawithi', 'sukhumvit', 'สายสุขุมวิท', '#5EB954', 5, 35, 0),
('E12', 'อุดมสุข', 'Udom Suk', 'sukhumvit', 'สายสุขุมวิท', '#5EB954', 6, 36, 0),
('E13', 'บางนา', 'Bang Na', 'sukhumvit', 'สายสุขุมวิท', '#5EB954', 6, 37, 0),
('E14', 'แบริ่ง', 'Bearing', 'sukhumvit', 'สายสุขุมวิท', '#5EB954', 7, 38, 0),
('E15', 'สำโรง', 'Samrong', 'sukhumvit', 'สายสุขุมวิท', '#5EB954', 7, 39, 1),
('E16', 'ปู่เจ้าสมิงพราย', 'Pu Chao Saming Phrai', 'sukhumvit', 'สายสุขุมวิท', '#5EB954', 8, 40, 0),
('E17', 'ช้างเอราวัณ', 'Chang Erawan', 'sukhumvit', 'สายสุขุมวิท', '#5EB954', 8, 41, 0),
('E18', 'โรงเรียนนายเรือ', 'Royal Thai Naval Academy', 'sukhumvit', 'สายสุขุมวิท', '#5EB954', 9, 42, 0),
('E19', 'ปากน้ำ', 'Pak Nam', 'sukhumvit', 'สายสุขุมวิท', '#5EB954', 9, 43, 0),
('E20', 'ศรีนครินทร์', 'Si Nakharin', 'sukhumvit', 'สายสุขุมวิท', '#5EB954', 10, 44, 0),
('E21', 'แพรกษา', 'Phraek Sa', 'sukhumvit', 'สายสุขุมวิท', '#5EB954', 10, 45, 0),
('E22', 'สายลวด', 'Sai Luat', 'sukhumvit', 'สายสุขุมวิท', '#5EB954', 11, 46, 0),
('E23', 'เคหะฯ', 'Kheha', 'sukhumvit', 'สายสุขุมวิท', '#5EB954', 11, 47, 0),

-- Silom Line (สายสีลม) - สีเขียวอ่อน
('W1', 'สนามกีฬาแห่งชาติ', 'National Stadium', 'silom', 'สายสีลม', '#89C43F', 1, 1, 0),
('S1', 'ราชดำริ', 'Ratchadamri', 'silom', 'สายสีลม', '#89C43F', 1, 2, 0),
('S2', 'ศาลาแดง', 'Sala Daeng', 'silom', 'สายสีลม', '#89C43F', 1, 3, 1),
('S3', 'ช่องนนทรี', 'Chong Nonsi', 'silom', 'สายสีลม', '#89C43F', 2, 4, 0),
('S4', 'เซนต์หลุยส์', 'Saint Louis', 'silom', 'สายสีลม', '#89C43F', 2, 5, 0),
('S5', 'สุรศักดิ์', 'Surasak', 'silom', 'สายสีลม', '#89C43F', 3, 6, 0),
('S6', 'สะพานตากสิน', 'Saphan Taksin', 'silom', 'สายสีลม', '#89C43F', 3, 7, 0),
('S7', 'กรุงธนบุรี', 'Krung Thon Buri', 'silom', 'สายสีลม', '#89C43F', 4, 8, 0),
('S8', 'วงเวียนใหญ่', 'Wongwian Yai', 'silom', 'สายสีลม', '#89C43F', 4, 9, 0),
('S9', 'โพธิ์นิมิตร', 'Pho Nimit', 'silom', 'สายสีลม', '#89C43F', 5, 10, 0),
('S10', 'ตลาดพลู', 'Talat Phlu', 'silom', 'สายสีลม', '#89C43F', 5, 11, 0),
('S11', 'วุฒากาศ', 'Wutthakat', 'silom', 'สายสีลม', '#89C43F', 6, 12, 0),
('S12', 'บางหว้า', 'Bang Wa', 'silom', 'สายสีลม', '#89C43F', 6, 13, 1),

-- Gold Line (สายสีทอง)
('G1', 'กรุงธนบุรี', 'Krung Thon Buri', 'gold', 'สายสีทอง', '#FFD700', 1, 1, 1),
('G2', 'เจริญนคร', 'Charoen Nakhon', 'gold', 'สายสีทอง', '#FFD700', 1, 2, 0),
('G3', 'คลองสาน', 'Khlong San', 'gold', 'สายสีทอง', '#FFD700', 1, 3, 0);

-- =============================================
-- SEED DATA: Fare Rules (Zone-based)
-- =============================================
INSERT INTO fare_rules (zone_count, fare, description) VALUES
(0, 0.00, 'สถานีเดียวกัน'),
(1, 16.00, 'ข้าม 1 zone'),
(2, 23.00, 'ข้าม 2 zones'),
(3, 26.00, 'ข้าม 3 zones'),
(4, 30.00, 'ข้าม 4 zones'),
(5, 33.00, 'ข้าม 5 zones'),
(6, 37.00, 'ข้าม 6 zones'),
(7, 40.00, 'ข้าม 7 zones'),
(8, 44.00, 'ข้าม 8 zones'),
(9, 47.00, 'ข้าม 9 zones'),
(10, 50.00, 'ข้าม 10 zones'),
(11, 54.00, 'ข้าม 11 zones'),
(12, 59.00, 'ข้าม 12 zones หรือมากกว่า');

-- =============================================
-- SEED DATA: Demo User + Card + Trips
-- =============================================
-- Password: demo1234 (bcrypt hashed)
INSERT INTO users (username, email, password, full_name, phone) VALUES
('demo', 'demo@btsrabbit.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'ผู้ใช้ทดสอบ', '0891234567');

INSERT INTO cards (user_id, card_number, card_name, balance, issued_date, expiry_date) VALUES
(1, 'XXXX XXXX XXXX 4829', 'Rabbit Card', 342.00, '2024-01-15', '2029-01-15');

INSERT INTO trips (card_id, user_id, from_station_code, from_station_name, to_station_code, to_station_name, fare, line_name, entry_time, exit_time, trip_date) VALUES
(1, 1, 'CEN', 'สยาม', 'E4', 'อโศก', 44.00, 'BTS สุขุมวิท', '2026-03-15 09:00:00', '2026-03-15 09:12:00', '2026-03-15'),
(1, 1, 'N10', 'หมอชิต', 'N4', 'อนุสาวรีย์ชัยสมรภูมิ', 37.00, 'BTS สุขุมวิท', '2026-03-14 18:30:00', '2026-03-14 18:40:00', '2026-03-14'),
(1, 1, 'S6', 'สะพานตากสิน', 'S2', 'ศาลาแดง', 16.00, 'BTS สีลม', '2026-03-14 12:00:00', '2026-03-14 12:05:00', '2026-03-14');

INSERT INTO topups (card_id, user_id, amount, method, status, completed_at) VALUES
(1, 1, 500.00, 'promptpay', 'completed', '2026-03-10 14:30:00'),
(1, 1, 200.00, 'credit_card', 'completed', '2026-03-05 10:15:00');
