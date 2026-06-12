import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Pressable, FlatList, Keyboard, ActivityIndicator, KeyboardAvoidingView, ScrollView, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';
import { useAppContext } from '@/app/context/AppContext';
import { useAnalyzeMessage, useRouteCharacter, useSafetyCheck, MessageAnalysis } from '@workspace/api-client-react';
import { AnalysisCard } from '@/components/AnalysisCard';
import { useRouter } from 'expo-router';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  analysis?: MessageAnalysis;
}

const MODES = ['Vent', 'Calm Me', 'Challenge Me', 'Plan With Me', 'Hype Me'];

export default function ChatScreen() {
  const router = useRouter();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { currentCharacter, supportStyle, setLastAnalysis } = useAppContext();
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', text: `I'm here in ${supportStyle} mode. Tell me what is happening, and I will look for patterns, memory proof, and the next small action.`, isUser: false },
  ]);
  const [input, setInput] = useState('');
  const analyzeMutation = useAnalyzeMessage();
  const safetyMutation = useSafetyCheck();
  const routeCharacterMutation = useRouteCharacter();

  const handleSend = async (overrideText?: string) => {
    const userText = (overrideText ?? input).trim();
    if (!userText) return;
    setInput('');
    Keyboard.dismiss();

    const newMsgId = Date.now().toString();
    setMessages((prev) => [{ id: newMsgId, text: userText, isUser: true }, ...prev]);

    try {
      const safetyRes = await safetyMutation.mutateAsync({ data: { message: userText } });
      if (!safetyRes.safe) {
        setMessages((prev) => [{ id: `${Date.now()}-safe`, text: safetyRes.message, isUser: false }, ...prev]);
        if (safetyRes.risk_level === 'high') router.push('/(tabs)/safety');
        return;
      }

      const analysis = await analyzeMutation.mutateAsync({ data: { message: userText } });
      setLastAnalysis(analysis);
      setMessages((prev) => prev.map((m) => (m.id === newMsgId ? { ...m, analysis } : m)));
      let reply = analysis.safe_response;
      try {
        const characterRoute = await routeCharacterMutation.mutateAsync({
          data: {
            analysis,
            memory_results: analysis.memory_results,
            user_preference: supportStyle,
          } as any,
        });
        reply = characterRoute.character_responses?.[0]?.message ?? analysis.safe_response;
      } catch {
        reply = analysis.safe_response;
      }
      setMessages((prev) => [{ id: `${Date.now()}-reply`, text: reply, isUser: false }, ...prev]);
    } catch {
      setMessages((prev) => [
        { id: `${Date.now()}-error`, text: "I cannot reach the analysis service right now. You can still use reset, focus, or memory from the action buttons.", isUser: false },
        ...prev,
      ]);
    }
  };

  const handleAction = (action: string, analysis?: MessageAnalysis) => {
    switch (action) {
      case 'Challenge':
        router.push({
          pathname: '/games/thought-monster',
          params: { message: messages.find((m) => m.analysis?.analysis_id === analysis?.analysis_id)?.text || '', analysisId: analysis?.analysis_id },
        });
        break;
      case 'Reset':
        router.push('/voice-room');
        break;
      case 'Focus':
        router.push('/games/focus-boss');
        break;
      case 'Recall':
        router.push('/(tabs)/memory');
        break;
      case 'Support':
        router.push('/support-modes');
        break;
    }
  };

  const renderItem = ({ item }: { item: Message }) => {
    const isUser = item.isUser;

    return (
      <View style={[styles.messageWrapper, isUser ? styles.messageWrapperUser : styles.messageWrapperAssistant]}>
        <View
          style={[
            styles.bubble,
            { backgroundColor: isUser ? colors.lavender + '38' : colors.card, borderColor: isUser ? colors.lavender : colors.border },
            isUser ? styles.bubbleUser : styles.bubbleAssistant,
          ]}
        >
          <Text style={[styles.messageText, { color: colors.foreground }]}>{item.text}</Text>
        </View>

        {item.analysis ? (
          <View style={styles.analysisWrapper}>
            <AnalysisCard analysis={item.analysis} />
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.actionsRow}>
              {[
                ['Challenge', 'edit-3', colors.primary],
                ['Reset', 'wind', colors.dustyBlue],
                ['Focus', 'clock', colors.sage],
                ['Recall', 'database', colors.accent],
                ['Support', 'users', colors.primary],
              ].map(([label, icon, tint]) => (
                <Pressable key={label as string} style={[styles.actionBtn, { backgroundColor: (tint as string) + '18' }]} onPress={() => handleAction(label as string, item.analysis)}>
                  <Feather name={icon as keyof typeof Feather.glyphMap} size={14} color={tint as string} />
                  <Text style={[styles.actionBtnText, { color: tint as string }]}>{label as string}</Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        ) : null}
      </View>
    );
  };

  const busy = analyzeMutation.isPending || safetyMutation.isPending || routeCharacterMutation.isPending;

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={0}
    >
      <View style={[styles.header, { paddingTop: insets.top + 14, backgroundColor: colors.background, borderBottomColor: colors.border }]}>
        <View style={styles.titleRow}>
          <View>
            <Text style={[styles.title, { color: colors.foreground }]}>Chat with Anima</Text>
            <Text style={[styles.modeLabel, { color: colors.mutedForeground }]}>Support mode: {supportStyle} · Guide: {currentCharacter}</Text>
          </View>
          <Pressable style={[styles.headerIcon, { backgroundColor: colors.card, borderColor: colors.border }]} onPress={() => router.push('/support-modes')}>
            <Feather name="sliders" size={18} color={colors.foreground} />
          </Pressable>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.modesScroll}>
          {MODES.map((mode) => (
            <Pressable key={mode} style={[styles.modeChip, { backgroundColor: colors.card, borderColor: colors.border }]} onPress={() => mode === 'Calm Me' ? router.push('/voice-room') : undefined}>
              <Text style={[styles.modeText, { color: colors.foreground }]}>{mode}</Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      <FlatList
        data={messages}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        inverted
        contentContainerStyle={styles.listContent}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="interactive"
      />

      <View style={[styles.inputContainer, { backgroundColor: colors.card, borderTopColor: colors.border, paddingBottom: Math.max(insets.bottom, 16) }]}>
        <Pressable style={styles.iconBtn} onPress={() => router.push('/voice-room')}>
          <Feather name="mic" size={22} color={colors.mutedForeground} />
        </Pressable>
        <TextInput
          style={[styles.input, { color: colors.foreground, backgroundColor: colors.background, borderColor: colors.border }]}
          placeholder="Type message..."
          placeholderTextColor={colors.mutedForeground}
          value={input}
          onChangeText={setInput}
          multiline
          maxLength={500}
        />
        <Pressable style={styles.iconBtn} onPress={() => router.push('/games/camera-mission')}>
          <Feather name="camera" size={22} color={colors.mutedForeground} />
        </Pressable>
        <Pressable style={[styles.sendBtn, { backgroundColor: input.trim() ? colors.primary : colors.muted }]} onPress={() => handleSend()} disabled={!input.trim() || busy}>
          {busy ? <ActivityIndicator size="small" color={colors.primaryForeground} /> : <Feather name="arrow-up" size={20} color={input.trim() ? colors.primaryForeground : colors.mutedForeground} />}
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { borderBottomWidth: 1, paddingBottom: 12 },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, marginBottom: 12 },
  title: { fontSize: 24, fontFamily: 'Inter_700Bold', lineHeight: 30 },
  modeLabel: { fontSize: 13, fontFamily: 'Inter_500Medium', marginTop: 4 },
  headerIcon: { width: 40, height: 40, borderRadius: 20, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  modesScroll: { paddingHorizontal: 16, gap: 8 },
  modeChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999, borderWidth: 1 },
  modeText: { fontSize: 13, fontFamily: 'Inter_600SemiBold' },
  listContent: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 24 },
  messageWrapper: { marginBottom: 16, maxWidth: '92%' },
  messageWrapperUser: { alignSelf: 'flex-end' },
  messageWrapperAssistant: { alignSelf: 'flex-start' },
  bubble: { padding: 15, borderRadius: 8, borderWidth: 1 },
  bubbleUser: { borderTopRightRadius: 2 },
  bubbleAssistant: { borderTopLeftRadius: 2 },
  messageText: { fontSize: 15, fontFamily: 'Inter_400Regular', lineHeight: 23 },
  analysisWrapper: { marginTop: 8, width: '100%', minWidth: 320 },
  actionsRow: { gap: 8, paddingRight: 16 },
  actionBtn: { paddingHorizontal: 12, paddingVertical: 9, borderRadius: 999, flexDirection: 'row', alignItems: 'center', gap: 6 },
  actionBtnText: { fontSize: 13, fontFamily: 'Inter_700Bold' },
  inputContainer: { flexDirection: 'row', alignItems: 'flex-end', padding: 12, borderTopWidth: 1, gap: 8 },
  iconBtn: { width: 40, height: 46, alignItems: 'center', justifyContent: 'center' },
  input: { flex: 1, minHeight: 46, maxHeight: 118, borderRadius: 8, borderWidth: 1, paddingHorizontal: 14, paddingTop: 12, paddingBottom: 12, fontSize: 15, fontFamily: 'Inter_400Regular' },
  sendBtn: { width: 46, height: 46, borderRadius: 23, alignItems: 'center', justifyContent: 'center' },
});
