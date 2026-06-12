import React from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';
import { useAppContext } from '@/app/context/AppContext';

const MODES = [
  { id: 'Sera', title: 'Reflect & Validate', role: 'The Empath', colorKey: 'sera', desc: 'Need someone to just listen and validate your feelings without judgment?' },
  { id: 'Kael', title: 'Grounding & Calm', role: 'The Anchor', colorKey: 'kael', desc: 'Feeling overwhelmed? Let\'s slow down your breathing and bring you back to the present.' },
  { id: 'Nova', title: 'Challenge Thoughts', role: 'The Analyst', colorKey: 'nova', desc: 'Stuck in a negative loop? We will systematically break down cognitive distortions.' },
  { id: 'Zen', title: 'Roleplay Responses', role: 'The Mirror', colorKey: 'zen', desc: 'Anxious about a conversation? Practice what to say in a safe environment.' },
  { id: 'Arlo', title: 'Action & Focus', role: 'The Coach', colorKey: 'arlo', desc: 'Procrastinating? We will break it down into tiny, actionable steps and execute.' },
];

export default function SupportModesScreen() {
  const router = useRouter();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { setCurrentCharacter, currentCharacter } = useAppContext();

  const handleSelect = (charId: string) => {
    setCurrentCharacter(charId);
    router.replace('/(tabs)/chat');
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: insets.bottom + 24 }}>
        <Text style={[styles.subtitle, { color: colors.mutedForeground, marginBottom: 24 }]}>
          Choose the type of support you need right now.
        </Text>

        <View style={styles.cardsList}>
          {MODES.map(mode => {
            const charColor = (colors as any)[mode.colorKey] || colors.primary;
            const isSelected = currentCharacter === mode.id;

            return (
              <Pressable
                key={mode.id}
                style={[
                  styles.card,
                  { backgroundColor: colors.card, borderColor: isSelected ? charColor : colors.border },
                  isSelected && { borderWidth: 2 }
                ]}
                onPress={() => handleSelect(mode.id)}
              >
                <View style={[styles.accentBar, { backgroundColor: charColor }]} />
                <View style={styles.cardContent}>
                  <View style={styles.headerRow}>
                    <Text style={[styles.title, { color: colors.foreground }]}>{mode.title}</Text>
                    {isSelected && <Feather name="check-circle" size={18} color={charColor} />}
                  </View>
                  <Text style={[styles.role, { color: charColor }]}>{mode.id} — {mode.role}</Text>
                  <Text style={[styles.desc, { color: colors.mutedForeground }]}>{mode.desc}</Text>
                </View>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  subtitle: { fontSize: 16, fontFamily: 'Inter_400Regular', lineHeight: 24 },
  cardsList: { gap: 16 },
  card: { flexDirection: 'row', borderRadius: 16, borderWidth: 1, overflow: 'hidden' },
  accentBar: { width: 6, height: '100%' },
  cardContent: { flex: 1, padding: 16 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  title: { fontSize: 18, fontFamily: 'Inter_600SemiBold' },
  role: { fontSize: 13, fontFamily: 'Inter_600SemiBold', marginBottom: 12 },
  desc: { fontSize: 14, fontFamily: 'Inter_400Regular', lineHeight: 20 },
});
