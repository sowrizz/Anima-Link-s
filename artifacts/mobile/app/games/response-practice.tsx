import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';
import { customFetch } from '@workspace/api-client-react';

const SCENARIOS = [
  {
    id: 1,
    title: 'Project Deadline',
    scenario: "Your teammate has not pushed their code before the deadline, and the client presentation is in one hour. They aren't responding to messages.",
    reactiveThought: "They are completely irresponsible! They are trying to ruin this project and make me look bad.",
    clinicalTip: 'Charitable attribution: Consider other possibilities (e.g. power cut, emergency) and focus on the solution.',
    placeholder: 'Hi, just checking in. Let me know if there is any blocker I can help with to get the code merged before the presentation...',
  },
  {
    id: 2,
    title: 'Client Email Typo',
    scenario: 'You sent an email to a key client and noticed a small spelling mistake right after sending it.',
    reactiveThought: "I'm so stupid! The client will think we're incompetent, we'll lose the contract, and I'll get fired.",
    clinicalTip: 'De-catastrophizing: A small typo rarely ruins a partnership. Focus on the core message being intact.',
    placeholder: 'Hi client, just noticed a small typo in my previous email. I will make sure our final templates are double-checked...',
  },
  {
    id: 3,
    title: 'Unanswered Text',
    scenario: 'You texted a close friend to hang out, and they haven\'t replied or read your message for over five hours.',
    reactiveThought: "They are ignoring me. I must have done something wrong to upset them, or they don't value our friendship anymore.",
    clinicalTip: 'Mind reading: Do not assume their silence is about you. They are likely busy or away from their phone.',
    placeholder: 'I will give them some space. They are probably busy. I will catch up with them whenever they reply...',
  },
];

