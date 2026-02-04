import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useState, useEffect } from 'react';
import { useAppStore } from '../store/app-store';
import { storage } from '../services/storage';
import { DailyCheckin, Decision, Alert } from '@assistente/core';

const STATE_COLORS = {
  ATTACK: '#22C55E',
  CAUTION: '#FACC15',
  CRITICAL: '#EF4444',
};

export default function HistoryScreen() {
  const currentUser = useAppStore((state) => state.currentUser);

  const [checkins, setCheckins] = useState<DailyCheckin[]>([]);
  const [decisions, setDecisions] = useState<Decision[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [activeTab, setActiveTab] = useState<'checkins' | 'decisions' | 'alerts'>('checkins');

  useEffect(() => {
    if (currentUser) {
      storage.getRecentCheckins(currentUser.id, 30).then(setCheckins);
      storage.getRecentDecisions(currentUser.id, 50).then(setDecisions);
      storage.getUnresolvedAlerts(currentUser.id).then(setAlerts);
    }
  }, [currentUser]);

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* Tabs */}
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'checkins' && styles.tabActive]}
          onPress={() => setActiveTab('checkins')}
        >
          <Text style={[styles.tabText, activeTab === 'checkins' && styles.tabTextActive]}>
            Check-ins
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'decisions' && styles.tabActive]}
          onPress={() => setActiveTab('decisions')}
        >
          <Text style={[styles.tabText, activeTab === 'decisions' && styles.tabTextActive]}>
            Decisões
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'alerts' && styles.tabActive]}
          onPress={() => setActiveTab('alerts')}
        >
          <Text style={[styles.tabText, activeTab === 'alerts' && styles.tabTextActive]}>
            Alertas
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Check-ins Tab */}
        {activeTab === 'checkins' && (
          <>
            {checkins.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>Nenhum check-in registrado</Text>
              </View>
            ) : (
              checkins.map((checkin) => (
                <View key={checkin.id} style={styles.card}>
                  <View style={styles.cardHeader}>
                    <Text style={styles.cardDate}>
                      {new Date(checkin.date).toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </Text>
                    {checkin.estado_calculado && (
                      <View
                        style={[
                          styles.stateBadge,
                          { backgroundColor: STATE_COLORS[checkin.estado_calculado] + '20' },
                        ]}
                      >
                        <Text
                          style={[
                            styles.stateText,
                            { color: STATE_COLORS[checkin.estado_calculado] },
                          ]}
                        >
                          {checkin.estado_calculado}
                        </Text>
                      </View>
                    )}
                  </View>
                  <View style={styles.checkinDetails}>
                    <View style={styles.checkinItem}>
                      <Text style={styles.checkinLabel}>Caixa:</Text>
                      <Text style={styles.checkinValue}>{checkin.caixa_status}</Text>
                    </View>
                    <View style={styles.checkinItem}>
                      <Text style={styles.checkinLabel}>Energia:</Text>
                      <Text style={styles.checkinValue}>{checkin.energia}</Text>
                    </View>
                    <View style={styles.checkinItem}>
                      <Text style={styles.checkinLabel}>Pressão:</Text>
                      <Text style={styles.checkinValue}>{checkin.pressao}</Text>
                    </View>
                  </View>
                </View>
              ))
            )}
          </>
        )}

        {/* Decisions Tab */}
        {activeTab === 'decisions' && (
          <>
            {decisions.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>Nenhuma decisão registrada</Text>
              </View>
            ) : (
              decisions.map((decision) => (
                <View key={decision.id} style={styles.card}>
                  <Text style={styles.cardDate}>
                    {new Date(decision.date).toLocaleDateString('pt-BR', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </Text>
                  <Text style={styles.decisionContext}>{decision.context}</Text>
                  <View style={styles.decisionBox}>
                    <Text style={styles.decisionLabel}>Decisão:</Text>
                    <Text style={styles.decisionText}>{decision.decision}</Text>
                  </View>
                </View>
              ))
            )}
          </>
        )}

        {/* Alerts Tab */}
        {activeTab === 'alerts' && (
          <>
            {alerts.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>Nenhum alerta ativo</Text>
              </View>
            ) : (
              alerts.map((alert) => (
                <View key={alert.id} style={styles.card}>
                  <View style={styles.cardHeader}>
                    <Text style={styles.cardDate}>
                      {new Date(alert.date).toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: 'short',
                      })}
                    </Text>
                    <Text style={styles.alertType}>{alert.type.toUpperCase()}</Text>
                  </View>
                  <Text style={styles.alertMessage}>{alert.message}</Text>
                </View>
              ))
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F1115',
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: '#1A1D24',
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
  },
  tab: {
    flex: 1,
    padding: 16,
    alignItems: 'center',
  },
  tabActive: {
    borderBottomWidth: 2,
    borderBottomColor: '#22C55E',
  },
  tabText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#9CA3AF',
  },
  tabTextActive: {
    color: '#22C55E',
    fontWeight: '600',
  },
  content: {
    padding: 24,
  },
  card: {
    backgroundColor: '#1A1D24',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#374151',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardDate: {
    fontSize: 13,
    fontWeight: '600',
    color: '#9CA3AF',
  },
  stateBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  stateText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  checkinDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  checkinItem: {
    flex: 1,
  },
  checkinLabel: {
    fontSize: 11,
    color: '#6B7280',
    marginBottom: 2,
  },
  checkinValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
    textTransform: 'capitalize',
  },
  decisionContext: {
    fontSize: 14,
    color: '#9CA3AF',
    marginBottom: 8,
    lineHeight: 20,
  },
  decisionBox: {
    backgroundColor: '#22C55E10',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#22C55E',
  },
  decisionLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#22C55E',
    marginBottom: 4,
  },
  decisionText: {
    fontSize: 14,
    color: '#E5E7EB',
    lineHeight: 20,
  },
  alertType: {
    fontSize: 11,
    fontWeight: '700',
    color: '#EF4444',
    backgroundColor: '#EF444420',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  alertMessage: {
    fontSize: 14,
    color: '#E5E7EB',
    lineHeight: 20,
  },
  emptyState: {
    padding: 48,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 15,
    color: '#9CA3AF',
  },
});
