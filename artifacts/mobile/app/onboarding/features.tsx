import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';

const FEATURES = [
  { id: 'mic', title: 'Microphone', icon: 'mic', status: 'Enabled' },
  { id: 'camera', title: 'Camera', icon: 'camera', status: 'Optional' },
  { id: 'notifications', title: 'Notifications', icon: 'bell', status: 'Recommended' },
  { id: 'memory', title: 'Memory Sync', icon: 'database', status: 'Enabled' },
];

export default function FeaturesScreen() {
  const router = useRouter();
  const colors = useColors();
  const insets = useSafeAreaInsets();

  const handleContinue = () => {
    // In a real app we'd request permissions here
    router.replace('/(tabs)/home');
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.foreground }]}>Feature Access.</Text>
        <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
          Anima-Link works best when it can see and hear your environment.
        </Text>
      </View>

      <View style={styles.cardsContainer}>
        {FEATURES.map(f => (
          <View key={f.id} style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={[styles.iconBox, { backgroundColor: colors.primary + '22' }]}>
              <Feather name={f.icon as any} size={20} color={colors.primary} />
            </View>
            <View style={styles.cardText}>
              <Text style={[styles.cardTitle, { color: colors.foreground }]}>{f.title}</Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: colors.muted }]}>
              <Text style={[styles.statusText, { color: colors.mutedForeground }]}>{f.status}</Text>
            </View>
          </View>
        ))}
      </View>

      <View style={styles.footer}>
        <Pressable 
          style={[styles.button, { backgroundColor: colors.primary }]}
          onPress={handleContinue}
        >
          <Text style={[styles.buttonText, { color: colors.primaryForeground }]}>Finish Setup</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 24,
    paddingTop: 40,
  },
  title: {
    fontSize: 32,
    fontFamily: 'Inter_700Bold',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
    lineHeight: 24,
  },
  cardsContainer: {
    flex: 1,
    paddingHorizontal: 24,
    gap: 16,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    gap: 16,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardText: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontFamily: 'Inter_500Medium',
  },
  footer: {
    padding: 24,
  },
  button: {
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
  },
});
