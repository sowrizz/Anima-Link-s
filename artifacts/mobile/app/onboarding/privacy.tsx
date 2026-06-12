import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, Switch } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';
import AsyncStorage from '@react-native-async-storage/async-storage';

const PERMISSIONS = [
  { id: 'chat_history', title: 'Chat History', description: 'Save conversations to build your memory graph.', icon: 'message-circle' },
  { id: 'voice', title: 'Voice', description: 'Enable voice journaling and emotional tone analysis.', icon: 'mic' },
  { id: 'camera', title: 'Camera', description: 'Scan your workspace for grounding exercises.', icon: 'camera' },
  { id: 'memory', title: 'Memory', description: 'Allow Anima to recall past strategies during crisis.', icon: 'database' },
];

export default function PrivacyScreen() {
  const router = useRouter();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [toggles, setToggles] = useState<Record<string, boolean>>({
    chat_history: true,
    voice: false,
    camera: false,
    memory: true,
  });

  const toggleSwitch = (id: string) => {
    setToggles(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleContinue = async () => {
    await AsyncStorage.setItem('privacySettings', JSON.stringify(toggles));
    router.push('/onboarding/style');
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.foreground }]}>Your Privacy.</Text>
        <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
          You own your data. Choose what Anima-Link can access to personalize your experience.
        </Text>
      </View>

      <View style={styles.cardsContainer}>
        {PERMISSIONS.map(p => (
          <View key={p.id} style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={[styles.iconBox, { backgroundColor: colors.primary + '22' }]}>
              <Feather name={p.icon as any} size={20} color={colors.primary} />
            </View>
            <View style={styles.cardText}>
              <Text style={[styles.cardTitle, { color: colors.foreground }]}>{p.title}</Text>
              <Text style={[styles.cardDesc, { color: colors.mutedForeground }]}>{p.description}</Text>
            </View>
            <Switch
              value={toggles[p.id]}
              onValueChange={() => toggleSwitch(p.id)}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={colors.card}
            />
          </View>
        ))}
      </View>

      <View style={styles.footer}>
        <Pressable 
          style={[styles.button, { backgroundColor: colors.primary }]}
          onPress={handleContinue}
        >
          <Text style={[styles.buttonText, { color: colors.primaryForeground }]}>Continue</Text>
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
    marginBottom: 4,
  },
  cardDesc: {
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
    lineHeight: 18,
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
