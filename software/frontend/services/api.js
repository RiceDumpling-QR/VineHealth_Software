const BASE = 'http://localhost:5001';

export async function fetchData(device_id, date) {
  try {
    const url = `${BASE}/api/data?device_id=${encodeURIComponent(device_id)}&date=${encodeURIComponent(date)}`;
    const res = await fetch(url);
    if (!res.ok) return { data: [], summary: {} };
    const json = await res.json();
    return { data: json.data || [], summary: json.summary || {} };
  } catch (e) {
    return { data: [], summary: {} };
  }
}

export async function fetchAlerts(resolved, user_id) {
  try {
    const params = new URLSearchParams();
    if (typeof resolved !== 'undefined') params.set('resolved', resolved);
    if (user_id) params.set('user_id', user_id);
    const query = params.toString();
    const url = `${BASE}/api/alerts${query ? '?' + query : ''}`;
    const res = await fetch(url);
    if (!res.ok) return [];
    const json = await res.json();
    return json.data || [];
  } catch (e) {
    return [];
  }
}

export async function fetchUserDevices(user_id) {
  try {
    const url = `${BASE}/api/device/list?user_id=${encodeURIComponent(user_id)}`;
    const res = await fetch(url);
    if (!res.ok) return [];
    const json = await res.json();
    return json.data || [];
  } catch (e) {
    return [];
  }
}

export async function resolveAlert(alert_id) {
  try {
    const url = `${BASE}/api/alerts/${encodeURIComponent(alert_id)}`;
    const res = await fetch(url, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ resolved: true })
    });
    return res.ok;
  } catch (e) {
    return false;
  }
}

export async function loginUser(user_id, password) {
  const res = await fetch(`${BASE}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user_id, password }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'Login failed');
  return json;
}

export async function registerUser(user_id, username, password) {
  const res = await fetch(`${BASE}/api/profile/create`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user_id, username, password, profile_avatar: 'default_01', devices: [] }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'Registration failed');
  return json;
}

export async function fetchDeviceDates(device_id) {
  try {
    const url = `${BASE}/api/data/dates?device_id=${encodeURIComponent(device_id)}`;
    const res = await fetch(url);
    if (!res.ok) return [];
    const json = await res.json();
    return json.dates || [];
  } catch (e) {
    return [];
  }
}

export async function addDevice(device_id, user_id, device_name, location) {
  const body = { device_id, user_id, device_name };
  if (location && location.trim()) body.location = location.trim();
  const res = await fetch(`${BASE}/api/device/create`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'Failed to add device');
  return json; // { status, existed, message }
}

export default { fetchData, fetchAlerts, fetchUserDevices, resolveAlert, loginUser, registerUser, addDevice };
