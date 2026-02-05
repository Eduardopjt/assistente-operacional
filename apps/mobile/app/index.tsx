import { View, Text, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';

export default function Index() {
  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <View style={styles.content}>
        <Text style={styles.emoji}>🧭</Text>
        <Text style={styles.title}>Focus Assistant</Text>
        <Text style={styles.tagline}>Menos ruído. Mais direção.</Text>
        
        <View style={styles.pillars}>
          <View style={styles.pillar}>
            <Text style={styles.pillarIcon}>💎</Text>
            <Text style={styles.pillarText}>Clareza</Text>
          </View>
          <View style={styles.pillar}>
            <Text style={styles.pillarIcon}>🎯</Text>
            <Text style={styles.pillarText}>Consciência</Text>
          </View>
          <View style={styles.pillar}>
            <Text style={styles.pillarIcon}>⚡</Text>
            <Text style={styles.pillarText}>Energia</Text>
          </View>
          <View style={styles.pillar}>
            <Text style={styles.pillarIcon}>✨</Text>
            <Text style={styles.pillarText}>Simplicidade</Text>
          </View>
        </View>

        <Text style={styles.buildNote}>v0.1.0 — Em construção</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  emoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  title: {
    fontSize: 40,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 8,
    textAlign: 'center',
    letterSpacing: -1,
  },
  tagline: {
    fontSize: 18,
    color: '#888888',
    marginBottom: 48,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  pillars: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 16,
    marginBottom: 40,
  },
  pillar: {
    alignItems: 'center',
    width: 100,
  },
  pillarIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  pillarText: {
    fontSize: 12,
    color: '#666666',
    textAlign: 'center',
  },
  buildNote: {
    fontSize: 11,
    color: '#333333',
    textAlign: 'center',
  },
});
