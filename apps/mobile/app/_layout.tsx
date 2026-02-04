import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useEffect } from 'react';
import { useAppStore } from '../store/app-store';
import { storage } from '../services/storage';
import { ErrorBoundary } from '../src/components/ErrorBoundary';
import { seedTestData } from '../services/seedData'; // DELETE AFTER TESTING

export default function RootLayout() {
  const setCurrentUser = useAppStore((state) => state.setCurrentUser);

  useEffect(() => {
    // Initialize user on app start
    const initUser = async () => {
      let user = await storage.getUser();
      if (!user) {
        user = await storage.createUser({ theme: 'dark' });
        // SEED TEST DATA - DELETE AFTER TESTING
        await seedTestData(user.id);
      }
      setCurrentUser(user);
    };
    initUser();
  }, []);

  return (
    <ErrorBoundary>
      <SafeAreaProvider>
        <Stack
          screenOptions={{
            headerStyle: {
              backgroundColor: '#0F1115',
            },
            headerTintColor: '#FFFFFF',
            headerTitleStyle: {
              fontWeight: '600',
            },
            contentStyle: {
              backgroundColor: '#0F1115',
            },
          }}
        >
          <Stack.Screen name="index" options={{ title: 'Início' }} />
          <Stack.Screen name="checkin" options={{ title: 'Check-in Diário' }} />
          <Stack.Screen name="dashboard" options={{ title: 'Hoje' }} />
          <Stack.Screen name="finance" options={{ title: 'Financeiro' }} />
          <Stack.Screen name="projects" options={{ title: 'Projetos' }} />
          <Stack.Screen name="history" options={{ title: 'Histórico' }} />
        </Stack>
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}
