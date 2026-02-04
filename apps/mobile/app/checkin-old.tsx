import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { useAppStore } from '../store/app-store';
import { storage } from '../services/storage';
import { CaixaStatus, Energia, Pressao } from '@assistente/core';

const CAIXA_OPTIONS: { value: CaixaStatus; label: string; emoji: string }[] = [
  { value: 'tranquilo', label: 'Tranquilo', emoji: '😊' },
  { value: 'atencao', label: 'Atenção', emoji: '😐' },
  { value: 'critico', label: 'Crítico', emoji: '😟' },
];

const ENERGIA_OPTIONS: { value: Energia; label: string; emoji: string }[] = [
  { value: 'alta', label: 'Alta', emoji: '⚡' },
  { value: 'media', label: 'Média', emoji: '🔋' },
  { value: 'baixa', label: 'Baixa', emoji: '🪫' },
];

const PRESSAO_OPTIONS: { value: Pressao; label: string; emoji: string }[] = [
  { value: 'leve', label: 'Leve', emoji: '🌤️' },
  { value: 'normal', label: 'Normal', emoji: '☁️' },
  { value: 'alta', label: 'Alta', emoji: '⛈️' },
];

export default function CheckinScreen() {
  const router = useRouter();
  const currentUser = useAppStore((state) => state.currentUser);
  const setTodayCheckin = useAppStore((state) => state.setTodayCheckin);

  const [caixa, setCaixa] = useState<CaixaStatus | null>(null);
  const [energia, setEnergia] = useState<Energia | null>(null);
  const [pressao, setPressao] = useState<Pressao | null>(null);

  const canGenerate = caixa && energia && pressao;

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
        <Text style={styles.title}>Check-in Diário</Text>
        <Text style={styles.subtitle}>
          Responda honestamente para receber orientações personalizadas
        </Text>

        {/* Caixa Status */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>💰 Como está seu caixa?</Text>
          <View style={styles.options}>
            {CAIXA_OPTIONS.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.option,
                  caixa === option.value && styles.optionSelected,
                ]}
                onPress={() => setCaixa(option.value)}
              >
                <Text style={styles.optionEmoji}>{option.emoji}</Text>
                <Text
                  style={[
                    styles.optionText,
                    caixa === option.value && styles.optionTextSelected,
                  ]}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Energia */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>⚡ Qual sua energia hoje?</Text>
          <View style={styles.options}>
            {ENERGIA_OPTIONS.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.option,
                  energia === option.value && styles.optionSelected,
                ]}
                onPress={() => setEnergia(option.value)}
              >
                <Text style={styles.optionEmoji}>{option.emoji}</Text>
                <Text
                  style={[
                    styles.optionText,
                    energia === option.value && styles.optionTextSelected,
                  ]}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Pressão */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>🎯 Nível de pressão/urgência?</Text>
          <View style={styles.options}>
            {PRESSAO_OPTIONS.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.option,
                  pressao === option.value && styles.optionSelected,
                ]}
                onPress={() => setPressao(option.value)}
              >
                <Text style={styles.optionEmoji}>{option.emoji}</Text>
                <Text
                  style={[
                    styles.optionText,
                    pressao === option.value && styles.optionTextSelected,
                  ]}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <TouchableOpacity
          style={[styles.generateButton, !canGenerate && styles.generateButtonDisabled]}
          onPress={handleGenerate}
          disabled={!canGenerate}
        >
          <Text style={styles.generateButtonText}>✨ Gerar Meu Dia</Text>
        </TouchableOpacity>
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
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: '#9CA3AF',
    marginBottom: 32,
    lineHeight: 22,
  },
  section: {
    marginBottom: 32,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  options: {
    flexDirection: 'row',
    gap: 12,
  },
  option: {
    flex: 1,
    backgroundColor: '#1A1D24',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#374151',
  },
  optionSelected: {
    backgroundColor: '#22C55E20',
    borderColor: '#22C55E',
  },
  optionEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  optionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#9CA3AF',
  },
  optionTextSelected: {
    color: '#22C55E',
    fontWeight: '600',
  },
  generateButton: {
    backgroundColor: '#22C55E',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 16,
  },
  generateButtonDisabled: {
    backgroundColor: '#374151',
    opacity: 0.5,
  },
  generateButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#0F1115',
  },
});
