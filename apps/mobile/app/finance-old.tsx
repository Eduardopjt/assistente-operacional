import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useState, useEffect } from 'react';
import { useAppStore } from '../store/app-store';
import { storage } from '../services/storage';
import { formatCurrency } from '@assistente/shared';
import { EntryType } from '@assistente/core';

const CATEGORIES_ENTRADA = ['Salário', 'Freelance', 'Investimentos', 'Outros'];
const CATEGORIES_SAIDA = [
  'Alimentação',
  'Transporte',
  'Moradia',
  'Saúde',
  'Educação',
  'Lazer',
  'Outros',
];

export default function FinanceScreen() {
  const currentUser = useAppStore((state) => state.currentUser);
  const addFinanceEntry = useAppStore((state) => state.addFinanceEntry);

  const [entries, setEntries] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [type, setType] = useState<EntryType>('entrada');
  const [value, setValue] = useState('');
  const [category, setCategory] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (currentUser) {
      storage.getRecentFinance(currentUser.id, 30).then(setEntries);
    }
  }, [currentUser]);

  const totals = entries.reduce(
    (acc, e) => {
      if (e.type === 'entrada') acc.entradas += e.value;
      else acc.saidas += e.value;
      return acc;
    },
    { entradas: 0, saidas: 0 }
  );

  const balance = totals.entradas - totals.saidas;
  const forecast = totals.saidas > 0 ? Math.floor(balance / (totals.saidas / 30)) : 999;

  const handleAddEntry = async () => {
    if (!currentUser || !value || !category) return;

    const parsedValue = parseFloat(value.replace(',', '.')) * 100; // Convert to cents

    const entry = await storage.createFinanceEntry({
      user_id: currentUser.id,
      type,
      value: parsedValue,
      category,
      date: new Date(),
      notes: notes || undefined,
    });

    addFinanceEntry(entry);
    setEntries([entry, ...entries]);
    setShowModal(false);
    setValue('');
    setCategory('');
    setNotes('');
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <ScrollView contentContainerStyle={styles.content}>
        {/* Summary */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Entradas (30d)</Text>
              <Text style={[styles.summaryValue, { color: '#22C55E' }]}>
                {formatCurrency(totals.entradas)}
              </Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Saídas (30d)</Text>
              <Text style={[styles.summaryValue, { color: '#EF4444' }]}>
                {formatCurrency(totals.saidas)}
              </Text>
            </View>
          </View>
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Saldo</Text>
              <Text
                style={[
                  styles.summaryValue,
                  { color: balance >= 0 ? '#22C55E' : '#EF4444' },
                ]}
              >
                {formatCurrency(balance)}
              </Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Previsão</Text>
              <Text style={styles.summaryValue}>
                {forecast > 365 ? '∞' : `${forecast}d`}
              </Text>
            </View>
          </View>
        </View>

        {/* Add Button */}
        <TouchableOpacity style={styles.addButton} onPress={() => setShowModal(true)}>
          <Text style={styles.addButtonText}>+ Adicionar Lançamento</Text>
        </TouchableOpacity>

        {/* Entries List */}
        <Text style={styles.sectionTitle}>Últimos 30 dias</Text>
        {entries.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>Nenhum lançamento ainda</Text>
          </View>
        ) : (
          entries.map((entry) => (
            <View key={entry.id} style={styles.entryCard}>
              <View style={styles.entryLeft}>
                <Text style={styles.entryCategory}>{entry.category}</Text>
                {entry.notes && <Text style={styles.entryNotes}>{entry.notes}</Text>}
                <Text style={styles.entryDate}>
                  {new Date(entry.date).toLocaleDateString('pt-BR')}
                </Text>
              </View>
              <Text
                style={[
                  styles.entryValue,
                  { color: entry.type === 'entrada' ? '#22C55E' : '#EF4444' },
                ]}
              >
                {entry.type === 'entrada' ? '+' : '-'}
                {formatCurrency(entry.value)}
              </Text>
            </View>
          ))
        )}
      </ScrollView>

      {/* Add Modal */}
      <Modal visible={showModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Novo Lançamento</Text>

            <View style={styles.typeToggle}>
              <TouchableOpacity
                style={[styles.typeButton, type === 'entrada' && styles.typeButtonActive]}
                onPress={() => setType('entrada')}
              >
                <Text
                  style={[
                    styles.typeButtonText,
                    type === 'entrada' && styles.typeButtonTextActive,
                  ]}
                >
                  Entrada
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.typeButton, type === 'saida' && styles.typeButtonActive]}
                onPress={() => setType('saida')}
              >
                <Text
                  style={[
                    styles.typeButtonText,
                    type === 'saida' && styles.typeButtonTextActive,
                  ]}
                >
                  Saída
                </Text>
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.input}
              placeholder="Valor (R$)"
              placeholderTextColor="#6B7280"
              keyboardType="decimal-pad"
              value={value}
              onChangeText={setValue}
            />

            <View style={styles.categoryGrid}>
              {(type === 'entrada' ? CATEGORIES_ENTRADA : CATEGORIES_SAIDA).map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[
                    styles.categoryButton,
                    category === cat && styles.categoryButtonActive,
                  ]}
                  onPress={() => setCategory(cat)}
                >
                  <Text
                    style={[
                      styles.categoryButtonText,
                      category === cat && styles.categoryButtonTextActive,
                    ]}
                  >
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TextInput
              style={styles.input}
              placeholder="Observações (opcional)"
              placeholderTextColor="#6B7280"
              value={notes}
              onChangeText={setNotes}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalButtonCancel}
                onPress={() => setShowModal(false)}
              >
                <Text style={styles.modalButtonCancelText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalButtonSave} onPress={handleAddEntry}>
                <Text style={styles.modalButtonSaveText}>Salvar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F1115',
  },
  content: {
    padding: 24,
  },
  summaryCard: {
    backgroundColor: '#1A1D24',
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#374151',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  summaryItem: {
    flex: 1,
  },
  summaryLabel: {
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  addButton: {
    backgroundColor: '#22C55E',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 24,
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0F1115',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  entryCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#1A1D24',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#374151',
  },
  entryLeft: {
    flex: 1,
  },
  entryCategory: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  entryNotes: {
    fontSize: 13,
    color: '#9CA3AF',
    marginBottom: 2,
  },
  entryDate: {
    fontSize: 12,
    color: '#6B7280',
  },
  entryValue: {
    fontSize: 17,
    fontWeight: '700',
  },
  emptyState: {
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 15,
    color: '#9CA3AF',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#1A1D24',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 20,
  },
  typeToggle: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  typeButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#0F1115',
    alignItems: 'center',
  },
  typeButtonActive: {
    backgroundColor: '#22C55E',
  },
  typeButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#9CA3AF',
  },
  typeButtonTextActive: {
    color: '#0F1115',
  },
  input: {
    backgroundColor: '#0F1115',
    padding: 16,
    borderRadius: 8,
    fontSize: 16,
    color: '#FFFFFF',
    marginBottom: 16,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#0F1115',
  },
  categoryButtonActive: {
    backgroundColor: '#22C55E20',
    borderWidth: 1,
    borderColor: '#22C55E',
  },
  categoryButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#9CA3AF',
  },
  categoryButtonTextActive: {
    color: '#22C55E',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButtonCancel: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    backgroundColor: '#374151',
    alignItems: 'center',
  },
  modalButtonCancelText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#9CA3AF',
  },
  modalButtonSave: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    backgroundColor: '#22C55E',
    alignItems: 'center',
  },
  modalButtonSaveText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0F1115',
  },
});
