import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TextInput, Pressable, FlatList, Keyboard, ActivityIndicator } from 'react-native';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';
import { useAppContext } from '@/app/context/AppContext';
import { useAnalyzeMessage, useSafetyCheck, MessageAnalysis } from '@workspace/api-client-react';
import { AnalysisCard } from '@/components/AnalysisCard';
import { useRouter } from 'expo-router';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  analysis?: MessageAnalysis;
}

const MODES = ['Vent', 'Calm', 'Challenge', 'Plan', 'Hype'];

export default function ChatScreen() {
  const router = useRouter();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { currentCharacter } = useAppContext();
  
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', text: `Hi, I'm ${currentCharacter}. How are you feeling right now?`, isUser: false }
  ]);
  const [input, setInput] = useState('');
  
  const analyzeMutation = useAnalyzeMessage();
  const safetyMutation = useSafetyCheck();

  const handleSend = async () => {
    if (!input.trim()) return;

    const userText = input.trim();
    setInput('');
    Keyboard.dismiss();

    const newMsgId = Date.now().toString();
    const newMsg: Message = { id: newMsgId, text: userText, isUser: true };
    
    setMessages(prev => [newMsg, ...prev]);

    try {
      // 1. Safety Check
      const safetyRes = await safetyMutation.mutateAsync({ data: { message: userText } });
      if (!safetyRes.safe) {
        setMessages(prev => [
          { id: Date.now().toString(), text: safetyRes.message, isUser: false },
          ...prev
        ]);
        if (safetyRes.risk_level === 'high') {
          router.push('/(tabs)/safety');
        }
        return;
      }

      // 2. Analyze
      const analysis = await analyzeMutation.mutateAsync({ data: { message: userText } });
      
      // Update the user message with analysis
      setMessages(prev => prev.map(m => m.id === newMsgId ? { ...m, analysis } : m));

      // 3. Assistant response
      setMessages(prev => [
        { id: Date.now().toString(), text: analysis.safe_response, isUser: false },
        ...prev
      ]);

    } catch (e) {
      console.error(e);
      setMessages(prev => [
        { id: Date.now().toString(), text: "I'm having trouble connecting right now. Can we try again?", isUser: false },
        ...prev
      ]);
    }
  };

  const handleAction = (action: string, analysis?: MessageAnalysis) => {
    switch (action) {
      case 'Battle Thought':
        router.push({
          pathname: '/games/thought-monster',
          params: { message: messages.find(m => m.analysis?.analysis_id === analysis?.analysis_id)?.text || '', analysisId: analysis?.analysis_id }
        });
        break;
      case 'Open Focus Boss':
        router.push('/games/focus-boss');
        break;
      case 'Recall Proof':
        router.push('/(tabs)/memory');
        break;
      case 'Switch Mode':
        router.push('/support-modes');
        break;
      default:
        break;
    }
  };

  const renderItem = ({ item }: { item: Message }) => {
    const isUser = item.isUser;
    
    return (
      <View style={[styles.messageWrapper, isUser ? styles.messageWrapperUser : styles.messageWrapperAssistant]}>
        <View style={[
          styles.bubble, 
          { backgroundColor: isUser ? colors.primary : colors.card, borderColor: isUser ? colors.primary : colors.border },
          isUser ? styles.bubbleUser : styles.bubbleAssistant
        ]}>
          <Text style={[styles.messageText, { color: isUser ? colors.primaryForeground : colors.foreground }]}>
            {item.text}
          </Text>
        </View>
        
        {item.analysis && (
          <View style={styles.analysisWrapper}>
            <AnalysisCard analysis={item.analysis} />
            {item.analysis.suggested_game && (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.actionsRow}>
                <Pressable 
                  style={[styles.actionBtn, { backgroundColor: colors.accent + '22' }]}
                  onPress={() => handleAction('Battle Thought', item.analysis)}
                >
                  <Text style={[styles.actionBtnText, { color: colors.accent }]}>Battle Thought</Text>
                </Pressable>
                <Pressable 
                  style={[styles.actionBtn, { backgroundColor: colors.sage + '22' }]}
                  onPress={() => handleAction('Open Focus Boss')}
                >
                  <Text style={[styles.actionBtnText, { color: colors.sage }]}>Focus Boss</Text>
                </Pressable>
              </ScrollView>
            )}
          </View>
        )}
      </View>
    );
  };

  return (
    <KeyboardAvoidingView style={[styles.container, { backgroundColor: colors.background }]} behavior="padding" keyboardVerticalOffset={0}>
      <View style={[styles.header, { paddingTop: insets.top, backgroundColor: colors.background, borderBottomColor: colors.border }]}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.modesScroll}>
          {MODES.map(mode => (
            <Pressable key={mode} style={[styles.modeChip, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.modeText, { color: colors.foreground }]}>{mode}</Text>
            </Pressable>
          ))}
          <Pressable 
            style={[styles.modeChip, { backgroundColor: colors.primary + '22', borderColor: 'transparent' }]}
            onPress={() => router.push('/support-modes')}
          >
            <Feather name="settings" size={14} color={colors.primary} />
          </Pressable>
        </ScrollView>
      </View>

      <FlatList
        data={messages}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        inverted
        contentContainerStyle={[styles.listContent, { paddingBottom: 24 }]}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="interactive"
      />

      <View style={[styles.inputContainer, { backgroundColor: colors.card, borderTopColor: colors.border, paddingBottom: Math.max(insets.bottom, 16) }]}>
        <Pressable style={styles.iconBtn}>
          <Feather name="mic" size={24} color={colors.mutedForeground} />
        </Pressable>
        <TextInput
          style={[styles.input, { color: colors.foreground, backgroundColor: colors.background }]}
          placeholder="Type a message..."
          placeholderTextColor={colors.mutedForeground}
          value={input}
          onChangeText={setInput}
          multiline
          maxLength={500}
        />
        <Pressable 
          style={[styles.sendBtn, { backgroundColor: input.trim() ? colors.primary : colors.muted }]}
          onPress={handleSend}
          disabled={!input.trim() || analyzeMutation.isPending || safetyMutation.isPending}
        >
          {analyzeMutation.isPending || safetyMutation.isPending ? (
             <ActivityIndicator size="small" color={colors.primaryForeground} />
          ) : (
             <Feather name="arrow-up" size={20} color={input.trim() ? colors.primaryForeground : colors.mutedForeground} />
          )}
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    borderBottomWidth: 1,
    paddingBottom: 12,
  },
  modesScroll: {
    paddingHorizontal: 16,
    gap: 8,
  },
  modeChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  modeText: {
    fontSize: 14,
    fontFamily: 'Inter_500Medium',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  messageWrapper: {
    marginBottom: 16,
    maxWidth: '85%',
  },
  messageWrapperUser: {
    alignSelf: 'flex-end',
  },
  messageWrapperAssistant: {
    alignSelf: 'flex-start',
  },
  bubble: {
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
  },
  bubbleUser: {
    borderBottomRightRadius: 4,
  },
  bubbleAssistant: {
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
    lineHeight: 24,
  },
  analysisWrapper: {
    marginTop: 8,
    width: '100%',
    minWidth: 280,
  },
  actionsRow: {
    marginTop: 8,
    flexDirection: 'row',
  },
  actionBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    marginRight: 8,
  },
  actionBtnText: {
    fontSize: 13,
    fontFamily: 'Inter_600SemiBold',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 16,
    borderTopWidth: 1,
    gap: 12,
  },
  iconBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  input: {
    flex: 1,
    minHeight: 48,
    maxHeight: 120,
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 14,
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
  },
  sendBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
