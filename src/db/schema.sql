-- ====================================================
-- Clean Madurai - Complete Database Schema
-- ====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ===== PROFILES TABLE =====
-- Stores user information for all roles
CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  auth_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  role TEXT NOT NULL CHECK (role IN ('admin', 'worker', 'citizen', 'incharge')),
  area TEXT,
  zone TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===== DUSTBINS TABLE =====
CREATE TABLE dustbins (
  id TEXT PRIMARY KEY,
  lat DOUBLE PRECISION NOT NULL,
  lng DOUBLE PRECISION NOT NULL,
  area TEXT NOT NULL,
  zone TEXT NOT NULL,
  status TEXT DEFAULT 'clean' CHECK (status IN ('clean', 'partial', 'full')),
  incharge_id UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===== COMPLAINTS TABLE =====
CREATE TABLE complaints (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  dustbin_id TEXT REFERENCES dustbins(id),
  citizen_id UUID REFERENCES profiles(id),
  area TEXT NOT NULL,
  description TEXT NOT NULL,
  photo_url TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in-progress', 'resolved')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===== COMPLAINT ACTIONS TABLE =====
-- Tracks what actions were taken on each complaint (visible to citizens)
CREATE TABLE complaint_actions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  complaint_id UUID REFERENCES complaints(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  status TEXT NOT NULL,
  acted_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===== WORKER PHOTOS TABLE =====
-- Daily geo-tagged photos uploaded by workers
CREATE TABLE worker_photos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  worker_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  dustbin_id TEXT REFERENCES dustbins(id),
  photo_url TEXT NOT NULL,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  uploaded_at TIMESTAMPTZ DEFAULT NOW(),
  verified BOOLEAN DEFAULT FALSE,
  verified_by UUID REFERENCES profiles(id),
  verified_at TIMESTAMPTZ,
  notes TEXT
);

-- ===== NOTIFICATIONS TABLE =====
-- Notifications for admins (e.g., worker didn't upload photo)
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'info' CHECK (type IN ('info', 'warning', 'alert', 'success')),
  read BOOLEAN DEFAULT FALSE,
  related_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===== INDEXES =====
CREATE INDEX idx_complaints_citizen ON complaints(citizen_id);
CREATE INDEX idx_complaints_status ON complaints(status);
CREATE INDEX idx_complaints_dustbin ON complaints(dustbin_id);
CREATE INDEX idx_worker_photos_worker ON worker_photos(worker_id);
CREATE INDEX idx_worker_photos_date ON worker_photos(uploaded_at);
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(user_id, read);
CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_dustbins_status ON dustbins(status);

-- ===== ROW LEVEL SECURITY =====
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE dustbins ENABLE ROW LEVEL SECURITY;
ALTER TABLE complaints ENABLE ROW LEVEL SECURITY;
ALTER TABLE complaint_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE worker_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Profiles: users can read all profiles, update only their own
CREATE POLICY "Profiles are viewable by everyone" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = auth_id);
CREATE POLICY "Admins can insert profiles" ON profiles FOR INSERT WITH CHECK (true);

-- Dustbins: everyone can read, only admin/incharge can update
CREATE POLICY "Dustbins are viewable by everyone" ON dustbins FOR SELECT USING (true);
CREATE POLICY "Admin can manage dustbins" ON dustbins FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE auth_id = auth.uid() AND role IN ('admin', 'incharge'))
);

-- Complaints: citizens see their own, admin/incharge see all
CREATE POLICY "Citizens see own complaints" ON complaints FOR SELECT USING (
  citizen_id IN (SELECT id FROM profiles WHERE auth_id = auth.uid())
  OR EXISTS (SELECT 1 FROM profiles WHERE auth_id = auth.uid() AND role IN ('admin', 'incharge'))
);
CREATE POLICY "Citizens can create complaints" ON complaints FOR INSERT WITH CHECK (
  citizen_id IN (SELECT id FROM profiles WHERE auth_id = auth.uid())
);
CREATE POLICY "Admin can update complaints" ON complaints FOR UPDATE USING (
  EXISTS (SELECT 1 FROM profiles WHERE auth_id = auth.uid() AND role IN ('admin', 'incharge'))
);

