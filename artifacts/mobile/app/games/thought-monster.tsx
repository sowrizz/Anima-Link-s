import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, Pressable, ScrollView, ActivityIndicator, KeyboardAvoidingView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';
import { HPBar } from '@/components/HPBar';
import { useStartThoughtMonster, useCompleteThoughtMonster } from '@workspace/api-client-react';

export default function ThoughtMonsterScreen() {
  const router = useRouter();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams();
  
  const initialMessage = Array.isArray(params.message) ? params.message[0] : params.message || '';
  const analysisId = Array.isArray(params.analysisId) ? params.analysisId[0] : params.analysisId;

  const [gameState, setGameState] = useState<any>(null);
  const [round, setRound] = useState(0);
  const [hp, setHp] = useState(100);
  const [input, setInput] = useState('');
  const [answers, setAnswers] = useState<string[]>([]);
  const [reward, setReward] = useState<any>(null);

  const startMutation = useStartThoughtMonster();
  const completeMutation = useCompleteThoughtMonster();

  useEffect(() => {
    startMutation.mutate(
      { data: { message: initialMessage, analysis_id: analysisId } },
      {
        onSuccess: (data) => {
          setGameState(data);
        }
      }
    );
  }, []);

  const handleNext = () => {
    if (!input.trim() && round < 3) return;

    if (round === 0) setHp(80);
    if (round === 1) setHp(55);
    if (round === 2) setHp(30);

    const newAnswers = [...answers, input];
    setAnswers(newAnswers);
    setInput('');
    setRound(round + 1);

    if (round === 3) {
      setHp(10);
    }
  };

  const handleComplete = async () => {
    if (!gameState) return;
    try {
      const res = await completeMutation.mutateAsync({
        data: {
          game_id: gameState.game_id,
          original_thought: initialMessage,
          final_reframe: input || gameState.safe_reframe,
          distortion: gameState.distortion
        }
      });
      setHp(0);
      setReward(res);
    } catch (e) {
      console.error(e);
    }
  };

  if (startMutation.isPending) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.mutedForeground }]}>Summoning the Thought Monster...</Text>
      </View>
    );
  }

  if (!gameState) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.foreground }}>Failed to load game.</Text>
        <Pressable onPress={() => router.back()} style={{ marginTop: 16 }}>
          <Text style={{ color: colors.primary }}>Go Back</Text>
        </Pressable>
      </View>
    );
  }

  if (reward) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background, padding: 24 }]}>
        <Feather name="award" size={64} color={colors.sage} style={{ marginBottom: 24 }} />
        <Text style={[styles.title, { color: colors.foreground, textAlign: 'center' }]}>Monster Defeated!</Text>
        <Text style={[styles.rewardText, { color: colors.sage, textAlign: 'center' }]}>{reward.reward}</Text>
        <Pressable 
          style={[styles.btn, { backgroundColor: colors.primary, marginTop: 32, width: '100%' }]}
          onPress={() => router.replace('/(tabs)/home')}
        >
          <Text style={[styles.btnText, { color: colors.primaryForeground }]}>Return Home</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView style={[styles.container, { backgroundColor: colors.background }]} behavior="padding">
      <ScrollView contentContainerStyle={{ paddingTop: insets.top + 24, paddingBottom: insets.bottom + 24, paddingHorizontal: 24 }}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Feather name="x" size={24} color={colors.foreground} />
          </Pressable>
          <Text style={[styles.title, { color: colors.foreground }]}>Battle</Text>
          <View style={styles.placeholder} />
        </View>

        <View style={[styles.monsterCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.monsterHeader}>
            <View>
              <Text style={[styles.monsterName, { color: colors.foreground }]}>{gameState.monster_name}</Text>
              <Text style={[styles.distortion, { color: colors.accent }]}>{gameState.distortion}</Text>
            </View>
            <View style={[styles.guideBadge, { backgroundColor: colors.primary + '22' }]}>
              <Text style={[styles.guideText, { color: colors.primary }]}>{gameState.guide} Guide</Text>
            </View>
          </View>
          
          <Text style={[styles.weakness, { color: colors.mutedForeground }]}>Weakness: {gameState.weakness}</Text>
          
          <View style={styles.hpContainer}>
            <Text style={[styles.hpText, { color: colors.foreground }]}>HP</Text>
            <View style={{ flex: 1 }}>
              <HPBar progress={hp} />
            </View>
            <Text style={[styles.hpNum, { color: colors.foreground }]}>{hp}/100</Text>
          </View>
        </View>

        <View style={styles.gameArea}>
          {round === 0 && (
            <View style={styles.questionBox}>
              <Text style={[styles.questionText, { color: colors.foreground }]}>{gameState.cbt_question_1}</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.card, color: colors.foreground, borderColor: colors.border }]}
                placeholder="Your response..."
                placeholderTextColor={colors.mutedForeground}
                value={input}
                onChangeText={setInput}
                multiline
              />
              <Pressable style={[styles.btn, { backgroundColor: colors.primary }]} onPress={handleNext}>
                <Text style={[styles.btnText, { color: colors.primaryForeground }]}>Attack</Text>
              </Pressable>
            </View>
          )}

          {round === 1 && (
            <View style={styles.questionBox}>
              <Text style={[styles.questionText, { color: colors.foreground }]}>{gameState.cbt_question_2}</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.card, color: colors.foreground, borderColor: colors.border }]}
                placeholder="Your response..."
                placeholderTextColor={colors.mutedForeground}
                value={input}
                onChangeText={setInput}
                multiline
              />
              <Pressable style={[styles.btn, { backgroundColor: colors.primary }]} onPress={handleNext}>
                <Text style={[styles.btnText, { color: colors.primaryForeground }]}>Attack</Text>
              </Pressable>
            </View>
          )}

          {round === 2 && (
            <View style={styles.questionBox}>
              <Text style={[styles.questionText, { color: colors.foreground }]}>{gameState.cbt_question_3}</Text>
              {gameState.memory_proof ? (
                <View style={[styles.proofCard, { backgroundColor: colors.sage + '22', borderColor: colors.sage }]}>
                  <Text style={[styles.proofTitle, { color: colors.sage }]}>Proof Found!</Text>
                  <Text style={[styles.proofText, { color: colors.foreground }]}>{gameState.memory_proof.reframe}</Text>
                </View>
              ) : null}
              <TextInput
                style={[styles.input, { backgroundColor: colors.card, color: colors.foreground, borderColor: colors.border }]}
                placeholder="Your response..."
                placeholderTextColor={colors.mutedForeground}
                value={input}
                onChangeText={setInput}
                multiline
              />
              <Pressable style={[styles.btn, { backgroundColor: colors.primary }]} onPress={handleNext}>
                <Text style={[styles.btnText, { color: colors.primaryForeground }]}>Critical Hit</Text>
              </Pressable>
            </View>
          )}

          {round === 3 && (
            <View style={styles.questionBox}>
              <Text style={[styles.questionText, { color: colors.foreground }]}>Final Reframe</Text>
              <Text style={[styles.subtitle, { color: colors.mutedForeground, marginBottom: 12 }]}>Edit this to make it yours:</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.card, color: colors.foreground, borderColor: colors.border }]}
                defaultValue={gameState.safe_reframe}
                onChangeText={setInput}
                multiline
              />
              <Pressable 
                style={[styles.btn, { backgroundColor: colors.sage }]} 
                onPress={handleComplete}
                disabled={completeMutation.isPending}
              >
                {completeMutation.isPending ? (
                  <ActivityIndicator color={colors.sageForeground} />
                ) : (
                  <Text style={[styles.btnText, { color: colors.sageForeground }]}>Finish Battle</Text>
                )}
              </Pressable>
            </View>
          )}
        </View>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  loadingText: { marginTop: 16, fontSize: 16, fontFamily: 'Inter_500Medium' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  backBtn: { width: 40, height: 40, justifyContent: 'center' },
  title: { fontSize: 24, fontFamily: 'Inter_700Bold' },
  placeholder: { width: 40 },
  monsterCard: { borderRadius: 16, borderWidth: 1, padding: 16, marginBottom: 24 },
  monsterHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  monsterName: { fontSize: 20, fontFamily: 'Inter_700Bold', marginBottom: 4 },
  distortion: { fontSize: 14, fontFamily: 'Inter_600SemiBold' },
  guideBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  guideText: { fontSize: 12, fontFamily: 'Inter_600SemiBold' },
  weakness: { fontSize: 14, fontFamily: 'Inter_400Regular', marginBottom: 16 },
  hpContainer: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  hpText: { fontSize: 14, fontFamily: 'Inter_700Bold' },
  hpNum: { fontSize: 12, fontFamily: 'Inter_600SemiBold', width: 48, textAlign: 'right' },
  gameArea: { flex: 1 },
  questionBox: { gap: 16 },
  questionText: { fontSize: 18, fontFamily: 'Inter_600SemiBold', lineHeight: 26 },
  subtitle: { fontSize: 14, fontFamily: 'Inter_400Regular' },
  input: { minHeight: 100, borderRadius: 12, borderWidth: 1, padding: 16, fontSize: 16, fontFamily: 'Inter_400Regular', textAlignVertical: 'top' },
  btn: { height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center' },
  btnText: { fontSize: 16, fontFamily: 'Inter_600SemiBold' },
  proofCard: { padding: 16, borderRadius: 12, borderWidth: 1, marginBottom: 8 },
  proofTitle: { fontSize: 14, fontFamily: 'Inter_700Bold', marginBottom: 4 },
  proofText: { fontSize: 15, fontFamily: 'Inter_500Medium', lineHeight: 22 },
  rewardText: { fontSize: 18, fontFamily: 'Inter_500Medium', marginTop: 16, lineHeight: 26 },
});
