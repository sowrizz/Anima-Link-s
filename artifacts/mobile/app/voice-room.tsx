import React, { useMemo, useRef, useState } from 'react';
import { View, Text, StyleSheet, Pressable, Platform, TextInput, ActivityIndicator, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';
import { useRouteVoiceSpell, useTranscribeVoice } from '@workspace/api-client-react';

type SpeechRecognitionLike = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  onresult: ((event: { results: ArrayLike<{ 0: { transcript: string }; isFinal?: boolean }> }) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
};

declare global {
  interface Window {
    SpeechRecognition?: new () => SpeechRecognitionLike;
    webkitSpeechRecognition?: new () => SpeechRecognitionLike;
  }
}

export default function VoiceRoomScreen() {
  const router = useRouter();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const spokenTextRef = useRef('');

  const [isRecording, setIsRecording] = useState(false);
  const [fallbackText, setFallbackText] = useState('');
  const [transcript, setTranscript] = useState('');
  const [routeResult, setRouteResult] = useState<any>(null);
  const [error, setError] = useState('');

  const transcribeMutation = useTranscribeVoice();
  const routeMutation = useRouteVoiceSpell();

  const speechSupported = useMemo(() => {
    if (Platform.OS !== 'web' || typeof window === 'undefined') return false;
    return Boolean(window.SpeechRecognition || window.webkitSpeechRecognition);
  }, []);

  const processTranscript = async (text: string) => {
    if (!text.trim()) return;
    setError('');
    try {
      const transRes = await transcribeMutation.mutateAsync({ data: { typed_fallback: text.trim() } });
      setTranscript(transRes.transcript);
      const rRes = await routeMutation.mutateAsync({ data: { transcript: transRes.transcript } });
      setRouteResult(rRes);
    } catch {
      setError('Could not route this transcript. Check Gemini configuration and try again.');
    }
  };

  const toggleSpeechRecognition = () => {
    if (!speechSupported) {
      processTranscript(fallbackText);
      return;
    }

    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
      return;
    }

    const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!Recognition) return;

    const recognition = new Recognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    recognition.onresult = (event) => {
      const text = Array.from(event.results)
        .map((result) => result[0]?.transcript ?? '')
        .join(' ')
        .trim();
      spokenTextRef.current = text;
      setFallbackText(text);
    };
    recognition.onerror = () => {
      setIsRecording(false);
      setError('Speech recognition could not hear that clearly. You can type it below.');
    };
    recognition.onend = () => {
      setIsRecording(false);
      const finalText = spokenTextRef.current.trim();
      if (finalText) processTranscript(finalText);
    };

    recognitionRef.current = recognition;
    setTranscript('');
    setRouteResult(null);
    setError('');
    spokenTextRef.current = '';
    setIsRecording(true);
    recognition.start();
  };

  const handleExecuteAction = () => {
    if (!routeResult) return;
    const params = routeResult.params ?? {};
    switch (routeResult.route) {
      case 'thought_monster':
        router.replace({ pathname: '/games/thought-monster', params: { message: params.message ?? params.transcript ?? transcript } });
        break;
      case 'focus_boss':
        router.replace('/games/focus-boss');
        break;
      case 'camera_mission':
        router.replace('/games/camera-mission');
        break;
      case 'memory':
        router.replace('/(tabs)/memory');
        break;
      case 'support_modes':
        router.replace('/support-modes');
        break;
      case 'report':
        router.replace('/report');
        break;
      case 'safety':
        router.replace('/(tabs)/safety');
        break;
      case 'tiny_win':
        router.replace('/games/tiny-win');
        break;
      default:
        router.replace('/(tabs)/chat');
    }
  };

  const busy = transcribeMutation.isPending || routeMutation.isPending;

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: insets.top + 12, paddingHorizontal: 24, marginBottom: 12 },
    backBtn: { width: 40, height: 40, justifyContent: 'center' },
    title: { fontSize: 24, fontFamily: 'Inter_700Bold', color: colors.foreground },
    placeholder: { width: 40 },
    content: { padding: 24, paddingBottom: insets.bottom + 48, gap: 24 },
    waveCard: { width: '100%', borderRadius: 8, borderWidth: 1, padding: 24, alignItems: 'center', backgroundColor: colors.card, borderColor: colors.border },
    waveRows: { height: 128, flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 20 },
    waveBar: { width: 18, borderRadius: 9 },
    waveTitle: { fontSize: 24, fontFamily: 'Inter_700Bold', marginBottom: 8, color: colors.foreground },
    waveSubtitle: { fontSize: 14, fontFamily: 'Inter_400Regular', lineHeight: 20, textAlign: 'center', color: colors.mutedForeground },
    instruction: { fontSize: 16, fontFamily: 'Inter_500Medium', textAlign: 'center', color: colors.mutedForeground },
    input: { width: '100%', minHeight: 110, borderRadius: 8, borderWidth: 1, padding: 16, fontSize: 16, fontFamily: 'Inter_400Regular', backgroundColor: colors.card, borderColor: colors.border, color: colors.foreground, textAlignVertical: 'top' },
    recordBtn: { width: 80, height: 80, borderRadius: 40, alignItems: 'center', justifyContent: 'center', alignSelf: 'center', backgroundColor: isRecording ? colors.destructive : colors.primary },
    transcriptCard: { padding: 20, borderRadius: 8, borderWidth: 1, backgroundColor: colors.card, borderColor: colors.border, gap: 8 },
    transcriptLabel: { fontSize: 14, fontFamily: 'Inter_600SemiBold', color: colors.mutedForeground },
    transcriptText: { fontSize: 18, fontFamily: 'Inter_400Regular', lineHeight: 28, fontStyle: 'italic', color: colors.foreground },
    actionCard: { padding: 24, borderRadius: 8, borderWidth: 1, backgroundColor: colors.primary + '11', borderColor: colors.primary + '33' },
    actionTitle: { fontSize: 18, fontFamily: 'Inter_600SemiBold', marginBottom: 8, color: colors.foreground },
    actionDesc: { fontSize: 15, fontFamily: 'Inter_400Regular', lineHeight: 22, marginBottom: 24, color: colors.mutedForeground },
    executeBtn: { height: 50, borderRadius: 8, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.primary },
    executeBtnText: { fontSize: 16, fontFamily: 'Inter_600SemiBold', color: colors.primaryForeground },
    errorText: { fontSize: 14, fontFamily: 'Inter_500Medium', color: colors.destructive, textAlign: 'center' },
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="x" size={24} color={colors.foreground} />
        </Pressable>
        <Text style={styles.title}>Voice Room</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.content}>
        <View style={styles.waveCard}>
          <View style={styles.waveRows}>
            {[38, 72, 112, 72, 38].map((height, index) => (
              <View
                key={index}
                style={[
                  styles.waveBar,
                  {
                    height,
                    backgroundColor: isRecording ? colors.destructive : colors.primary,
                    opacity: isRecording ? 0.9 - index * 0.08 : 0.34 + index * 0.08,
                  },
                ]}
              />
            ))}
          </View>
          <Text style={styles.waveTitle}>Talk It Out</Text>
          <Text style={styles.waveSubtitle}>
            {speechSupported ? 'Use browser speech recognition, then Gemini routes the transcript.' : 'Speech recognition is not available in this runtime. Type the same words here to route them with Gemini.'}
          </Text>
        </View>

        <Text style={styles.instruction}>{speechSupported ? 'Tap the mic and speak' : 'Type what you want to say'}</Text>
        <TextInput
          style={styles.input}
          placeholder="Say or type: I need help focusing..."
          placeholderTextColor={colors.mutedForeground}
          value={fallbackText}
          onChangeText={setFallbackText}
          multiline
        />

        <Pressable style={styles.recordBtn} onPress={toggleSpeechRecognition} disabled={busy || (!speechSupported && !fallbackText.trim())}>
          {busy ? <ActivityIndicator color="#fff" /> : <Feather name={isRecording ? 'square' : speechSupported ? 'mic' : 'send'} size={30} color="#fff" />}
        </Pressable>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        {transcript ? (
          <View style={styles.transcriptCard}>
            <Text style={styles.transcriptLabel}>Transcript</Text>
            <Text style={styles.transcriptText}>"{transcript}"</Text>
          </View>
        ) : null}

        {routeResult ? (
          <View style={styles.actionCard}>
            <Feather name="compass" size={24} color={colors.primary} style={{ marginBottom: 12 }} />
            <Text style={styles.actionTitle}>Recommended Action</Text>
            <Text style={styles.actionDesc}>
              Recommended route: <Text style={{ color: colors.primary, fontFamily: 'Inter_600SemiBold' }}>{routeResult.action}</Text>
            </Text>
            <Pressable style={styles.executeBtn} onPress={handleExecuteAction}>
              <Text style={styles.executeBtnText}>Continue</Text>
            </Pressable>
          </View>
        ) : null}
      </ScrollView>
    </View>
  );
}
