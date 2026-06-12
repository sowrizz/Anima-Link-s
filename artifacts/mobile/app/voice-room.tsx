import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, Platform, TextInput, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';
import { MoodOrb } from '@/components/MoodOrb';
import { useTranscribeVoice, useRouteVoiceSpell } from '@workspace/api-client-react';

export default function VoiceRoomScreen() {
  const router = useRouter();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  
  const [isRecording, setIsRecording] = useState(false);
  const [fallbackText, setFallbackText] = useState('');
  const [transcript, setTranscript] = useState('');
  const [routeResult, setRouteResult] = useState<any>(null);

  const transcribeMutation = useTranscribeVoice();
  const routeMutation = useRouteVoiceSpell();

  const handleToggleRecord = async () => {
    if (Platform.OS === 'web') {
      if (!fallbackText.trim()) return;
      handleProcessVoice(undefined, fallbackText.trim());
    } else {
      // In a real app we'd use expo-av here
      // Mocking for now to avoid device-specific issues
      if (isRecording) {
        setIsRecording(false);
        handleProcessVoice(undefined, "I'm just really stressed about the exam tomorrow.");
      } else {
        setIsRecording(true);
      }
    }
  };

  const handleProcessVoice = async (base64?: string, typed?: string) => {
    try {
      const transRes = await transcribeMutation.mutateAsync({
        data: { audio_base64: base64, typed_fallback: typed }
      });
      setTranscript(transRes.transcript);

      const rRes = await routeMutation.mutateAsync({
        data: { transcript: transRes.transcript }
      });
      setRouteResult(rRes);
    } catch (e) {
      console.error(e);
    }
  };

  const handleExecuteAction = () => {
    if (!routeResult) return;
    if (routeResult.route === 'chat') {
      router.replace('/(tabs)/chat');
    } else if (routeResult.route === 'game') {
      if (routeResult.action === 'start_thought_monster') {
        router.replace('/games/thought-monster');
      } else {
        router.replace('/(tabs)/missions');
      }
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      <View style={[styles.header, { paddingHorizontal: 24 }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="x" size={24} color={colors.foreground} />
        </Pressable>
        <Text style={[styles.title, { color: colors.foreground }]}>Voice Room</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.content}>
        {!transcript ? (
          <View style={styles.recordArea}>
            <MoodOrb size={180} color={isRecording ? colors.destructive : colors.primary} pulsing={isRecording} />
            
            <Text style={[styles.instruction, { color: colors.mutedForeground, marginTop: 48 }]}>
              {Platform.OS === 'web' ? 'Type what you want to say (Web Fallback)' : 'Tap to start speaking'}
            </Text>

            {Platform.OS === 'web' && (
              <TextInput
                style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.foreground }]}
                placeholder="Type here..."
                placeholderTextColor={colors.mutedForeground}
                value={fallbackText}
                onChangeText={setFallbackText}
                multiline
              />
            )}

            <Pressable 
              style={[styles.recordBtn, { backgroundColor: isRecording ? colors.destructive : colors.primary }]}
              onPress={handleToggleRecord}
              disabled={transcribeMutation.isPending || routeMutation.isPending}
            >
              {transcribeMutation.isPending || routeMutation.isPending ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Feather name={isRecording ? "square" : "mic"} size={32} color="#fff" />
              )}
            </Pressable>
          </View>
        ) : (
          <View style={styles.resultArea}>
            <View style={[styles.transcriptCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.transcriptLabel, { color: colors.mutedForeground }]}>You said:</Text>
              <Text style={[styles.transcriptText, { color: colors.foreground }]}>"{transcript}"</Text>
            </View>

            {routeResult && (
              <View style={[styles.actionCard, { backgroundColor: colors.primary + '11', borderColor: colors.primary + '33' }]}>
                <Feather name="compass" size={24} color={colors.primary} style={{ marginBottom: 12 }} />
                <Text style={[styles.actionTitle, { color: colors.foreground }]}>Recommended Action</Text>
                <Text style={[styles.actionDesc, { color: colors.mutedForeground }]}>
                  Based on your voice tone, we recommend: <Text style={{ color: colors.primary, fontFamily: 'Inter_600SemiBold' }}>{routeResult.action}</Text>
                </Text>
                
                <Pressable style={[styles.executeBtn, { backgroundColor: colors.primary }]} onPress={handleExecuteAction}>
                  <Text style={[styles.executeBtnText, { color: colors.primaryForeground }]}>Continue</Text>
                </Pressable>
              </View>
            )}
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  backBtn: { width: 40, height: 40, justifyContent: 'center' },
  title: { fontSize: 24, fontFamily: 'Inter_700Bold' },
  placeholder: { width: 40 },
  content: { flex: 1, paddingHorizontal: 24 },
  recordArea: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingBottom: 60 },
  instruction: { fontSize: 16, fontFamily: 'Inter_500Medium', marginBottom: 24, textAlign: 'center' },
  input: { width: '100%', minHeight: 100, borderRadius: 16, borderWidth: 1, padding: 16, marginBottom: 24, fontSize: 16, fontFamily: 'Inter_400Regular' },
  recordBtn: { width: 80, height: 80, borderRadius: 40, alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 8 },
  resultArea: { flex: 1, paddingTop: 24 },
  transcriptCard: { padding: 20, borderRadius: 16, borderWidth: 1, marginBottom: 24 },
  transcriptLabel: { fontSize: 14, fontFamily: 'Inter_600SemiBold', marginBottom: 8 },
  transcriptText: { fontSize: 18, fontFamily: 'Inter_400Regular', lineHeight: 28, fontStyle: 'italic' },
  actionCard: { padding: 24, borderRadius: 16, borderWidth: 1 },
  actionTitle: { fontSize: 18, fontFamily: 'Inter_600SemiBold', marginBottom: 8 },
  actionDesc: { fontSize: 15, fontFamily: 'Inter_400Regular', lineHeight: 22, marginBottom: 24 },
  executeBtn: { height: 50, borderRadius: 25, alignItems: 'center', justifyContent: 'center' },
  executeBtnText: { fontSize: 16, fontFamily: 'Inter_600SemiBold' },
});
