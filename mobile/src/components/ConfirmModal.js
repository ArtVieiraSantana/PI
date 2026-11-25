import React from 'react';
import { Modal, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function ConfirmModal({
  visible,
  title,
  message,
  confirmText,
  onCancel,
  onConfirm,
}) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onCancel}
    >
      <View style={styles.overlay}>
        <Pressable
          style={StyleSheet.absoluteFillObject}
          onPress={onCancel}
          accessible={false}
        />
        <View style={styles.dialog} accessibilityViewIsModal>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>

          <View style={styles.actions}>
            <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
              <Text style={styles.cancelText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.confirmButton} onPress={onConfirm}>
              <Text style={styles.confirmText}>{confirmText}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.62)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  dialog: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.22,
    shadowRadius: 12,
  },
  title: { color: '#1a1a2e', fontSize: 18, fontWeight: '700', marginBottom: 10 },
  message: { color: '#555', fontSize: 15, lineHeight: 22, marginBottom: 24 },
  actions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 12 },
  cancelButton: {
    minWidth: 104,
    minHeight: 48,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f4',
    borderRadius: 10,
    paddingHorizontal: 16,
  },
  confirmButton: {
    minWidth: 104,
    minHeight: 48,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#c0392b',
    borderRadius: 10,
    paddingHorizontal: 16,
  },
  cancelText: { color: '#333', fontWeight: '600' },
  confirmText: { color: '#fff', fontWeight: '700' },
});
