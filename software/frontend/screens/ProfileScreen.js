import { useEffect, useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Modal, TextInput, ActivityIndicator, Alert } from 'react-native';
import { fetchUserDevices, fetchData, fetchDeviceDates, addDevice, removeDevice } from '../services/api';

const COLORS = {
  darkGreen: '#3a6b35',
  white: '#ffffff',
  textDark: '#1a1a1a',
  textGray: '#666666',
};

export default function ProfileScreen({ user }) {
  const [devices, setDevices] = useState([]);
  const [summary, setSummary] = useState({});

  const [modalVisible, setModalVisible] = useState(false);
  const [deviceId, setDeviceId] = useState('');
  const [deviceName, setDeviceName] = useState('');
  const [location, setLocation] = useState('');
  const [addError, setAddError] = useState('');
  const [addInfo, setAddInfo] = useState('');
  const [adding, setAdding] = useState(false);

  const handleRemoveDevice = (device_id, device_name) => {
    Alert.alert(
      'Remove Device',
      `Remove "${device_name || device_id}" from your account?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove', style: 'destructive',
          onPress: async () => {
            try {
              await removeDevice(device_id);
              setDevices((prev) => prev.filter((d) => d.device_id !== device_id));
            } catch (e) {
              Alert.alert('Error', e.message);
            }
          },
        },
      ]
    );
  };

  const openModal = () => {
    setDeviceId(''); setDeviceName(''); setLocation('');
    setAddError(''); setAddInfo('');
    setModalVisible(true);
  };

  const handleAddDevice = async () => {
    if (!deviceId.trim()) { setAddError('Device ID is required.'); return; }
    if (!deviceName.trim()) { setAddError('Device name is required.'); return; }
    setAddError(''); setAddInfo(''); setAdding(true);
    try {
      const result = await addDevice(deviceId.trim(), user.userId, deviceName.trim(), location);
      setAddInfo(result.existed
        ? 'This device already exists but has been added to you.'
        : 'Device added successfully.');
      // refresh device list
      const updated = await fetchUserDevices(user.userId);
      setDevices(updated || []);
      setDeviceId(''); setDeviceName(''); setLocation('');
    } catch (e) {
      setAddError(e.message);
    } finally {
      setAdding(false);
    }
  };

  useEffect(() => {
    let mounted = true;
    fetchUserDevices(user.userId).then((d) => {
      if (!mounted) return;
      setDevices(d || []);
      // fetch today's summary for the first device
      if (d && d.length > 0) {
        fetchDeviceDates(d[0].device_id).then((dates) => {
          if (!mounted || !dates || dates.length === 0) return;
          fetchData(d[0].device_id, dates[0]).then((res) => {
            if (mounted) setSummary(res.summary || {});
          });
        });
      }
    });
    return () => { mounted = false; };
  }, [user.userId]);

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
      <View style={styles.greenBody}>
        {/* Avatar */}
        <View style={styles.avatarWrapper}>
          <View style={styles.avatar} />
        </View>
        <Text style={styles.name}>Name</Text>

        <TouchableOpacity style={styles.addDeviceButton} onPress={openModal}>
          <Text style={styles.addDeviceText}>Add Device</Text>
        </TouchableOpacity>

        <Modal visible={modalVisible} transparent animationType="fade" onRequestClose={() => setModalVisible(false)}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <Text style={styles.modalTitle}>Add Device</Text>

              <TextInput
                style={styles.modalInput}
                placeholder="Device ID *"
                autoCapitalize="none"
                value={deviceId}
                onChangeText={setDeviceId}
              />
              <TextInput
                style={styles.modalInput}
                placeholder="Device Name *"
                value={deviceName}
                onChangeText={setDeviceName}
              />
              <TextInput
                style={styles.modalInput}
                placeholder="Location (optional)"
                value={location}
                onChangeText={setLocation}
              />

              {addError ? <Text style={styles.modalError}>{addError}</Text> : null}
              {addInfo ? <Text style={styles.modalInfo}>{addInfo}</Text> : null}

              <TouchableOpacity style={styles.modalButton} onPress={handleAddDevice} disabled={adding}>
                {adding
                  ? <ActivityIndicator color="#fff" />
                  : <Text style={styles.modalButtonText}>Add</Text>}
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Text style={styles.modalCancel}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Environment Stats */}
        <Text style={styles.sectionTitle}>Environment Stats</Text>
        <View style={styles.card}>
          <View style={styles.statsRow}>
            <View style={styles.statCell}>
              <Text style={styles.statMain}>
                {summary.avg_relative_humidity != null ? `${summary.avg_relative_humidity.toFixed(1)}%` : '—'}
              </Text>
              <Text style={styles.statSub}>Relative{'\n'}Humidity (RH)</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.statCell}>
              <Text style={styles.statMain}>
                {summary.avg_temperature != null ? `${summary.avg_temperature.toFixed(1)} °C` : '—'}
              </Text>
              <Text style={styles.statSub}>Temperature</Text>
            </View>
          </View>
        </View>

        {/* My Devices */}
        <Text style={styles.sectionTitle}>My Devices</Text>
        <View style={styles.card}>
          {devices.length === 0 ? (
            <Text style={{ color: COLORS.textGray }}>No devices registered.</Text>
          ) : (
            devices.map((d, i) => (
              <View key={d.device_id}>
                {i > 0 && <View style={styles.rowDivider} />}
                <View style={styles.deviceRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.deviceId}>{d.device_name} ({d.device_id})</Text>
                    {d.location ? <Text style={styles.deviceDesc}>{d.location}</Text> : null}
                  </View>
                  <TouchableOpacity onPress={() => handleRemoveDevice(d.device_id, d.device_name)}>
                    <Text style={styles.removeBtn}>Remove</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </View>

        <View style={{ height: 40 }} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  contentContainer: {
    flexGrow: 1,
  },
  greenBody: {
    backgroundColor: COLORS.darkGreen,
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    marginTop: 20,
    paddingHorizontal: 20,
    paddingTop: 20,
    flexGrow: 1,
  },
  avatarWrapper: {
    alignItems: 'center',
    marginTop: -50,
    marginBottom: 12,
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#c8e6c9',
  },
  name: {
    color: COLORS.white,
    fontSize: 20,
    textAlign: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 14,
    padding: 16,
    marginBottom: 20,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statCell: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 4,
  },
  statMain: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  statSub: {
    fontSize: 11,
    color: '#666',
    textAlign: 'center',
    marginTop: 4,
  },
  divider: {
    width: 1,
    height: 40,
    backgroundColor: '#e0e0e0',
  },
  addDeviceButton: {
    backgroundColor: '#1a8cff',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    alignSelf: 'center',
    marginBottom: 16,
  },
  addDeviceText: {
    color: COLORS.white,
    fontWeight: '600',
  },
  deviceRow: {
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  removeBtn: {
    fontSize: 13,
    color: '#e53935',
    fontWeight: '600',
    paddingLeft: 12,
  },
  deviceId: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  deviceName: {
    fontSize: 13,
    color: COLORS.textDark,
    marginTop: 2,
  },
  deviceDesc: {
    fontSize: 12,
    color: COLORS.textGray,
    marginTop: 2,
  },
  rowDivider: {
    height: 1,
    backgroundColor: '#e0e0e0',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 360,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textDark,
    marginBottom: 16,
    textAlign: 'center',
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    fontSize: 15,
  },
  modalError: {
    color: '#e53935',
    fontSize: 13,
    marginBottom: 8,
    textAlign: 'center',
  },
  modalInfo: {
    color: '#2e7d32',
    fontSize: 13,
    marginBottom: 8,
    textAlign: 'center',
  },
  modalButton: {
    backgroundColor: COLORS.darkGreen,
    borderRadius: 10,
    paddingVertical: 13,
    alignItems: 'center',
    marginBottom: 12,
  },
  modalButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
  },
  modalCancel: {
    color: COLORS.textGray,
    textAlign: 'center',
    fontSize: 14,
  },
});
