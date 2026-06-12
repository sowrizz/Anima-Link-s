import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, ActivityIndicator, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import * as Haptics from 'expo-haptics';
import { Feather } from '@expo/vector-icons';
import { useAnalyzeWorkspace } from '@workspace/api-client-react';
import { useColors } from '@/hooks/useColors';

const CATEGORY_ICONS: Record<string, keyof typeof Feather.glyphMap> = {
  study_tool: 'book-open',
  distraction: 'wifi-off',
  wellness: 'droplet',
  focus_tool: 'headphones',
  other: 'box',
};

const CATEGORY_LABELS: Record<string, string> = {
  study_tool: 'Focus Tool',
  distraction: 'Distraction Risk',
  wellness: 'Wellness Item',
  focus_tool: 'Focus Aid',
  other: 'Object',
};

export default function CameraMissionScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const analyzeWorkspace = useAnalyzeWorkspace();
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState('image/jpeg');

  const pickImage = async (fromCamera: boolean) => {
    try {
      const permission = fromCamera
        ? await ImagePicker.requestCameraPermissionsAsync()
        : await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permission.granted) {
        Alert.alert('Permission needed', fromCamera ? 'Camera permission is required.' : 'Gallery permission is required.');
        return;
      }

      const result = fromCamera
        ? await ImagePicker.launchCameraAsync({ mediaTypes: ['images'], quality: 0.55, base64: true })
        : await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.55, base64: true });

      if (!result.canceled && result.assets[0]) {
        setImageUri(result.assets[0].uri);
        setImageBase64(result.assets[0].base64 ?? null);
        setMimeType(result.assets[0].mimeType ?? 'image/jpeg');
        analyzeWorkspace.reset();
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    } catch {
      Alert.alert('Camera unavailable', 'Could not access camera or gallery on this device.');
    }
  };

  const handleAnalyze = async () => {
    if (!imageBase64) {
      Alert.alert('Image required', 'Take or choose a real workspace photo before running Gemini vision.');
      return;
    }
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    analyzeWorkspace.mutate({ data: { image_base64: imageBase64, mode: 'workspace', mime_type: mimeType } as any });
  };

  const data = analyzeWorkspace.data;
  const focusScore = data?.focus_score ?? 0;

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'distraction':
        return { bg: '#FFE8E8', text: '#D94F4F' };
      case 'study_tool':
        return { bg: '#EEF0FF', text: colors.primary };
      case 'wellness':
        return { bg: '#E8F5E8', text: colors.sage };
      case 'focus_tool':
        return { bg: '#E8F0FF', text: colors.dustyBlue };
      default:
        return { bg: colors.muted, text: colors.mutedForeground };
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 70) return colors.sage;
    if (score >= 50) return colors.accent;
    return '#D94F4F';
  };

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: { paddingTop: insets.top + 12, paddingHorizontal: 20, paddingBottom: 16, flexDirection: 'row', alignItems: 'center', gap: 12 },
    closeBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.muted, alignItems: 'center', justifyContent: 'center' },
    title: { fontFamily: 'Inter_700Bold', fontSize: 20, color: colors.foreground },
    subtitle: { fontFamily: 'Inter_400Regular', fontSize: 14, color: colors.mutedForeground },
    content: { padding: 20, paddingBottom: insets.bottom + 32, gap: 16 },
    imageSection: { gap: 12 },
    imagePreview: { width: '100%', height: 220, borderRadius: 8, backgroundColor: colors.muted },
    imagePlaceholder: { width: '100%', height: 220, borderRadius: 8, backgroundColor: colors.muted, borderWidth: 2, borderStyle: 'dashed', borderColor: colors.border, alignItems: 'center', justifyContent: 'center', gap: 8 },
    placeholderText: { fontFamily: 'Inter_400Regular', fontSize: 14, color: colors.mutedForeground },
    buttonRow: { flexDirection: 'row', gap: 10 },
    btn: { flex: 1, minHeight: 48, paddingHorizontal: 10, borderRadius: 8, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 6, backgroundColor: colors.muted, borderWidth: 1, borderColor: colors.border },
    btnText: { fontFamily: 'Inter_600SemiBold', fontSize: 14, color: colors.foreground },
    analyzeBtn: { backgroundColor: colors.primary, minHeight: 52, borderRadius: 8, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 8 },
    analyzeBtnText: { fontFamily: 'Inter_700Bold', fontSize: 16, color: colors.primaryForeground },
    analyzeBtnDisabled: { opacity: 0.5 },
    resultsSection: { gap: 12 },
    resultHeader: { fontFamily: 'Inter_700Bold', fontSize: 16, color: colors.foreground },
    scoreCard: { backgroundColor: colors.card, borderRadius: 8, padding: 16, borderWidth: 1, borderColor: colors.border, gap: 8 },
    scoreRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    scoreLabel: { fontFamily: 'Inter_500Medium', fontSize: 14, color: colors.mutedForeground },
    scoreValue: { fontFamily: 'Inter_700Bold', fontSize: 24 },
    scoreBar: { height: 8, backgroundColor: colors.muted, borderRadius: 4, overflow: 'hidden' },
    scoreBarFill: { height: '100%', borderRadius: 4 },
    sourceBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, backgroundColor: colors.muted, alignSelf: 'flex-start' },
    sourceText: { fontFamily: 'Inter_400Regular', fontSize: 11, color: colors.mutedForeground },
    objectGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    objectCard: { width: '48%', backgroundColor: colors.card, borderRadius: 8, padding: 12, gap: 6, borderWidth: 1, borderColor: colors.border },
    objectLabel: { fontFamily: 'Inter_600SemiBold', fontSize: 13, color: colors.foreground },
    objectGameLabel: { fontFamily: 'Inter_400Regular', fontSize: 11, color: colors.primary },
    objectCategory: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8, alignSelf: 'flex-start', marginTop: 2 },
    objectCategoryText: { fontFamily: 'Inter_500Medium', fontSize: 10 },
    missionCard: { backgroundColor: colors.card, borderRadius: 8, padding: 16, borderWidth: 1, borderColor: colors.border, gap: 8 },
    missionLabel: { fontFamily: 'Inter_500Medium', fontSize: 12, color: colors.mutedForeground, textTransform: 'uppercase' },
    missionText: { fontFamily: 'Inter_600SemiBold', fontSize: 15, color: colors.foreground, lineHeight: 22 },
    startBtn: { backgroundColor: colors.sage, minHeight: 48, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
    startBtnText: { fontFamily: 'Inter_700Bold', fontSize: 14, color: colors.sageForeground },
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.closeBtn} onPress={() => router.back()}>
          <Feather name="x" size={18} color={colors.foreground} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>Camera Grounding</Text>
          <Text style={styles.subtitle}>Use your room to find one small next step</Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.imageSection}>
          {imageUri ? (
            <Image source={{ uri: imageUri }} style={styles.imagePreview} resizeMode="cover" />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Feather name="camera" size={32} color={colors.mutedForeground} />
              <Text style={styles.placeholderText}>No image captured yet</Text>
            </View>
          )}
          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.btn} onPress={() => pickImage(true)}>
              <Feather name="camera" size={16} color={colors.foreground} />
              <Text style={styles.btnText}>Take Photo</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.btn} onPress={() => pickImage(false)}>
              <Feather name="image" size={16} color={colors.foreground} />
              <Text style={styles.btnText}>From Gallery</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            style={[styles.analyzeBtn, (!imageBase64 || analyzeWorkspace.isPending) && styles.analyzeBtnDisabled]}
            onPress={handleAnalyze}
            disabled={!imageBase64 || analyzeWorkspace.isPending}
          >
            {analyzeWorkspace.isPending ? <ActivityIndicator color={colors.primaryForeground} size="small" /> : <Feather name="search" size={16} color={colors.primaryForeground} />}
            <Text style={styles.analyzeBtnText}>{analyzeWorkspace.isPending ? 'Scanning...' : 'Analyze Workspace'}</Text>
          </TouchableOpacity>
        </View>

        {data && (
          <View style={styles.resultsSection}>
            <View style={styles.scoreCard}>
              <View style={styles.scoreRow}>
                <Text style={styles.scoreLabel}>Focus Score</Text>
                <Text style={[styles.scoreValue, { color: getScoreColor(focusScore) }]}>{focusScore}</Text>
              </View>
              <View style={styles.scoreBar}>
                <View style={[styles.scoreBarFill, { width: `${focusScore}%`, backgroundColor: getScoreColor(focusScore) }]} />
              </View>
              <View style={styles.sourceBadge}>
                <Feather name="cpu" size={10} color={colors.mutedForeground} />
                <Text style={styles.sourceText}>Gemini Vision</Text>
              </View>
            </View>

            <Text style={styles.resultHeader}>Objects Detected</Text>
            <View style={styles.objectGrid}>
              {(data.objects as Array<{ label: string; game_label: string; category: string; confidence: string }>).map((obj, idx) => {
                const catColor = getCategoryColor(obj.category);
                return (
                  <View key={`${obj.label}-${idx}`} style={styles.objectCard}>
                    <Feather name={CATEGORY_ICONS[obj.category] ?? 'box'} size={20} color={catColor.text} />
                    <Text style={styles.objectLabel}>{obj.game_label}</Text>
                    <Text style={styles.objectGameLabel}>{obj.label}</Text>
                    <View style={[styles.objectCategory, { backgroundColor: catColor.bg }]}>
                      <Text style={[styles.objectCategoryText, { color: catColor.text }]}>{CATEGORY_LABELS[obj.category] ?? obj.category}</Text>
                    </View>
                  </View>
                );
              })}
            </View>

            <View style={styles.missionCard}>
              <Text style={styles.missionLabel}>Suggested Mission</Text>
              <Text style={styles.missionText}>{data.suggested_mission}</Text>
              <TouchableOpacity style={styles.startBtn} onPress={() => router.push('/games/focus-boss')}>
                <Text style={styles.startBtnText}>Start Focus Session</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {analyzeWorkspace.isError && (
          <View style={[styles.missionCard, { borderColor: '#D94F4F' }]}>
            <Text style={[styles.missionText, { color: '#D94F4F' }]}>Scan failed</Text>
            <Text style={styles.objectGameLabel}>Check Gemini configuration and try a clearer image.</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
