import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';
import { useAppContext } from '@/app/context/AppContext';
import { useHealthCheck, useGetAllMemories } from '@workspace/api-client-react';
import { useRouter } from 'expo-router';
import { MoodOrb } from '@/components/MoodOrb';

const quickActions = [
  { label: 'Chat', icon: 'message-circle', href: '/(tabs)/chat', tint: 'primary' },
  { label: 'Voice', icon: 'mic', href: '/voice-room', tint: 'accent' },
  { label: 'Focus', icon: 'clock', href: '/games/focus-boss', tint: 'sage' },
  { label: 'Memory', icon: 'git-merge', href: '/(tabs)/memory', tint: 'dustyBlue' },
] as const;

export default function HomeScreen() {
  const router = useRouter();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { userName, currentCharacter } = useAppContext();
  const { data: health, isLoading: healthLoading } = useHealthCheck();
  const { data: memories } = useGetAllMemories();
  const latestMemory = memories?.memories?.[0];
  const lastEmotion = latestMemory?.emotion ?? 'calm';
  const isOnline = !!health && health.status === 'ok';
  const orbColor = useMemo(() => {
    switch (lastEmotion) {
      case 'calm':
        return colors.sage || '#8FCE9F';
      case 'stress':
      case 'high_stress':
      case 'overwhelm':
        return '#E25B5B'; // coral red
      case 'focus':
        return colors.dustyBlue || '#8FCEBF';
      case 'low_energy':
        return colors.lavender || '#B19FFB';
      case 'recovery':
        return colors.peach || '#FCA385';
      default:
        return colors.primary;
    }
  }, [lastEmotion, colors]);

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={{ paddingTop: insets.top + 20, paddingBottom: insets.bottom + 112 }}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <Text style={[styles.greeting, { color: colors.foreground }]}>Good evening, {userName}</Text>
        <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>Persistent cognitive companion</Text>
      </View>

      <View style={[styles.stateCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.stateCopy}>
          <Text style={[styles.kicker, { color: colors.primary }]}>Your Anima State</Text>
          <Text style={[styles.stateTitle, { color: colors.foreground }]}>
            {lastEmotion === 'high_stress' || lastEmotion === 'overwhelm' ? 'Elevated Stress Loop' : 'Balanced State'}
          </Text>
          <Text style={[styles.stateBody, { color: colors.mutedForeground }]}>
            Companion: {currentCharacter}. Daily state: {lastEmotion === 'high_stress' || lastEmotion === 'overwhelm' ? 'elevated stress pattern with one small reset suggested.' : 'centered and steady. Keep up the good work.'}
          </Text>
        </View>
        <View style={[styles.weatherPanel, { backgroundColor: 'transparent', width: 72, height: 72, alignItems: 'center', justifyContent: 'center' }]}>
          <MoodOrb size={64} color={orbColor} pulsing={true} />
        </View>
      </View>

      <View style={styles.quickGrid}>
        {quickActions.map((action) => {
          const tint = colors[action.tint];
          return (
            <Pressable
              key={action.label}
              style={({ pressed }) => [
                styles.quickAction,
                { backgroundColor: colors.card, borderColor: colors.border },
                pressed && styles.pressed,
              ]}
              onPress={() => router.push(action.href)}
            >
              <View style={[styles.iconBox, { backgroundColor: tint + '20' }]}>
                <Feather name={action.icon} size={20} color={tint} />
              </View>
              <Text style={[styles.quickText, { color: colors.foreground }]}>{action.label}</Text>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.section}>
        <Pressable
          style={[styles.resetCard, { backgroundColor: colors.peach + '22', borderColor: colors.peach }]}
          onPress={() => router.push('/games/camera-mission')}
        >
          <View style={styles.cardHeader}>
            <Text style={[styles.cardEyebrow, { color: colors.accent }]}>Today's suggested reset</Text>
            <Feather name="arrow-right" size={18} color={colors.accent} />
          </View>
          <Text style={[styles.cardTitle, { color: colors.foreground }]}>2-minute grounding</Text>
          <Text style={[styles.cardText, { color: colors.mutedForeground }]}>
            Reason: exam pressure patterns often show up late at night. Use your room to find one next step.
          </Text>
        </Pressable>
      </View>

      <View style={styles.twoColumn}>
        <View style={[styles.smallCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.cardEyebrow, { color: colors.mutedForeground }]}>Signals today</Text>
          <Text style={[styles.signalText, { color: colors.foreground }]}>Typing rhythm slightly elevated</Text>
          <Text style={[styles.signalMeta, { color: colors.mutedForeground }]}>Session 12 min · focus friction medium</Text>
        </View>
        <View style={[styles.smallCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.cardEyebrow, { color: colors.mutedForeground }]}>Backend</Text>
          <View style={styles.statusRow}>
            {healthLoading ? <ActivityIndicator size="small" color={colors.primary} /> : <View style={[styles.dot, { backgroundColor: isOnline ? colors.sage : colors.destructive }]} />}
            <Text style={[styles.signalText, { color: isOnline ? colors.sage : colors.destructive }]}>
              {isOnline ? 'Connected' : 'Offline'}
            </Text>
          </View>
          <Text style={[styles.signalMeta, { color: colors.mutedForeground }]}>Live API contract check</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Pressable
          style={[styles.memoryCard, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={() => router.push('/(tabs)/memory')}
        >
          <View style={styles.cardHeader}>
            <Text style={[styles.cardEyebrow, { color: colors.primary }]}>Last helpful strategy</Text>
            <Feather name="database" size={18} color={colors.primary} />
          </View>
          <Text style={[styles.cardTitle, { color: colors.foreground }]}>
            {latestMemory?.title ?? 'Nova reframe + Arlo 5-minute sprint'}
          </Text>
          <Text style={[styles.cardText, { color: colors.mutedForeground }]} numberOfLines={3}>
            {latestMemory?.reframe ?? latestMemory?.summary ?? 'Past proof is ready for the next challenge: start small, capture evidence, and store the win.'}
          </Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 24, marginBottom: 20 },
  greeting: { fontSize: 30, fontFamily: 'Inter_700Bold', lineHeight: 36 },
  subtitle: { fontSize: 14, fontFamily: 'Inter_500Medium', marginTop: 6 },
  stateCard: { marginHorizontal: 24, borderRadius: 8, borderWidth: 1, padding: 18, flexDirection: 'row', gap: 16, marginBottom: 18 },
  stateCopy: { flex: 1 },
  kicker: { fontSize: 12, fontFamily: 'Inter_700Bold', textTransform: 'uppercase', marginBottom: 8 },
  stateTitle: { fontSize: 22, fontFamily: 'Inter_700Bold', lineHeight: 28 },
  stateBody: { fontSize: 14, fontFamily: 'Inter_400Regular', lineHeight: 20, marginTop: 8 },
  weatherPanel: { width: 84, borderRadius: 8, alignItems: 'center', justifyContent: 'center', gap: 10 },
  weatherLine: { width: 44, height: 3, borderRadius: 2 },
  weatherLineShort: { width: 28, height: 3, borderRadius: 2 },
  quickGrid: { flexDirection: 'row', paddingHorizontal: 24, gap: 10, marginBottom: 18 },
  quickAction: { flex: 1, borderRadius: 8, borderWidth: 1, paddingVertical: 14, alignItems: 'center', gap: 8 },
  pressed: { opacity: 0.75, transform: [{ scale: 0.98 }] },
  iconBox: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center' },
  quickText: { fontSize: 13, fontFamily: 'Inter_600SemiBold' },
  section: { paddingHorizontal: 24, marginBottom: 16 },
  resetCard: { borderRadius: 8, borderWidth: 1, padding: 18 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  cardEyebrow: { fontSize: 12, fontFamily: 'Inter_700Bold', textTransform: 'uppercase' },
  cardTitle: { fontSize: 19, fontFamily: 'Inter_700Bold', marginBottom: 6, lineHeight: 25 },
  cardText: { fontSize: 14, fontFamily: 'Inter_400Regular', lineHeight: 21 },
  twoColumn: { flexDirection: 'row', paddingHorizontal: 24, gap: 12, marginBottom: 16 },
  smallCard: { flex: 1, borderRadius: 8, borderWidth: 1, padding: 14, minHeight: 128 },
  signalText: { fontSize: 15, fontFamily: 'Inter_700Bold', lineHeight: 21, marginTop: 10 },
  signalMeta: { fontSize: 12, fontFamily: 'Inter_400Regular', lineHeight: 17, marginTop: 8 },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  dot: { width: 9, height: 9, borderRadius: 5 },
  memoryCard: { borderRadius: 8, borderWidth: 1, padding: 18 },
});
