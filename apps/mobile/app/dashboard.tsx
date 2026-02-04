import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useAppStore } from '../store/app-store';
import { ExecutiveCard, StateBadge } from '../src/components';
import { colors, spacing, typography, borderRadius } from '../src/theme';
import { useOverloadAssessment, useWeeklySummary } from '../src/hooks';

export default function DashboardScreen() {
  const todayState = useAppStore((state) => state.todayState);
  const actionMother = useAppStore((state) => state.actionMother);
  const guidance = useAppStore((state) => state.guidance);
  const alerts = useAppStore((state) => state.alerts.filter((a) => !a.resolved));
  const resolveAlert = useAppStore((state) => state.resolveAlert);
  const currentUser = useAppStore((state) => state.currentUser);

  // Automation hooks
  const { assessment } = useOverloadAssessment(currentUser?.id);
  const { summary } = useWeeklySummary(currentUser?.id);

  if (!todayState) {
    return (
      <View style={styles.container}>
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>Faça o check-in diário para ver seu painel executivo</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <ScrollView contentContainerStyle={styles.content}>
        {/* Hero Section - State */}
        <View style={styles.hero}>
          <Text style={styles.heroLabel}>ESTADO ATUAL</Text>
          <View style={styles.heroState}>
            <StateBadge state={todayState} size="lg" />
          </View>

          {/* Overload Warning Badge */}
          {assessment &&
            (assessment.overloadLevel === 'high' || assessment.overloadLevel === 'critical') && (
              <View
                style={[
                  styles.overloadBadge,
                  assessment.overloadLevel === 'critical' && styles.overloadBadgeCritical,
                ]}
              >
                <Text style={styles.overloadBadgeText}>
                  {assessment.overloadLevel === 'critical'
                    ? '🔴 SOBRECARGA CRÍTICA'
                    : '🟡 SOBRECARGA ALTA'}
                </Text>
              </View>
            )}

          <Text style={styles.heroDate}>
            {new Date().toLocaleDateString('pt-BR', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
            })}
          </Text>
        </View>

        {/* Action Mother Card */}
        <ExecutiveCard elevated padding="xl">
          <Text style={styles.cardLabel}>AÇÃO-MÃE DO DIA</Text>
          <Text style={styles.actionMother}>{actionMother}</Text>
        </ExecutiveCard>

        {/* Guidance Card */}
        {guidance && (
          <ExecutiveCard elevated padding="xl">
            <View style={styles.guidanceHeader}>
              <Text style={styles.cardLabel}>ORIENTAÇÃO</Text>
              <View style={styles.guidanceMode}>
                <Text style={styles.guidanceModeText}>{guidance.mode}</Text>
              </View>
            </View>
            <Text style={styles.guidanceText}>{guidance.text}</Text>
          </ExecutiveCard>
        )}

        {/* Weekly Summary Card */}
        {summary && (
          <ExecutiveCard elevated padding="xl">
            <Text style={styles.cardLabel}>RESUMO SEMANAL</Text>

            {/* Victories */}
            {summary.victories.length > 0 && (
              <View style={styles.summarySection}>
                <Text style={styles.summarySectionTitle}>✅ Vitórias</Text>
                {summary.victories.map((victory, i) => (
                  <Text key={i} style={styles.summaryItem}>
                    • {victory}
                  </Text>
                ))}
              </View>
            )}

            {/* Blockers */}
            {summary.blockers.length > 0 && (
              <View style={styles.summarySection}>
                <Text style={styles.summarySectionTitle}>⚠️ Bloqueios</Text>
                {summary.blockers.map((blocker, i) => (
                  <Text key={i} style={styles.summaryItem}>
                    • {blocker}
                  </Text>
                ))}
              </View>
            )}

            {/* Key Insights */}
            {summary.insights.length > 0 && (
              <View style={styles.summarySection}>
                <Text style={styles.summarySectionTitle}>💡 Insights</Text>
                {summary.insights.slice(0, 3).map((insight, i) => (
                  <Text key={i} style={styles.summaryInsight}>
                    • {insight}
                  </Text>
                ))}
              </View>
            )}
          </ExecutiveCard>
        )}

        {/* Alerts Section */}
        {alerts.length > 0 ? (
          <ExecutiveCard elevated padding="xl">
            <Text style={styles.cardLabel}>ALERTAS ({alerts.length})</Text>
            <View style={styles.alertsList}>
              {alerts.map((alert) => (
                <View key={alert.id} style={styles.alert}>
                  <View style={styles.alertContent}>
                    <View style={styles.alertTypeContainer}>
                      <Text style={styles.alertType}>{alert.type}</Text>
                    </View>
                    <Text style={styles.alertMessage}>{alert.message}</Text>
                  </View>
                  <TouchableOpacity
                    style={styles.resolveButton}
                    onPress={() => resolveAlert(alert.id)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.resolveButtonText}>✓</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </ExecutiveCard>
        ) : (
          <ExecutiveCard elevated padding="xl">
            <Text style={styles.cardLabel}>ALERTAS</Text>
            <Text style={styles.noAlertsText}>
              Nenhum alerta ativo. Continue focado na sua ação-mãe.
            </Text>
          </ExecutiveCard>
        )}

        {/* Quick Stats */}
        <View style={styles.statsRow}>
          <ExecutiveCard elevated={false} padding="lg" style={styles.statCard}>
            <Text style={styles.statValue}>{alerts.length}</Text>
            <Text style={styles.statLabel}>Alertas</Text>
          </ExecutiveCard>
          <ExecutiveCard elevated={false} padding="lg" style={styles.statCard}>
            <Text style={styles.statValue}>
              {new Date().toLocaleDateString('pt-BR', { day: '2-digit' })}
            </Text>
            <Text style={styles.statLabel}>Dia</Text>
          </ExecutiveCard>
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
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  emptyText: {
    fontSize: typography.fontSize.base,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  hero: {
    paddingVertical: spacing['2xl'],
    alignItems: 'center',
  },
  heroLabel: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textTertiary,
    letterSpacing: typography.letterSpacing.wide,
    marginBottom: spacing.lg,
  },
  heroState: {
    marginBottom: spacing.md,
  },
  heroDate: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    textTransform: 'capitalize',
  },
  overloadBadge: {
    backgroundColor: colors.cautionLight,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  overloadBadgeCritical: {
    backgroundColor: colors.criticalLight,
  },
  overloadBadgeText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  cardLabel: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textTertiary,
    marginBottom: spacing.md,
    letterSpacing: typography.letterSpacing.wide,
  },
  actionMother: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.medium,
    color: colors.textPrimary,
    lineHeight: typography.fontSize.lg * typography.lineHeight.relaxed,
  },
  guidanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  guidanceMode: {
    backgroundColor: colors.attackLight,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  guidanceModeText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
    color: colors.attack,
    textTransform: 'uppercase',
  },
  guidanceText: {
    fontSize: typography.fontSize.base,
    color: colors.textSecondary,
    lineHeight: typography.fontSize.base * typography.lineHeight.relaxed,
  },
  alertsList: {
    gap: spacing.md,
  },
  alert: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.criticalLight,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderLeftWidth: 3,
    borderLeftColor: colors.critical,
  },
  alertContent: {
    flex: 1,
  },
  alertTypeContainer: {
    marginBottom: spacing.xs,
  },
  alertType: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
    color: colors.critical,
    textTransform: 'uppercase',
    letterSpacing: typography.letterSpacing.wide,
  },
  alertMessage: {
    fontSize: typography.fontSize.sm,
    color: colors.textPrimary,
    lineHeight: typography.fontSize.sm * typography.lineHeight.normal,
  },
  resolveButton: {
    backgroundColor: colors.attack,
    width: 32,
    height: 32,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: spacing.md,
  },
  resolveButtonText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.background,
  },
  noAlertsText: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    lineHeight: typography.fontSize.sm * typography.lineHeight.normal,
  },
  summarySection: {
    marginBottom: spacing.md,
  },
  summarySectionTitle: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  summaryItem: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    lineHeight: typography.fontSize.sm * 1.5,
    marginLeft: spacing.sm,
  },
  summaryInsight: {
    fontSize: typography.fontSize.sm,
    color: colors.attack,
    lineHeight: typography.fontSize.sm * 1.5,
    marginLeft: spacing.sm,
    fontWeight: typography.fontWeight.medium,
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  statLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: typography.letterSpacing.wide,
  },
});