-- Complaint Actions: visible to complaint owner and admin
CREATE POLICY "Actions viewable by relevant users" ON complaint_actions FOR SELECT USING (true);
CREATE POLICY "Admin can add actions" ON complaint_actions FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM profiles WHERE auth_id = auth.uid() AND role IN ('admin', 'incharge'))
);

-- Worker Photos: workers can upload, admin can verify, all can view
CREATE POLICY "Worker photos viewable by everyone" ON worker_photos FOR SELECT USING (true);
CREATE POLICY "Workers can upload photos" ON worker_photos FOR INSERT WITH CHECK (
  worker_id IN (SELECT id FROM profiles WHERE auth_id = auth.uid() AND role = 'worker')
);
CREATE POLICY "Admin can verify photos" ON worker_photos FOR UPDATE USING (
  EXISTS (SELECT 1 FROM profiles WHERE auth_id = auth.uid() AND role = 'admin')
);

-- Notifications: users see their own
CREATE POLICY "Users see own notifications" ON notifications FOR SELECT USING (
  user_id IN (SELECT id FROM profiles WHERE auth_id = auth.uid())
);
CREATE POLICY "System can create notifications" ON notifications FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update own notifications" ON notifications FOR UPDATE USING (
  user_id IN (SELECT id FROM profiles WHERE auth_id = auth.uid())
);

-- ===== SEED DATA: DUSTBINS =====
INSERT INTO dustbins (id, lat, lng, area, zone, status) VALUES
  ('DB001', 9.9252, 78.1198, 'Meenakshi Amman Temple', 'Zone 1', 'clean'),
  ('DB002', 9.9195, 78.1270, 'Periyar Bus Stand', 'Zone 1', 'full'),
  ('DB003', 9.9310, 78.1155, 'Anna Nagar', 'Zone 2', 'clean'),
  ('DB004', 9.9178, 78.1340, 'Mattuthavani Bus Stand', 'Zone 2', 'full'),
  ('DB005', 9.9350, 78.1080, 'K.K. Nagar', 'Zone 3', 'partial'),
  ('DB006', 9.9145, 78.1400, 'Thirumangalam Road', 'Zone 3', 'clean'),
  ('DB007', 9.9280, 78.1050, 'Goripalayam', 'Zone 4', 'full'),
  ('DB008', 9.9220, 78.1320, 'Arapalayam', 'Zone 4', 'clean'),
  ('DB009', 9.9400, 78.1200, 'Teppakulam', 'Zone 1', 'partial'),
  ('DB010', 9.9100, 78.1250, 'Tallakulam', 'Zone 1', 'clean'),
  ('DB011', 9.9330, 78.1300, 'Sellur', 'Zone 1', 'full'),
  ('DB012', 9.9160, 78.1100, 'Simmakkal', 'Zone 2', 'clean'),
  ('DB013', 9.9380, 78.1350, 'Villapuram', 'Zone 3', 'partial'),
  ('DB014', 9.9050, 78.1180, 'Palanganatham', 'Zone 4', 'clean'),
  ('DB015', 9.9270, 78.1420, 'Thirunagar', 'Zone 1', 'full'),
  ('DB016', 9.9450, 78.1150, 'Ellis Nagar', 'Zone 1', 'clean'),
  ('DB017', 9.9120, 78.1050, 'Chokkikulam', 'Zone 2', 'partial'),
  ('DB018', 9.9200, 78.1480, 'Bibikulam', 'Zone 3', 'clean'),
  ('DB019', 9.9500, 78.1250, 'Avaniyapuram', 'Zone 4', 'full'),
  ('DB020', 9.9080, 78.1350, 'Madurai Junction', 'Zone 1', 'clean');
