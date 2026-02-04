import { View, Text, StyleSheet, Pressable, Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { useAppStore } from '../store/app-store';
import { useEffect, useState } from 'react';
import { storage } from '../services/storage';

export default function Index() {
  const router = useRouter();
  const currentUser = useAppStore((state) => state.currentUser);
  const [hasCheckin, setHasCheckin] = useState(false);

  useEffect(() => {
    if (currentUser) {
      storage.getTodayCheckin(currentUser.id).then((checkin) => {
        setHasCheckin(!!checkin);
        if (checkin) {
          useAppStore.getState().setTodayCheckin(checkin);
        }
      });
    }
  }, [currentUser]);

  const handleStartDay = () => {
    if (hasCheckin) {
      router.push('/dashboard');
    } else {
      router.push('/checkin');
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <View style={styles.content}>
        <Text style={styles.title}>🎯 Assistente Operacional</Text>
        <Text style={styles.subtitle}>Decisões inteligentes, operação eficiente</Text>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>{hasCheckin ? 'Bem-vindo de volta!' : 'Bom dia!'}</Text>
          <Text style={styles.cardText}>
            {hasCheckin
              ? 'Seu dia já foi configurado. Continue de onde parou.'
              : 'Comece seu dia fazendo o check-in operacional.'}
          </Text>
        </View>

        <Pressable 
          style={({ pressed }) => [
            styles.primaryButton,
            pressed && styles.primaryButtonPressed,
            Platform.OS === 'web' && { cursor: 'pointer' }
          ]} 
          onPress={handleStartDay}
        >
          <Text style={styles.primaryButtonText}>
            {hasCheckin ? '📊 Ver Painel do Dia' : '✨ Iniciar Meu Dia'}
          </Text>
        </Pressable>

        <View style={styles.quickActions}>
          <Pressable 
            style={({ pressed }) => [
              styles.quickAction,
              pressed && styles.quickActionPressed,
              Platform.OS === 'web' && { cursor: 'pointer' }
            ]} 
            onPress={() => router.push('/finance')}
          >
            <Text style={styles.quickActionText}>💰 Financeiro</Text>
          </Pressable>
          <Pressable 
            style={({ pressed }) => [
              styles.quickAction,
              pressed && styles.quickActionPressed,
              Platform.OS === 'web' && { cursor: 'pointer' }
            ]} 
            onPress={() => router.push('/projects')}
          >
            <Text style={styles.quickActionText}>📋 Projetos</Text>
          </Pressable>
          <Pressable 
            style={({ pressed }) => [
              styles.quickAction,
              pressed && styles.quickActionPressed,
              Platform.OS === 'web' && { cursor: 'pointer' }
            ]} 
            onPress={() => router.push('/history')}
          >
            <Text style={styles.quickActionText}>📅 Histórico</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F1115',
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#9CA3AF',
    marginBottom: 48,
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#1A1D24',
    padding: 24,
    borderRadius: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#374151',
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  cardText: {
    fontSize: 15,
    color: '#9CA3AF',
    lineHeight: 22,
  },
  primaryButton: {
    backgroundColor: '#22C55E',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 32,
  },
  primaryButtonPressed: {
    backgroundColor: '#16A34A',
    opacity: 0.8,
  },
  primaryButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#0F1115',
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  quickAction: {
    flex: 1,
    backgroundColor: '#1A1D24',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#374151',
  },
  quickActionPressed: {
    backgroundColor: '#242830',
    borderColor: '#4B5563',
  },
  quickActionText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '500',
  },
});
