import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, Pressable, FlatList, Keyboard, ActivityIndicator, KeyboardAvoidingView, ScrollView, Platform, Image, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';
import { useAppContext } from '@/app/context/AppContext';
import { useAnalyzeMessage, useRouteCharacter, useSafetyCheck, useTranscribeVoice, useAnalyzeWorkspace, MessageAnalysis } from '@workspace/api-client-react';
import { AnalysisCard } from '@/components/AnalysisCard';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system/legacy';
import * as ImagePicker from 'expo-image-picker';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  imageUri?: string;
  analysis?: MessageAnalysis;
}

const MODES = ['Vent', 'Calm Me', 'Challenge Me', 'Plan With Me', 'Hype Me'];
const TAB_BAR_CLEARANCE = 88;

export default function ChatScreen() {
  const router = useRouter();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { currentCharacter, setCurrentCharacter, supportStyle, setSupportStyle, setLastAnalysis } = useAppContext();
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', text: `I'm here in ${supportStyle} mode. Tell me what is happening, and I will look for patterns, memory proof, and the next small action.`, isUser: false },
  ]);
  const [input, setInput] = useState('');

  // Attachments state
  const [attachedImageUri, setAttachedImageUri] = useState<string | null>(null);
  const [attachedImageBase64, setAttachedImageBase64] = useState<string | null>(null);
  const [attachedMimeType, setAttachedMimeType] = useState('image/jpeg');

  // Inline recording state
  const [isRecordingInline, setIsRecordingInline] = useState(false);
  const [recordingInline, setRecordingInline] = useState<Audio.Recording | null>(null);

  // Mutations
  const analyzeMutation = useAnalyzeMessage();
  const safetyMutation = useSafetyCheck();
  const routeCharacterMutation = useRouteCharacter();
  const transcribeMutation = useTranscribeVoice();
  const analyzeWorkspaceMutation = useAnalyzeWorkspace();

  // Search parameters auto routing
  const params = useLocalSearchParams<{ text?: string }>();
  const [processedText, setProcessedText] = useState('');

  useEffect(() => {
    if (params.text && params.text !== processedText) {
      setProcessedText(params.text);
      handleSend(params.text);
    }
  }, [params.text, processedText]);

  const modeStyleMap: Record<string, string> = {
    'Vent': 'Vent',
    'Calm Me': 'Ground',
    'Challenge Me': 'Challenge',
    'Plan With Me': 'Plan',
    'Hype Me': 'Hype',
  };

  const modeCharacterMap: Record<string, string> = {
    'Vent': 'Sera',
    'Calm Me': 'Kael',
    'Challenge Me': 'Nova',
    'Plan With Me': 'Arlo',
    'Hype Me': 'Arlo',
  };

  const handleModePress = (mode: string) => {
    const style = modeStyleMap[mode];
    const char = modeCharacterMap[mode];
    setSupportStyle(style);
    setCurrentCharacter(char);

    let introText = '';
    switch (mode) {
      case 'Vent':
        introText = `[Anima in Vent mode]: I'm listening. Speak or type freely to let it out. I won't judge or try to fix anything immediately. I will summarize patterns when you are done.`;
        break;
      case 'Calm Me':
        introText = `[Anima in Calm Me mode]: Take a deep breath. I'm here to ground you. If you want, you can use the Reset or Camera actions to stabilize your environment.`;
        break;
      case 'Challenge Me':
        introText = `[Anima in Challenge Me mode]: Let's examine any anxious or heavy thoughts. Type your thought here, and we can check the evidence together or launch a Thought Challenge.`;
        break;
      case 'Plan With Me':
        introText = `[Anima in Plan With Me mode]: Let's take action. Tell me what goal you want to tackle, and we will break it down into a bite-sized battle plan.`;
        break;
      case 'Hype Me':
        introText = `[Anima in Hype Me mode]: You've got this! Let's log a Tiny Win or remind ourselves of the progress proof we've built so far.`;
        break;
    }
    setMessages((prev) => [{ id: `intro-${Date.now()}`, text: introText, isUser: false }, ...prev]);
  };

  const handleSend = async (overrideText?: string) => {
    const userText = (overrideText ?? input).trim();
    const hasImage = !!attachedImageBase64;
    
    if (!userText && !hasImage) return;

    setInput('');
    const imageUriToSend = attachedImageUri;
    const imageBase64ToSend = attachedImageBase64;
    const mimeTypeToSend = attachedMimeType;

    // Clear attachments
    setAttachedImageUri(null);
    setAttachedImageBase64(null);
    Keyboard.dismiss();

    const newMsgId = Date.now().toString();
    setMessages((prev) => [{
      id: newMsgId,
      text: userText || "Analyzing workspace image...",
      isUser: true,
      imageUri: imageUriToSend || undefined
    }, ...prev]);

    try {
      if (hasImage && imageBase64ToSend) {
        // Workspace Analysis inline
        const analysisRes = await analyzeWorkspaceMutation.mutateAsync({
          data: {
            image_base64: imageBase64ToSend,
            mode: 'workspace',
            mime_type: mimeTypeToSend,
          } as any
        });
        
        const objectsText = analysisRes.objects.map(o => `• ${o.label} (mapped to: ${o.game_label})`).join('\n');
        const reply = `I scanned your workspace and found these objects:\n${objectsText}\n\nWorkspace State: ${analysisRes.workspace_state}\nFocus Score: ${analysisRes.focus_score}/100\nSuggested grounding mission: ${analysisRes.suggested_mission}`;
        
        setMessages((prev) => [{ id: `${Date.now()}-reply`, text: reply, isUser: false }, ...prev]);
      } else {
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
      }
    } catch {
      setMessages((prev) => [
        { id: `${Date.now()}-error`, text: "I cannot reach the analysis service right now. You can still use reset, focus, or memory from the action buttons.", isUser: false },
        ...prev,
      ]);
    }
  };

  const handleMicPress = async () => {
    if (isRecordingInline) {
      setIsRecordingInline(false);
      if (!recordingInline) return;
      try {
        await recordingInline.stopAndUnloadAsync();
        const uri = recordingInline.getURI();
        setRecordingInline(null);
        if (uri) {
          const base64Data = await FileSystem.readAsStringAsync(uri, {
            encoding: FileSystem.EncodingType.Base64,
          });
          const transRes = await transcribeMutation.mutateAsync({
            data: { audio_base64: base64Data } as any
          });
          if (transRes.transcript) {
            handleSend(transRes.transcript);
          }
        }
      } catch (err) {
        console.error('Failed to transcribe inline recording', err);
      }
    } else {
      try {
        const permission = await Audio.requestPermissionsAsync();
        if (!permission.granted) {
          Alert.alert('Permission needed', 'Microphone permission is required to record voice reflections.');
          return;
        }
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: true,
          playsInSilentModeIOS: true,
        });
        const { recording: newRecording } = await Audio.Recording.createAsync(
          Audio.RecordingOptionsPresets.HIGH_QUALITY
        );
        setRecordingInline(newRecording);
        setIsRecordingInline(true);
      } catch (err) {
        console.error('Failed to start inline recording', err);
      }
    }
  };

  const handleCameraPress = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Permission needed', 'Gallery permission is required to attach images.');
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        quality: 0.5,
        base64: true,
      });
      if (!result.canceled && result.assets[0]) {
        setAttachedImageUri(result.assets[0].uri);
        setAttachedImageBase64(result.assets[0].base64 ?? null);
        setAttachedMimeType(result.assets[0].mimeType ?? 'image/jpeg');
      }
    } catch (err) {
      console.error('Failed to pick image', err);
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
          {item.imageUri ? (
            <Image source={{ uri: item.imageUri }} style={styles.bubbleImage} resizeMode="cover" />
          ) : null}
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
          {MODES.map((mode) => {
            const styleName = modeStyleMap[mode];
            const isActive = supportStyle === styleName;
            return (
              <Pressable
                key={mode}
                style={[
                  styles.modeChip,
                  {
                    backgroundColor: isActive ? colors.lavender + '28' : colors.card,
                    borderColor: isActive ? colors.lavender : colors.border,
                  }
                ]}
                onPress={() => handleModePress(mode)}
              >
                <Text style={[styles.modeText, { color: colors.foreground }]}>{mode}</Text>
              </Pressable>
            );
          })}
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

      {attachedImageUri ? (
        <View style={[styles.previewContainer, { backgroundColor: colors.card, borderTopColor: colors.border }]}>
          <Image source={{ uri: attachedImageUri }} style={styles.previewThumbnail} />
          <Pressable style={styles.previewClose} onPress={() => { setAttachedImageUri(null); setAttachedImageBase64(null); }}>
            <Feather name="x" size={14} color="#fff" />
          </Pressable>
        </View>
      ) : null}

      <View
        style={[
          styles.inputContainer,
          {
            backgroundColor: colors.card,
            borderTopColor: colors.border,
            marginBottom: TAB_BAR_CLEARANCE,
            paddingBottom: Math.max(insets.bottom, 12),
          },
        ]}
      >
        <Pressable 
          style={[styles.iconBtn, isRecordingInline && { backgroundColor: colors.destructive + '1a', borderRadius: 20 }]} 
          onPress={handleMicPress}
        >
          <Feather name="mic" size={22} color={isRecordingInline ? colors.destructive : colors.mutedForeground} style={isRecordingInline && styles.pulseIcon} />
        </Pressable>
        <TextInput
          style={[styles.input, { color: colors.foreground, backgroundColor: colors.background, borderColor: colors.border }]}
          placeholder={isRecordingInline ? "Recording voice reflection..." : "Type message..."}
          placeholderTextColor={colors.mutedForeground}
          value={input}
          onChangeText={setInput}
          multiline
          maxLength={500}
          editable={!isRecordingInline}
        />
        <Pressable style={styles.iconBtn} onPress={handleCameraPress}>
          <Feather name="camera" size={22} color={colors.mutedForeground} />
        </Pressable>
        <Pressable 
          style={[
            styles.sendBtn, 
            { backgroundColor: (input.trim() || attachedImageBase64) ? colors.primary : colors.muted }
          ]} 
          onPress={() => handleSend()} 
          disabled={(!input.trim() && !attachedImageBase64) || busy}
        >
          {busy ? (
            <ActivityIndicator size="small" color={colors.primaryForeground} />
          ) : (
            <Feather 
              name="arrow-up" 
              size={20} 
              color={(input.trim() || attachedImageBase64) ? colors.primaryForeground : colors.mutedForeground} 
            />
          )}
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
  bubbleImage: { width: 220, height: 160, borderRadius: 8, marginBottom: 8 },
  messageText: { fontSize: 15, fontFamily: 'Inter_400Regular', lineHeight: 23 },
  analysisWrapper: { marginTop: 8, width: '100%', minWidth: 320 },
  actionsRow: { gap: 8, paddingRight: 16 },
  actionBtn: { paddingHorizontal: 12, paddingVertical: 9, borderRadius: 999, flexDirection: 'row', alignItems: 'center', gap: 6 },
  actionBtnText: { fontSize: 13, fontFamily: 'Inter_700Bold' },
  previewContainer: { paddingHorizontal: 16, paddingVertical: 8, flexDirection: 'row', alignItems: 'center', borderTopWidth: 1 },
  previewThumbnail: { width: 60, height: 60, borderRadius: 8, borderWidth: 1, borderColor: '#e3ddd4' },
  previewClose: { position: 'absolute', top: 4, left: 68, backgroundColor: 'rgba(0,0,0,0.6)', width: 20, height: 20, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  pulseIcon: { transform: [{ scale: 1.15 }] },
  inputContainer: { flexDirection: 'row', alignItems: 'flex-end', padding: 12, borderTopWidth: 1, gap: 8 },
  iconBtn: { width: 40, height: 46, alignItems: 'center', justifyContent: 'center' },
  input: { flex: 1, minHeight: 46, maxHeight: 118, borderRadius: 8, borderWidth: 1, paddingHorizontal: 14, paddingTop: 12, paddingBottom: 12, fontSize: 15, fontFamily: 'Inter_400Regular' },
  sendBtn: { width: 46, height: 46, borderRadius: 23, alignItems: 'center', justifyContent: 'center' },
});
