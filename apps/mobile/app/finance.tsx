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
import { ExecutiveCard, PrimaryActionButton, SegmentedControl } from '../src/components';
import { colors, spacing, typography, borderRadius } from '../src/theme';
import { useAnomalyDetection, useFinancialProjections } from '../src/hooks';

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
  const burnRate = totals.saidas / 30;

  // Smart Automations (after balance calculation)
  const { anomalies } = useAnomalyDetection(currentUser?.id, 30);
  const { projection } = useFinancialProjections(currentUser?.id, balance, 90);

  const handleAddEntry = async () => {
    if (!currentUser || !value || !category) return;

    const parsedValue = parseFloat(value.replace(',', '.')) * 100;

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
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Finanças</Text>
          <Text style={styles.subtitle}>Últimos 30 dias</Text>
        </View>

        {/* Executive Summary Cards */}
        <View style={styles.summaryGrid}>
          <ExecutiveCard elevated padding="lg" style={styles.summaryCard}>
            <Text style={styles.metricLabel}>SALDO</Text>
            <Text
              style={[
                styles.metricValue,
                { color: balance >= 0 ? colors.attack : colors.critical },
              ]}
            >
              {formatCurrency(balance)}
            </Text>
            <Text style={styles.metricHint}>
              {balance >= 0 ? 'Positivo' : 'Negativo'}
            </Text>
          </ExecutiveCard>

          <ExecutiveCard elevated padding="lg" style={styles.summaryCard}>
            <Text style={styles.metricLabel}>PREVISÃO</Text>
            <Text style={styles.metricValue}>
              {forecast > 365 ? '∞' : `${forecast}d`}
            </Text>
            <Text style={styles.metricHint}>Runway</Text>
          </ExecutiveCard>
        </View>

        <View style={styles.summaryGrid}>
          <ExecutiveCard elevated padding="lg" style={styles.summaryCard}>
            <Text style={styles.metricLabel}>ENTRADAS</Text>
            <Text style={[styles.metricValue, { color: colors.attack }]}>
              {formatCurrency(totals.entradas)}
            </Text>
            <Text style={styles.metricHint}>Receita</Text>
          </ExecutiveCard>

          <ExecutiveCard elevated padding="lg" style={styles.summaryCard}>
            <Text style={styles.metricLabel}>SAÍDAS</Text>
            <Text style={[styles.metricValue, { color: colors.critical }]}>
              {formatCurrency(totals.saidas)}
            </Text>
            <Text style={styles.metricHint}>Despesa</Text>
          </ExecutiveCard>
        </View>

        {/* Burn Rate Insight */}
        {burnRate > 0 && (
          <ExecutiveCard elevated padding="lg">
            <Text style={styles.insightLabel}>BURN RATE</Text>
            <Text style={styles.insightValue}>{formatCurrency(burnRate)}/dia</Text>
            <Text style={styles.insightText}>
              Taxa média de queima diária nos últimos 30 dias
            </Text>
          </ExecutiveCard>
        )}

        {/* Anomaly Alerts */}
        {anomalies && anomalies.length > 0 && (
          <ExecutiveCard elevated padding="lg" style={styles.anomalyCard}>
            <Text style={styles.anomalyLabel}>⚠️ ANOMALIAS DETECTADAS</Text>
            {anomalies.slice(0, 3).map((anomaly, idx) => (
              <View key={idx} style={styles.anomalyItem}>
                <Text style={styles.anomalyCategory}>{anomaly.category}</Text>
                <Text style={styles.anomalyDescription}>
                  {formatCurrency(anomaly.amount)}
                  {' - '}
                  {anomaly.severity === 'high'
                    ? 'muito acima da média'
                    : 'acima do padrão'}
                </Text>
              </View>
            ))}
          </ExecutiveCard>
        )}

        {/* Financial Projections */}
        {projection && (
          <ExecutiveCard elevated padding="lg">
            <Text style={styles.projectionsLabel}>📊 PROJEÇÕES FINANCEIRAS</Text>
            <View style={styles.projectionsGrid}>
              <View style={styles.projectionItem}>
                <Text style={styles.projectionPeriod}>30 dias</Text>
                <Text style={styles.projectionValue}>
                  {formatCurrency(projection.scenarios.optimistic.estimatedBalance)}
                </Text>
                <Text style={styles.projectionScenario}>Otimista</Text>
              </View>
              <View style={styles.projectionItem}>
                <Text style={styles.projectionPeriod}>60 dias</Text>
                <Text style={styles.projectionValue}>
                  {formatCurrency(projection.scenarios.realistic.estimatedBalance)}
                </Text>
                <Text style={styles.projectionScenario}>Realista</Text>
              </View>
              <View style={styles.projectionItem}>
                <Text style={styles.projectionPeriod}>90 dias</Text>
                <Text style={styles.projectionValue}>
                  {formatCurrency(projection.scenarios.pessimistic.estimatedBalance)}
                </Text>
                <Text style={styles.projectionScenario}>Pessimista</Text>
              </View>
            </View>
          </ExecutiveCard>
        )}

        {/* Add Button */}
        <PrimaryActionButton onPress={() => setShowModal(true)} fullWidth size="md">
          Adicionar Lançamento
        </PrimaryActionButton>

        {/* Entries List */}
        <View style={styles.entriesSection}>
          <Text style={styles.sectionLabel}>TRANSAÇÕES</Text>
          {entries.length === 0 ? (
            <ExecutiveCard elevated padding="xl">
              <Text style={styles.emptyText}>Nenhum lançamento registrado</Text>
            </ExecutiveCard>
          ) : (
            entries.map((entry) => (
              <ExecutiveCard key={entry.id} elevated={false} padding="lg">
                <View style={styles.entryHeader}>
                  <View style={styles.entryLeft}>
                    <Text style={styles.entryCategory}>{entry.category}</Text>
                    <Text style={styles.entryDate}>
                      {new Date(entry.date).toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: 'short',
                      })}
                    </Text>
                  </View>
                  <Text
                    style={[
                      styles.entryValue,
                      { color: entry.type === 'entrada' ? colors.attack : colors.critical },
                    ]}
                  >
                    {entry.type === 'entrada' ? '+' : '−'}
                    {formatCurrency(entry.value)}
                  </Text>
                </View>
                {entry.notes && <Text style={styles.entryNotes}>{entry.notes}</Text>}
              </ExecutiveCard>
            ))
          )}
        </View>
      </ScrollView>

      {/* Add Modal */}
      <Modal visible={showModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Novo Lançamento</Text>

            <View style={styles.modalSection}>
              <Text style={styles.modalLabel}>TIPO</Text>
              <SegmentedControl
                options={[
                  { value: 'entrada' as EntryType, label: 'Entrada' },
                  { value: 'saida' as EntryType, label: 'Saída' },
                ]}
                value={type}
                onChange={setType}
              />
            </View>

            <View style={styles.modalSection}>
              <Text style={styles.modalLabel}>VALOR (R$)</Text>
              <TextInput
                style={styles.input}
                placeholder="0,00"
                placeholderTextColor={colors.textMuted}
                keyboardType="decimal-pad"
                value={value}
                onChangeText={setValue}
              />
            </View>

            <View style={styles.modalSection}>
              <Text style={styles.modalLabel}>CATEGORIA</Text>
              <View style={styles.categoryGrid}>
                {(type === 'entrada' ? CATEGORIES_ENTRADA : CATEGORIES_SAIDA).map((cat) => (
                  <TouchableOpacity
                    key={cat}
                    style={[
                      styles.categoryButton,
                      category === cat && styles.categoryButtonActive,
                    ]}
                    onPress={() => setCategory(cat)}
                    activeOpacity={0.7}
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
            </View>

            <View style={styles.modalSection}>
              <Text style={styles.modalLabel}>OBSERVAÇÕES (OPCIONAL)</Text>
              <TextInput
                style={[styles.input, styles.inputMultiline]}
                placeholder="Notas adicionais"
                placeholderTextColor={colors.textMuted}
                value={notes}
                onChangeText={setNotes}
                multiline
                numberOfLines={3}
              />
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setShowModal(false)}
                activeOpacity={0.7}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <PrimaryActionButton
                onPress={handleAddEntry}
                disabled={!value || !category}
                style={styles.saveButton}
              >
                Salvar
              </PrimaryActionButton>
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
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.xl,
    gap: spacing.lg,
  },
  header: {
    marginBottom: spacing.md,
  },
  title: {
    fontSize: typography.fontSize['3xl'],
    fontWeight: typography.fontWeight.semibold,
    color: colors.textPrimary,
    letterSpacing: typography.letterSpacing.tight,
  },
  subtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.textTertiary,
    marginTop: spacing.xs,
  },
  summaryGrid: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  summaryCard: {
    flex: 1,
  },
  metricLabel: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textTertiary,
    letterSpacing: typography.letterSpacing.wide,
    marginBottom: spacing.sm,
  },
  metricValue: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  metricHint: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
  },
  insightLabel: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textTertiary,
    letterSpacing: typography.letterSpacing.wide,
    marginBottom: spacing.sm,
  },
  insightValue: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.semibold,
    color: colors.primary,
    marginBottom: spacing.sm,
  },
  insightText: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    lineHeight: typography.fontSize.sm * typography.lineHeight.normal,
  },
  anomalyCard: {
    borderLeftWidth: 3,
    borderLeftColor: colors.caution,
  },
  anomalyLabel: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
    color: colors.caution,
    letterSpacing: typography.letterSpacing.wide,
    marginBottom: spacing.md,
  },
  anomalyItem: {
    marginBottom: spacing.sm,
  },
  anomalyCategory: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textPrimary,
  },
  anomalyDescription: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  projectionsLabel: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
    color: colors.primary,
    letterSpacing: typography.letterSpacing.wide,
    marginBottom: spacing.md,
  },
  projectionsGrid: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  projectionItem: {
    flex: 1,
    alignItems: 'center',
  },
  projectionPeriod: {
    fontSize: typography.fontSize.xs,
    color: colors.textTertiary,
    marginBottom: spacing.xs,
  },
  projectionValue: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  projectionScenario: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
  },
  entriesSection: {
    gap: spacing.md,
  },
  sectionLabel: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textTertiary,
    letterSpacing: typography.letterSpacing.wide,
  },
  emptyText: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  entryLeft: {
    flex: 1,
  },
  entryCategory: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  entryDate: {
    fontSize: typography.fontSize.xs,
    color: colors.textTertiary,
    textTransform: 'capitalize',
  },
  entryValue: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
  },
  entryNotes: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginTop: spacing.sm,
    lineHeight: typography.fontSize.sm * typography.lineHeight.normal,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.surfaceElevated,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    padding: spacing.xl,
    maxHeight: '90%',
  },
  modalTitle: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.xl,
  },
  modalSection: {
    marginBottom: spacing.lg,
  },
  modalLabel: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textTertiary,
    letterSpacing: typography.letterSpacing.wide,
    marginBottom: spacing.md,
  },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    fontSize: typography.fontSize.base,
    color: colors.textPrimary,
  },
  inputMultiline: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  categoryButton: {
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  categoryButtonActive: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.primary,
  },
  categoryButtonText: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    fontWeight: typography.fontWeight.medium,
  },
  categoryButtonTextActive: {
    color: colors.primary,
    fontWeight: typography.fontWeight.semibold,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.xl,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: colors.surface,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  cancelButtonText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textSecondary,
  },
  saveButton: {
    flex: 1,
  },
});