export default function ResponsePracticeScreen() {
  const router = useRouter();
  const colors = useColors();
  const insets = useSafeAreaInsets();

  const [activeIdx, setActiveIdx] = useState(0);
  const [input, setInput] = useState('');
  const [grading, setGrading] = useState(false);
  const [gradeResult, setGradeResult] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [reward, setReward] = useState<any>(null);

  const activeScenario = SCENARIOS[activeIdx];

  const handleGrade = async () => {
    if (!input.trim()) return;
    setGrading(true);
    try {
      const res = await customFetch<any>('/games/cbt-arena/score', {
        method: 'POST',
        body: JSON.stringify({
          scenario: activeScenario.scenario,
          original_reply: input.trim(),
        }),
      });
      setGradeResult(res);
    } catch (e) {
      console.error(e);
    } finally {
      setGrading(false);
    }
  };

  const handleSave = async () => {
    if (!gradeResult || !input.trim()) return;
    setSaving(true);
    try {
      const res = await customFetch<any>('/games/cbt-arena/complete', {
        method: 'POST',
        body: JSON.stringify({
          game_id: gradeResult.game_id,
          scenario: activeScenario.scenario,
          final_reframe: input.trim(),
          distortion: gradeResult.distortion_pattern,
        }),
      });
      setReward(res);
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const resetGame = () => {
    setInput('');
    setGradeResult(null);
    setReward(null);
  };

  const changeScenario = (direction: 'next' | 'prev') => {
    resetGame();
    if (direction === 'next') {
      setActiveIdx((activeIdx + 1) % SCENARIOS.length);
    } else {
      setActiveIdx((activeIdx - 1 + SCENARIOS.length) % SCENARIOS.length);
    }
  };

  const getMeterColor = (level: 'low' | 'medium' | 'high', type: 'aggression' | 'positive') => {
    if (type === 'aggression') {
      if (level === 'low') return colors.sage || '#6BAF72';
      if (level === 'medium') return '#E8956E'; // orange
      return colors.destructive || '#D94F4F';
    } else {
      if (level === 'high') return colors.sage || '#6BAF72';
      if (level === 'medium') return '#E8956E';
      return colors.destructive || '#D94F4F';
    }
  };

  const getMeterPercent = (level: 'low' | 'medium' | 'high', type: 'aggression' | 'positive') => {
    if (type === 'aggression') {
      if (level === 'low') return 100; // Low aggression is good -> 100% score
      if (level === 'medium') return 50;
      return 15;
    } else {
      if (level === 'high') return 100;
      if (level === 'medium') return 60;
      return 20;
    }
  };

  if (reward) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <Feather name="award" size={68} color={colors.sage} style={{ marginBottom: 24 }} />
        <Text style={[styles.rewardTitle, { color: colors.foreground }]}>Response Mastery Stored</Text>
        <Text style={[styles.rewardBody, { color: colors.mutedForeground }]}>{reward.reward}</Text>
        <Pressable
          style={[styles.btn, { backgroundColor: colors.primary, marginTop: 32, width: '85%' }]}
          onPress={() => router.replace('/(tabs)/missions')}
        >
          <Text style={[styles.btnText, { color: colors.primaryForeground }]}>Back to Missions</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + 20,
          paddingBottom: insets.bottom + 40,
          paddingHorizontal: 24,
        }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.closeBtn}>
            <Feather name="x" size={24} color={colors.foreground} />
          </Pressable>
          <Text style={[styles.title, { color: colors.foreground }]}>CBT Response Arena</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Scenario Selector */}
        {!gradeResult && (
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.selectorRow}>
              <Pressable style={styles.arrowBtn} onPress={() => changeScenario('prev')}>
                <Feather name="chevron-left" size={22} color={colors.foreground} />
              </Pressable>
              <Text style={[styles.scenarioTitle, { color: colors.foreground }]}>
                Scenario {activeIdx + 1}: {activeScenario.title}
              </Text>
              <Pressable style={styles.arrowBtn} onPress={() => changeScenario('next')}>
                <Feather name="chevron-right" size={22} color={colors.foreground} />
              </Pressable>
            </View>

            <Text style={[styles.scenarioBody, { color: colors.foreground }]}>
              {activeScenario.scenario}
            </Text>

            <View style={[styles.divider, { backgroundColor: colors.border }]} />

            <View style={styles.metaRow}>
              <Feather name="alert-circle" size={16} color={colors.destructive} />
              <Text style={[styles.reactiveLabel, { color: colors.destructive }]}>Reactive Impulse:</Text>
            </View>
            <Text style={[styles.reactiveBody, { color: colors.mutedForeground }]}>
              "{activeScenario.reactiveThought}"
            </Text>

            <View style={[styles.clinicalTipBox, { backgroundColor: colors.primary + '10' }]}>
              <Text style={[styles.clinicalTipText, { color: colors.primary }]}>
                {activeScenario.clinicalTip}
              </Text>
            </View>
          </View>
        )}

        {/* Input Area */}
        {!gradeResult && (
          <View style={styles.inputArea}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Your Reframed Message</Text>
            <Text style={[styles.sectionSubtitle, { color: colors.mutedForeground }]}>
              Rehearse a constructive, assertive, and solution-focused message below.
            </Text>
            <TextInput
              style={[
                styles.textInput,
                {
                  backgroundColor: colors.card,
                  color: colors.foreground,
                  borderColor: colors.border,
                },
              ]}
              placeholder={activeScenario.placeholder}
              placeholderTextColor={colors.mutedForeground}
              value={input}
              onChangeText={setInput}
              multiline
            />

            <Pressable
              style={[
                styles.btn,
                { backgroundColor: input.trim() ? colors.primary : colors.muted },
              ]}
              onPress={handleGrade}
              disabled={!input.trim() || grading}
            >
              {grading ? (
                <ActivityIndicator color={colors.primaryForeground} />
              ) : (
                <View style={styles.btnRow}>
                  <Feather name="activity" size={18} color={colors.primaryForeground} />
                  <Text style={[styles.btnText, { color: colors.primaryForeground }]}>
                    Submit for CBT Grading
                  </Text>
                </View>
              )}
            </Pressable>
          </View>
        )}

        {/* Grader Results */}
        {gradeResult && (
          <View style={styles.resultsArea}>
            <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={styles.resultsHeader}>
                <View style={[styles.badge, { backgroundColor: colors.primary + '20' }]}>
                  <Text style={[styles.badgeText, { color: colors.primary }]}>
                    {gradeResult.distortion_pattern || 'CBT Scored'}
                  </Text>
                </View>
                <Pressable onPress={resetGame} style={styles.retryBtn}>
                  <Feather name="rotate-ccw" size={16} color={colors.primary} />
                  <Text style={[styles.retryText, { color: colors.primary }]}>Retry</Text>
                </Pressable>
              </View>

              <Text style={[styles.gradeScenarioTitle, { color: colors.foreground }]}>
                Grading for: {activeScenario.title}
              </Text>

              {/* Meters */}
              <View style={styles.metersContainer}>
                {/* Meter 1: Non-Aggression */}
                <View style={styles.meterRow}>
                  <View style={styles.meterHeader}>
                    <Text style={[styles.meterLabel, { color: colors.foreground }]}>Non-Aggression</Text>
                    <Text
                      style={[
                        styles.meterValue,
                        { color: getMeterColor(gradeResult.aggression, 'aggression') },
                      ]}
                    >
                      {gradeResult.aggression === 'low' ? 'High (Excellent)' : gradeResult.aggression === 'medium' ? 'Moderate' : 'Low'}
                    </Text>
                  </View>
                  <View style={[styles.meterTrack, { backgroundColor: colors.border }]}>
                    <View
                      style={[
                        styles.meterFill,
                        {
                          width: `${getMeterPercent(gradeResult.aggression, 'aggression')}%`,
                          backgroundColor: getMeterColor(gradeResult.aggression, 'aggression'),
                        },
                      ]}
                    />
                  </View>
                </View>

                {/* Meter 2: Clarity */}
                <View style={styles.meterRow}>
                  <View style={styles.meterHeader}>
                    <Text style={[styles.meterLabel, { color: colors.foreground }]}>Clarity</Text>
                    <Text
                      style={[
                        styles.meterValue,
                        { color: getMeterColor(gradeResult.clarity, 'positive') },
                      ]}
                    >
                      {gradeResult.clarity === 'high' ? 'High' : gradeResult.clarity === 'medium' ? 'Medium' : 'Low'}
                    </Text>
                  </View>
                  <View style={[styles.meterTrack, { backgroundColor: colors.border }]}>
                    <View
                      style={[
                        styles.meterFill,
                        {
                          width: `${getMeterPercent(gradeResult.clarity, 'positive')}%`,
                          backgroundColor: getMeterColor(gradeResult.clarity, 'positive'),
                        },
                      ]}
                    />
                  </View>
                </View>

                {/* Meter 3: Solution Focus */}
                <View style={styles.meterRow}>
                  <View style={styles.meterHeader}>
                    <Text style={[styles.meterLabel, { color: colors.foreground }]}>Solution Focus</Text>
                    <Text
                      style={[
                        styles.meterValue,
                        { color: getMeterColor(gradeResult.solution_focus, 'positive') },
                      ]}
                    >
                      {gradeResult.solution_focus === 'high' ? 'High' : gradeResult.solution_focus === 'medium' ? 'Medium' : 'Low'}
                    </Text>
                  </View>
                  <View style={[styles.meterTrack, { backgroundColor: colors.border }]}>
                    <View
                      style={[
                        styles.meterFill,
                        {
                          width: `${getMeterPercent(gradeResult.solution_focus, 'positive')}%`,
                          backgroundColor: getMeterColor(gradeResult.solution_focus, 'positive'),
                        },
                      ]}
                    />
                  </View>
                </View>
              </View>

              <View style={[styles.divider, { backgroundColor: colors.border }]} />

              {/* Guidance */}
              <View style={styles.guidanceBox}>
                <Text style={[styles.guidanceTitle, { color: colors.foreground }]}>Nova's CBT Guidance</Text>
                <Text style={[styles.guidanceText, { color: colors.mutedForeground }]}>
                  {gradeResult.guidance}
                </Text>
              </View>

              {/* Better Reframed suggestion */}
              <View style={[styles.suggestionBox, { backgroundColor: colors.sage + '12', borderColor: colors.sage + '40' }]}>
                <View style={styles.suggestionHeader}>
                  <Feather name="shield" size={16} color={colors.sage} />
                  <Text style={[styles.suggestionTitleText, { color: colors.sage }]}>
                    Suggested Alternative
                  </Text>
                </View>
                <Text style={[styles.suggestionText, { color: colors.foreground }]}>
                  "{gradeResult.improved_suggestion}"
                </Text>
                <Pressable
                  style={styles.suggestionDraftBtn}
                  onPress={() => {
                    setInput(gradeResult.improved_suggestion);
                    setGradeResult(null);
                  }}
                >
                  <Feather name="edit-3" size={14} color={colors.primary} />
                  <Text style={[styles.suggestionDraftText, { color: colors.primary }]}>
                    Apply as Draft
                  </Text>
                </Pressable>
              </View>
            </View>

            {/* Actions */}
            <View style={styles.resultsActions}>
              <Pressable
                style={[styles.btn, { backgroundColor: colors.sage }]}
                onPress={handleSave}
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator color={colors.sageForeground} />
                ) : (
                  <View style={styles.btnRow}>
                    <Feather name="check-circle" size={18} color={colors.sageForeground} />
                    <Text style={[styles.btnText, { color: colors.sageForeground }]}>
                      Store Reframe in Memory Core
                    </Text>
                  </View>
                )}
              </Pressable>

              <Pressable style={[styles.btn, { backgroundColor: colors.muted }]} onPress={resetGame}>
                <Text style={[styles.btnText, { color: colors.foreground }]}>Cancel & Practice Again</Text>
              </Pressable>
            </View>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  closeBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'flex-start' },
  title: { fontSize: 24, fontFamily: 'Inter_700Bold' },
  card: { borderRadius: 24, borderWidth: 1, padding: 20, marginBottom: 24 },
  selectorRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  arrowBtn: { padding: 8 },
  scenarioTitle: { fontSize: 18, fontFamily: 'Inter_700Bold', flex: 1, textAlign: 'center' },
  scenarioBody: { fontSize: 16, fontFamily: 'Inter_400Regular', lineHeight: 23, marginBottom: 16 },
  divider: { height: 1, marginVertical: 16 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 },
  reactiveLabel: { fontSize: 13, fontFamily: 'Inter_700Bold', textTransform: 'uppercase' },
  reactiveBody: { fontSize: 15, fontFamily: 'Inter_500Medium', fontStyle: 'italic', lineHeight: 21, marginBottom: 16 },
  clinicalTipBox: { padding: 14, borderRadius: 20 },
  clinicalTipText: { fontSize: 14, fontFamily: 'Inter_500Medium', lineHeight: 20 },
  inputArea: { gap: 12 },
  sectionTitle: { fontSize: 18, fontFamily: 'Inter_700Bold' },
  sectionSubtitle: { fontSize: 14, fontFamily: 'Inter_400Regular', lineHeight: 20, marginBottom: 4 },
  textInput: {
    minHeight: 120,
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
    textAlignVertical: 'top',
  },
  btn: { height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center' },
  btnRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  btnText: { fontSize: 16, fontFamily: 'Inter_600SemiBold' },
  rewardTitle: { fontSize: 24, fontFamily: 'Inter_700Bold', textAlign: 'center', marginBottom: 8 },
  rewardBody: { fontSize: 16, fontFamily: 'Inter_400Regular', textAlign: 'center', lineHeight: 23 },
  resultsArea: { flex: 1 },
  resultsHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  badge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  badgeText: { fontSize: 12, fontFamily: 'Inter_600SemiBold' },
  retryBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  retryText: { fontSize: 14, fontFamily: 'Inter_600SemiBold' },
  gradeScenarioTitle: { fontSize: 19, fontFamily: 'Inter_700Bold', marginBottom: 20 },
  metersContainer: { gap: 16 },
  meterRow: { gap: 8 },
  meterHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  meterLabel: { fontSize: 14, fontFamily: 'Inter_600SemiBold' },
  meterValue: { fontSize: 13, fontFamily: 'Inter_700Bold' },
  meterTrack: { height: 8, borderRadius: 4, overflow: 'hidden' },
  meterFill: { height: '100%', borderRadius: 4 },
  guidanceBox: { gap: 6, marginBottom: 16 },
  guidanceTitle: { fontSize: 16, fontFamily: 'Inter_700Bold' },
  guidanceText: { fontSize: 14, fontFamily: 'Inter_400Regular', lineHeight: 20 },
  suggestionBox: { borderWidth: 1, borderRadius: 20, padding: 16, gap: 10, marginTop: 12 },
  suggestionHeader: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  suggestionTitleText: { fontSize: 14, fontFamily: 'Inter_700Bold' },
  suggestionText: { fontSize: 15, fontFamily: 'Inter_500Medium', lineHeight: 21, fontStyle: 'italic' },
  suggestionDraftBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start', marginTop: 4 },
  suggestionDraftText: { fontSize: 14, fontFamily: 'Inter_600SemiBold' },
  resultsActions: { gap: 12, marginTop: 24 },
});
