import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { useAppStore } from '../store/app-store';
import { storage } from '../services/storage';
import { CaixaStatus, Energia, Pressao } from '@assistente/core';
import { ExecutiveCard, SegmentedControl, PrimaryActionButton } from '../src/components';
import { colors, spacing, typography } from '../src/theme';
import { useCheckinSuggestions } from '../src/hooks';

const CAIXA_OPTIONS = [
  { value: 'tranquilo' as CaixaStatus, label: 'Tranquilo' },
  { value: 'atencao' as CaixaStatus, label: 'Atenção' },
  { value: 'critico' as CaixaStatus, label: 'Crítico' },
];

const ENERGIA_OPTIONS = [
  { value: 'alta' as Energia, label: 'Alta' },
  { value: 'media' as Energia, label: 'Média' },
  { value: 'baixa' as Energia, label: 'Baixa' },
];

const PRESSAO_OPTIONS = [
  { value: 'leve' as Pressao, label: 'Leve' },
  { value: 'normal' as Pressao, label: 'Normal' },
  { value: 'alta' as Pressao, label: 'Alta' },
];

export default function CheckinScreen() {
  const router = useRouter();
  const currentUser = useAppStore((state) => state.currentUser);
  const setTodayCheckin = useAppStore((state) => state.setTodayCheckin);

  const [caixa, setCaixa] = useState<CaixaStatus | null>(null);
  const [energia, setEnergia] = useState<Energia | null>(null);
  const [pressao, setPressao] = useState<Pressao | null>(null);

  // Smart Suggestions
  const { suggestion } = useCheckinSuggestions(currentUser?.id);

  const canGenerate = caixa && energia && pressao;

  const handleUseSuggestion = () => {
    if (!suggestion) return;
    setCaixa(suggestion.caixa);
    setEnergia(suggestion.energia);
    setPressao(suggestion.pressao);
  };

  const handleGenerate = async () => {
    if (!canGenerate || !currentUser) return;

    const checkin = await storage.createCheckin({
      user_id: currentUser.id,
      date: new Date(),
      caixa_status: caixa,
      energia: energia,
      pressao: pressao,
    });

    setTodayCheckin(checkin);
    router.replace('/dashboard');
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <ScrollView contentContainerStyle={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Check-in Diário</Text>
          <Text style={styles.subtitle}>Responda com clareza para orientações precisas</Text>
        </View>

        {/* Smart Suggestion */}
        {suggestion && suggestion.confidence > 0.5 && (
          <ExecutiveCard elevated padding="lg" style={styles.suggestionCard}>
            <View style={styles.suggestionHeader}>
              <Text style={styles.suggestionLabel}>💡 SUGESTÃO INTELIGENTE</Text>
              <View style={styles.confidenceBadge}>
                <Text style={styles.confidenceText}>
                  {Math.round(suggestion.confidence * 100)}% confiança
                </Text>
              </View>
            </View>
            <Text style={styles.suggestionReason}>{suggestion.reasoning}</Text>
            <TouchableOpacity style={styles.useSuggestionButton} onPress={handleUseSuggestion}>
              <Text style={styles.useSuggestionText}>Usar Sugestão</Text>
            </TouchableOpacity>
          </ExecutiveCard>
        )}

        {/* Dimension Cards */}
        <View style={styles.dimensions}>
          {/* Caixa Status */}
          <ExecutiveCard elevated padding="lg">
            <Text style={styles.dimensionLabel}>SITUAÇÃO FINANCEIRA</Text>
            <Text style={styles.dimensionHint}>Como está seu caixa hoje?</Text>
            <View style={styles.controlWrapper}>
              <SegmentedControl options={CAIXA_OPTIONS} value={caixa} onChange={setCaixa} />
            </View>
          </ExecutiveCard>

          {/* Energia */}
          <ExecutiveCard elevated padding="lg">
            <Text style={styles.dimensionLabel}>ENERGIA</Text>
            <Text style={styles.dimensionHint}>Qual seu nível de energia?</Text>
            <View style={styles.controlWrapper}>
              <SegmentedControl options={ENERGIA_OPTIONS} value={energia} onChange={setEnergia} />
            </View>
          </ExecutiveCard>

          {/* Pressão */}
          <ExecutiveCard elevated padding="lg">
            <Text style={styles.dimensionLabel}>PRESSÃO</Text>
            <Text style={styles.dimensionHint}>Nível de urgência/pressão?</Text>
            <View style={styles.controlWrapper}>
              <SegmentedControl options={PRESSAO_OPTIONS} value={pressao} onChange={setPressao} />
            </View>
          </ExecutiveCard>
        </View>

        {/* Generate Button */}
        <PrimaryActionButton onPress={handleGenerate} disabled={!canGenerate} fullWidth size="lg">
          Gerar Orientação
        </PrimaryActionButton>

        {/* Progress Indicator */}
        <View style={styles.progress}>
          <View style={styles.progressDots}>
            <View style={[styles.dot, caixa && styles.dotActive]} />
            <View style={[styles.dot, energia && styles.dotActive]} />
            <View style={[styles.dot, pressao && styles.dotActive]} />
          </View>
          <Text style={styles.progressText}>
            {[caixa, energia, pressao].filter(Boolean).length}/3 dimensões
          </Text>
        </View>
      </ScrollView>
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
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: typography.fontSize['3xl'],
    fontWeight: typography.fontWeight.semibold,
    color: colors.textPrimary,
    letterSpacing: typography.letterSpacing.tight,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: typography.fontSize.base,
    color: colors.textSecondary,
    lineHeight: typography.fontSize.base * typography.lineHeight.relaxed,
  },
  suggestionCard: {
    borderLeftWidth: 3,
    borderLeftColor: colors.attack,
  },
  suggestionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  suggestionLabel: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
    color: colors.attack,
    letterSpacing: typography.letterSpacing.wide,
  },
  confidenceBadge: {
    backgroundColor: colors.attackLight,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 12,
  },
  confidenceText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.medium,
    color: colors.attack,
  },
  suggestionReason: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    lineHeight: typography.fontSize.sm * 1.5,
    marginBottom: spacing.md,
  },
  useSuggestionButton: {
    backgroundColor: colors.attack,
    paddingVertical: spacing.md,
    borderRadius: 8,
    alignItems: 'center',
  },
  useSuggestionText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: '#FFFFFF',
  },
  dimensions: {
    gap: spacing.lg,
  },
  dimensionLabel: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textTertiary,
    letterSpacing: typography.letterSpacing.wide,
    marginBottom: spacing.xs,
  },
  dimensionHint: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
  },
  controlWrapper: {
    marginTop: spacing.xs,
  },
  progress: {
    alignItems: 'center',
    marginTop: spacing.lg,
    gap: spacing.md,
  },
  progressDots: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.borderSubtle,
  },
  dotActive: {
    backgroundColor: colors.primary,
  },
  progressText: {
    fontSize: typography.fontSize.xs,
    color: colors.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: typography.letterSpacing.wide,
  },
});
