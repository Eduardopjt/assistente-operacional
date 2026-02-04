import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useAppStore } from '../store/app-store';

const STATE_COLORS = {
  ATTACK: '#22C55E',
  CAUTION: '#FACC15',
  CRITICAL: '#EF4444',
};

const STATE_LABELS = {
  ATTACK: '🟢 ATAQUE',
  CAUTION: '🟡 CAUTELA',
  CRITICAL: '🔴 CRÍTICO',
};

export default function DashboardScreen() {
  const todayState = useAppStore((state) => state.todayState);
  const actionMother = useAppStore((state) => state.actionMother);
  const guidance = useAppStore((state) => state.guidance);
  const alerts = useAppStore((state) => state.alerts.filter((a) => !a.resolved));
  const resolveAlert = useAppStore((state) => state.resolveAlert);

  if (!todayState) {
    return (
      <View style={styles.container}>
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>Faça o check-in diário para ver seu painel</Text>
        </View>
      </View>
    );
  }

  const stateColor = STATE_COLORS[todayState];
  const stateLabel = STATE_LABELS[todayState];

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <ScrollView contentContainerStyle={styles.content}>
        {/* State Badge */}
        <View style={[styles.stateBadge, { backgroundColor: stateColor + '20' }]}>
          <Text style={[styles.stateText, { color: stateColor }]}>{stateLabel}</Text>
        </View>

        {/* Action Mother */}
        <View style={styles.card}>
          <Text style={styles.cardLabel}>🎯 Ação-Mãe do Dia</Text>
          <Text style={styles.actionMother}>{actionMother}</Text>
        </View>

        {/* Guidance */}
        {guidance && (
          <View style={styles.card}>
            <View style={styles.guidanceHeader}>
              <Text style={styles.cardLabel}>💡 Orientação</Text>
              <Text style={styles.guidanceMode}>{guidance.mode}</Text>
            </View>
            <Text style={styles.guidanceText}>{guidance.text}</Text>
          </View>
        )}

        {/* Alerts */}
        {alerts.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.cardLabel}>⚠️ Alertas ({alerts.length})</Text>
            {alerts.map((alert) => (
              <View key={alert.id} style={styles.alert}>
                <View style={styles.alertContent}>
                  <Text style={styles.alertType}>{alert.type.toUpperCase()}</Text>
                  <Text style={styles.alertMessage}>{alert.message}</Text>
                </View>
                <TouchableOpacity
                  style={styles.resolveButton}
                  onPress={() => resolveAlert(alert.id)}
                >
                  <Text style={styles.resolveButtonText}>✓</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        {alerts.length === 0 && (
          <View style={styles.card}>
            <Text style={styles.cardLabel}>✅ Nenhum alerta ativo</Text>
            <Text style={styles.noAlertsText}>
              Tudo sob controle. Continue focado na sua ação-mãe.
            </Text>
          </View>
        )}

        {/* Quick Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>
              {new Date().toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: 'short',
              })}
            </Text>
            <Text style={styles.statLabel}>Hoje</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{alerts.length}</Text>
            <Text style={styles.statLabel}>Alertas</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statValue, { color: stateColor }]}>
              {todayState}
            </Text>
            <Text style={styles.statLabel}>Estado</Text>
          </View>
        </View>
      </ScrollView>
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
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyText: {
    fontSize: 16,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  stateBadge: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 24,
  },
  stateText: {
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: 1,
  },
  card: {
    backgroundColor: '#1A1D24',
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#374151',
  },
  cardLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#9CA3AF',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  actionMother: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    lineHeight: 26,
  },
  guidanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  guidanceMode: {
    fontSize: 12,
    fontWeight: '700',
    color: '#22C55E',
    backgroundColor: '#22C55E20',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  guidanceText: {
    fontSize: 15,
    color: '#E5E7EB',
    lineHeight: 22,
  },
  alert: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EF444420',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#EF4444',
  },
  alertContent: {
    flex: 1,
  },
  alertType: {
    fontSize: 10,
    fontWeight: '700',
    color: '#EF4444',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  alertMessage: {
    fontSize: 14,
    color: '#FFFFFF',
    lineHeight: 20,
  },
  resolveButton: {
    backgroundColor: '#22C55E',
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },
  resolveButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F1115',
  },
  noAlertsText: {
    fontSize: 14,
    color: '#9CA3AF',
    lineHeight: 20,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#1A1D24',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#374151',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#9CA3AF',
  },
});
