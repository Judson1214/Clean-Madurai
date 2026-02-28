import { createClient } from '@supabase/supabase-js';

// Replace these with your Supabase project credentials once created
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://YOUR_PROJECT.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'YOUR_ANON_KEY';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ===== AUTH HELPERS =====

// Phone OTP Authentication
export async function signInWithPhone(phone) {
    const { data, error } = await supabase.auth.signInWithOtp({
        phone,
    });
    return { data, error };
}

export async function verifyPhoneOtp(phone, token) {
    const { data, error } = await supabase.auth.verifyOtp({
        phone,
        token,
        type: 'sms',
    });
    return { data, error };
}

// Get or create user profile after phone auth
export async function getOrCreateProfile(authUser, role, name, phone) {
    // First check if profile exists
    const { data: existing } = await supabase
        .from('profiles')
        .select('*')
        .eq('auth_id', authUser.id)
        .single();

    if (existing) return { data: existing, error: null };

    // Create new profile
    const { data, error } = await supabase
        .from('profiles')
        .insert({
            auth_id: authUser.id,
            name: name || 'User',
            phone: phone,
            role: role || 'citizen',
        })
        .select()
        .single();

    return { data, error };
}

export async function getProfileByAuthId(authId) {
    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('auth_id', authId)
        .single();
    return { data, error };
}

// Email/password auth (legacy)
export async function signUp(email, password, metadata) {
    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: metadata },
    });
    return { data, error };
}

export async function signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    return { data, error };
}

export async function signOut() {
    const { error } = await supabase.auth.signOut();
    return { error };
}

export async function getCurrentUser() {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
}

// Auth state listener
export function onAuthStateChange(callback) {
    return supabase.auth.onAuthStateChange(callback);
}

// ===== WORKER NOTIFICATIONS FOR COMPLAINTS =====
export async function notifyWorkerAboutComplaint(workerId, complaintId, area, description) {
    const notification = {
        user_id: workerId,
        title: `⚠️ Unsolved Complaint: ${area}`,
        message: `Complaint #${complaintId} at ${area} has not been resolved. ${description}. Please take immediate action.`,
        type: 'alert',
        related_id: complaintId,
    };
    return createNotification(notification);
}

// ===== USERS / PROFILES =====
export async function getProfile(userId) {
    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
    return { data, error };
}

export async function updateProfile(userId, updates) {
    const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', userId);
    return { data, error };
}

// ===== DUSTBINS =====
export async function getDustbins() {
    const { data, error } = await supabase
        .from('dustbins')
        .select('*, incharge:profiles!dustbins_incharge_id_fkey(name, phone)')
        .order('id');
    return { data, error };
}

export async function updateDustbinStatus(dustbinId, status) {
    const { data, error } = await supabase
        .from('dustbins')
        .update({ status })
        .eq('id', dustbinId);
    return { data, error };
}

// ===== COMPLAINTS =====
export async function getComplaints(citizenId = null) {
    let query = supabase
        .from('complaints')
        .select('*, dustbin:dustbins(area, id), actions:complaint_actions(*)')
        .order('created_at', { ascending: false });

    if (citizenId) {
        query = query.eq('citizen_id', citizenId);
    }
    const { data, error } = await query;
    return { data, error };
}

export async function createComplaint(complaint) {
    const { data, error } = await supabase
        .from('complaints')
        .insert(complaint)
        .select();
    return { data, error };
}

export async function updateComplaintStatus(complaintId, status, actionNote) {
    const { error: statusError } = await supabase
        .from('complaints')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', complaintId);

    if (actionNote) {
        await supabase.from('complaint_actions').insert({
            complaint_id: complaintId,
            action: actionNote,
            status,
        });
    }

    return { error: statusError };
}

// ===== WORKER PHOTOS =====
export async function getWorkerPhotos(workerId = null) {
    let query = supabase
        .from('worker_photos')
        .select('*, worker:profiles!worker_photos_worker_id_fkey(name, area)')
        .order('uploaded_at', { ascending: false });

    if (workerId) {
        query = query.eq('worker_id', workerId);
    }
    const { data, error } = await query;
    return { data, error };
}

export async function uploadWorkerPhoto(photoData) {
    const { data, error } = await supabase
        .from('worker_photos')
        .insert(photoData)
        .select();
    return { data, error };
}

export async function verifyWorkerPhoto(photoId, adminId) {
    const { data, error } = await supabase
        .from('worker_photos')
        .update({ verified: true, verified_by: adminId, verified_at: new Date().toISOString() })
        .eq('id', photoId);
    return { data, error };
}

// ===== WORKERS =====
export async function getWorkers() {
    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'worker')
        .order('name');
    return { data, error };
}

export async function getWorkersWithTodayPhotos() {
    const today = new Date().toISOString().split('T')[0];
    const { data: workers, error: wErr } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'worker');

    if (wErr) return { data: null, error: wErr };

    const { data: photos, error: pErr } = await supabase
        .from('worker_photos')
        .select('worker_id, uploaded_at, verified, photo_url, latitude, longitude')
        .gte('uploaded_at', `${today}T00:00:00`)
        .lte('uploaded_at', `${today}T23:59:59`);

    if (pErr) return { data: null, error: pErr };

    const workersWithPhotos = workers.map(w => {
        const todayPhoto = photos.find(p => p.worker_id === w.id);
        return {
            ...w,
            photoUploaded: !!todayPhoto,
            todayPhoto: todayPhoto || null,
        };
    });

    return { data: workersWithPhotos, error: null };
}

// ===== NOTIFICATIONS =====
export async function getNotifications(userId) {
    const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(20);
    return { data, error };
}

export async function createNotification(notification) {
    const { data, error } = await supabase
        .from('notifications')
        .insert(notification);
    return { data, error };
}

export async function markNotificationRead(notifId) {
    const { data, error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notifId);
    return { data, error };
}

// ===== INCHARGE =====
export async function getInchargeOfficers() {
    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'incharge')
        .order('name');
    return { data, error };
}

// ===== STORAGE =====
export async function uploadImage(bucket, filePath, file) {
    const { data, error } = await supabase.storage
        .from(bucket)
        .upload(filePath, file);
    return { data, error };
}

export function getImageUrl(bucket, filePath) {
    const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);
    return data.publicUrl;
}
