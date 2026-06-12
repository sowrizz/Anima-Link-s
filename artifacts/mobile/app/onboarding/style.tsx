import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';
import { useAppContext } from '@/app/context/AppContext';

const STYLES = [
  { id: 'Reflect', title: 'Reflect', description: 'Empathetic listening and validation.', character: 'Sera', colorKey: 'sera' },
  { id: 'Ground', title: 'Ground', description: 'Calming techniques and reality checks.', character: 'Kael', colorKey: 'kael' },
  { id: 'Challenge', title: 'Challenge', description: 'Direct CBT and cognitive reframing.', character: 'Nova', colorKey: 'nova' },
  { id: 'Act', title: 'Act', description: 'Action-oriented planning and focus.', character: 'Arlo', colorKey: 'arlo' },
  { id: 'Vent', title: 'Vent', description: 'Safe space to release without judgment.', character: 'Sera', colorKey: 'sera' },
];

export default function StyleScreen() {
  const router = useRouter();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { setSupportStyle, supportStyle } = useAppContext();
  const [selected, setSelected] = useState(supportStyle);

  const handleContinue = () => {
    setSupportStyle(selected);
    router.push('/onboarding/features');
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.foreground }]}>Your Support Style.</Text>
        <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
          How do you want Anima-Link to respond to you? You can change this later.
        </Text>
      </View>

      <ScrollView style={styles.cardsContainer} contentContainerStyle={{ padding: 24, gap: 16 }}>
        {STYLES.map(s => {
          const isSelected = selected === s.id;
          const charColor = (colors as any)[s.colorKey] || colors.primary;
          
          return (
            <Pressable 
              key={s.id} 
              style={[
                styles.card, 
                { backgroundColor: colors.card, borderColor: isSelected ? charColor : colors.border },
                isSelected && { borderWidth: 2 }
              ]}
              onPress={() => setSelected(s.id)}
            >
              <View style={styles.cardHeader}>
                <View style={styles.titleRow}>
                  <Text style={[styles.cardTitle, { color: colors.foreground }]}>{s.title}</Text>
                  {isSelected && <Feather name="check-circle" size={18} color={charColor} />}
                </View>
                <View style={[styles.badge, { backgroundColor: charColor + '22' }]}>
                  <Text style={[styles.badgeText, { color: charColor }]}>Via {s.character}</Text>
                </View>
              </View>
              <Text style={[styles.cardDesc, { color: colors.mutedForeground }]}>{s.description}</Text>
            </Pressable>
          );
        })}
      </ScrollView>

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
    paddingBottom: 0,
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
  },
  card: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontFamily: 'Inter_600SemiBold',
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 12,
    fontFamily: 'Inter_600SemiBold',
  },
  cardDesc: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    lineHeight: 20,
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
