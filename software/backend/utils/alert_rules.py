import uuid


def generate_alerts(device_id, user_id, health_indexes, timestamp_iso):
    """Apply alert rules to health_indexes and return alert dicts ready for DB insert.

    Severity levels (highest to lowest): EMERGENCY, CRITICAL, WARNING.

    Emergency  — two indexes simultaneously breach their thresholds.
    Critical   — a single index breaches its critical threshold.
    Warning    — a single index falls into the moderate-concern (middle) range.
    """
    ndvi  = health_indexes.get('ndvi')
    gndvi = health_indexes.get('gndvi')
    cwsi  = health_indexes.get('cwsi')
    savi  = health_indexes.get('savi')

    alerts = []

    def make(severity, title, details):
        return {
            'alert_id':  str(uuid.uuid4()),
            'user_id':   user_id,
            'device_id': device_id,
            'timestamp': timestamp_iso,
            'title':     f'[{severity}] {title}',
            'details':   details,
            'resolved':  False,
        }

    # ── Emergency (multi-index) ──────────────────────────────────────────────
    if cwsi is not None and cwsi > 0.7 and ndvi is not None and ndvi < 0.4:
        alerts.append(make('EMERGENCY', 'Active Dieback – Water Stress',
            f'CWSI={cwsi:.3f} (>0.7) combined with NDVI={ndvi:.3f} (<0.4) indicates '
            f'active crop dieback from severe water stress. Immediate irrigation required.'))

    if gndvi is not None and gndvi < 0.35 and ndvi is not None and ndvi < 0.4:
        alerts.append(make('EMERGENCY', 'Vigor Collapse – Nutrient Deficiency',
            f'GNDVI={gndvi:.3f} (<0.35) combined with NDVI={ndvi:.3f} (<0.4) indicates '
            f'a nutrient deficiency driving vegetation vigor collapse. Inspect fertilization immediately.'))

    if savi is not None and savi < 0.25 and ndvi is not None and ndvi < 0.35:
        alerts.append(make('EMERGENCY', 'Crop Establishment Failure',
            f'SAVI={savi:.3f} (<0.25) combined with NDVI={ndvi:.3f} (<0.35) suggests '
            f'crop establishment failure. Immediate field assessment required.'))

    # ── Critical (single-index) ──────────────────────────────────────────────
    if ndvi is not None and ndvi < 0.3:
        alerts.append(make('CRITICAL', 'Low NDVI – Severe Vegetation Stress',
            f'NDVI={ndvi:.3f} is below the critical threshold of 0.3, indicating severely degraded vegetation health.'))

    if gndvi is not None and gndvi < 0.3:
        alerts.append(make('CRITICAL', 'Low GNDVI – Severe Chlorophyll Decline',
            f'GNDVI={gndvi:.3f} is below the critical threshold of 0.3, indicating a severe drop in chlorophyll content.'))

    if savi is not None and savi < 0.2:
        alerts.append(make('CRITICAL', 'Low SAVI – Severe Vegetation Cover Loss',
            f'SAVI={savi:.3f} is below the critical threshold of 0.2, indicating severely low vegetation cover.'))

    if cwsi is not None and cwsi > 0.7:
        alerts.append(make('CRITICAL', 'High CWSI – Severe Water Stress',
            f'CWSI={cwsi:.3f} exceeds the critical threshold of 0.7, indicating severe crop water stress.'))

    # ── Warning (single-index, middle range) ─────────────────────────────────
    if ndvi is not None and 0.3 <= ndvi < 0.5:
        alerts.append(make('WARNING', 'Moderate NDVI – Vegetation Health Declining',
            f'NDVI={ndvi:.3f} is in the moderate-concern range (0.3–0.5), indicating declining vegetation health.'))

    if gndvi is not None and 0.3 <= gndvi < 0.5:
        alerts.append(make('WARNING', 'Moderate GNDVI – Chlorophyll Declining',
            f'GNDVI={gndvi:.3f} is in the moderate-concern range (0.3–0.5), indicating declining chlorophyll content.'))

    if savi is not None and 0.2 <= savi < 0.4:
        alerts.append(make('WARNING', 'Moderate SAVI – Vegetation Cover Declining',
            f'SAVI={savi:.3f} is in the moderate-concern range (0.2–0.4), indicating declining vegetation cover.'))

    if cwsi is not None and 0.3 < cwsi <= 0.7:
        alerts.append(make('WARNING', 'Elevated CWSI – Crop Water Stress',
            f'CWSI={cwsi:.3f} is above the warning threshold of 0.3, indicating moderate crop water stress.'))

    return alerts
