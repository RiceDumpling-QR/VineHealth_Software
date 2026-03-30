const BASE = 'http://localhost:5001';

export async function fetchData(device_id, date) {
  try {
    const url = `${BASE}/api/data?device_id=${encodeURIComponent(device_id)}&date=${encodeURIComponent(date)}`;
    const res = await fetch(url);
    if (!res.ok) return [];
    const json = await res.json();
    return json.data || [];
  } catch (e) {
    return [];
  }
}

export async function fetchAlerts(resolved) {
  try {
    let url = `${BASE}/api/alerts`;
    if (typeof resolved !== 'undefined') {
      url += `?resolved=${encodeURIComponent(resolved)}`;
    }
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

export default { fetchData, fetchAlerts, resolveAlert };
