import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { useAnalyzeWorkspace } from '@workspace/api-client-react';
import { useColors } from '@/hooks/useColors';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

const CATEGORY_ICONS: Record<string, string> = {
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

const matureObjectLabel = (label: string) =>
  label
    .replace(/Distraction Goblin/gi, 'Distraction')
    .replace(/Focus Portal/gi, 'Focus object')
    .replace(/Health Potion/gi, 'Grounding object')
    .replace(/Boss Gate/gi, 'Task anchor');

export default function CameraMissionScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const analyzeWorkspace = useAnalyzeWorkspace();

  const pickImage = async (fromCamera: boolean) => {
    if (Platform.OS === 'web') {
      Alert.alert('Camera', 'Camera and gallery features are available on mobile devices.');
      return;
    }
    try {
      let result: ImagePicker.ImagePickerResult;
      if (fromCamera) {
        const perm = await ImagePicker.requestCameraPermissionsAsync();
        if (!perm.granted) {
          Alert.alert('Permission needed', 'Camera permission is required for workspace scanning.');
          return;
        }
        result = await ImagePicker.launchCameraAsync({
          mediaTypes: ['images'],
          quality: 0.5,
          base64: true,
        });
      } else {
        const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!perm.granted) {
          Alert.alert('Permission needed', 'Gallery access is required.');
          return;
        }
        result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ['images'],
          quality: 0.5,
          base64: true,
        });
      }
      if (!result.canceled && result.assets[0]) {
        setImageUri(result.assets[0].uri);
        setImageBase64(result.assets[0].base64 ?? null);
        analyzeWorkspace.reset();
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    } catch {
      Alert.alert('Error', 'Could not access camera or gallery.');
    }
  };

  const handleAnalyze = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    analyzeWorkspace.mutate({ data: { image_base64: imageBase64 ?? '', mode: 'workspace' } });
  };

  const data = analyzeWorkspace.data;
  const focusScore = data?.focus_score ?? 0;

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: {
      paddingTop: insets.top + 12,
      paddingHorizontal: 20,
      paddingBottom: 16,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    closeBtn: {
      width: 36, height: 36, borderRadius: 18,
      backgroundColor: colors.muted,
      alignItems: 'center', justifyContent: 'center',
    },
    title: { fontFamily: 'Inter_700Bold', fontSize: 20, color: colors.foreground },
    subtitle: { fontFamily: 'Inter_400Regular', fontSize: 14, color: colors.mutedForeground },
    content: { padding: 20, gap: 16 },
    webFallback: {
      backgroundColor: colors.card, borderRadius: colors.radius,
      padding: 24, alignItems: 'center', gap: 12, borderWidth: 1, borderColor: colors.border,
    },
    webFallbackText: { fontFamily: 'Inter_500Medium', fontSize: 15, color: colors.foreground, textAlign: 'center' },
    webFallbackSub: { fontFamily: 'Inter_400Regular', fontSize: 13, color: colors.mutedForeground, textAlign: 'center' },
    imageSection: { gap: 12 },
    imagePreview: {
      width: '100%', height: 200, borderRadius: colors.radius,
      backgroundColor: colors.muted, overflow: 'hidden',
    },
    imagePlaceholder: {
      width: '100%', height: 200, borderRadius: colors.radius,
      backgroundColor: colors.muted, borderWidth: 2, borderStyle: 'dashed',
      borderColor: colors.border, alignItems: 'center', justifyContent: 'center', gap: 8,
    },
    placeholderText: { fontFamily: 'Inter_400Regular', fontSize: 14, color: colors.mutedForeground },
    buttonRow: { flexDirection: 'row', gap: 10 },
    btn: {
      flex: 1, paddingVertical: 12, borderRadius: colors.radius,
      alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 6,
      backgroundColor: colors.muted, borderWidth: 1, borderColor: colors.border,
    },
    btnPrimary: { backgroundColor: colors.primary },
    btnText: { fontFamily: 'Inter_600SemiBold', fontSize: 14, color: colors.foreground },
    btnTextPrimary: { color: colors.primaryForeground },
    analyzeBtn: {
      backgroundColor: colors.primary, paddingVertical: 14, borderRadius: colors.radius,
      alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 8,
    },
    analyzeBtnText: { fontFamily: 'Inter_700Bold', fontSize: 16, color: colors.primaryForeground },
    analyzeBtnDisabled: { opacity: 0.5 },
    resultsSection: { gap: 12 },
    resultHeader: { fontFamily: 'Inter_700Bold', fontSize: 16, color: colors.foreground },
    scoreCard: {
      backgroundColor: colors.card, borderRadius: colors.radius, padding: 16,
      borderWidth: 1, borderColor: colors.border, gap: 8,
    },
    scoreRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    scoreLabel: { fontFamily: 'Inter_500Medium', fontSize: 14, color: colors.mutedForeground },
    scoreValue: { fontFamily: 'Inter_700Bold', fontSize: 24, color: colors.primary },
    scoreBar: { height: 8, backgroundColor: colors.muted, borderRadius: 4, overflow: 'hidden' },
    scoreBarFill: { height: '100%', borderRadius: 4 },
    objectGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    objectCard: {
      width: '47%', backgroundColor: colors.card, borderRadius: 12,
      padding: 12, gap: 6, borderWidth: 1, borderColor: colors.border,
    },
    objectLabel: { fontFamily: 'Inter_600SemiBold', fontSize: 13, color: colors.foreground },
    objectGameLabel: { fontFamily: 'Inter_400Regular', fontSize: 11, color: colors.primary },
    objectCategory: {
      paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8,
      alignSelf: 'flex-start', marginTop: 2,
    },
    objectCategoryText: { fontFamily: 'Inter_500Medium', fontSize: 10 },
    missionCard: {
      backgroundColor: colors.card, borderRadius: colors.radius, padding: 16,
      borderWidth: 1, borderColor: colors.border, gap: 8,
    },
    missionLabel: { fontFamily: 'Inter_500Medium', fontSize: 12, color: colors.mutedForeground, textTransform: 'uppercase' },
    missionText: { fontFamily: 'Inter_600SemiBold', fontSize: 15, color: colors.foreground },
    startBtn: {
      backgroundColor: colors.sage, paddingVertical: 12, borderRadius: colors.radius,
      alignItems: 'center',
    },
    startBtnText: { fontFamily: 'Inter_700Bold', fontSize: 14, color: colors.sageForeground },
    sourceBadge: {
      flexDirection: 'row', alignItems: 'center', gap: 4,
      paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20,
      backgroundColor: colors.muted, alignSelf: 'flex-start',
    },
    sourceText: { fontFamily: 'Inter_400Regular', fontSize: 11, color: colors.mutedForeground },
  });

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'distraction': return { bg: '#FFE8E8', text: '#D94F4F' };
      case 'study_tool': return { bg: '#EEF0FF', text: colors.primary };
      case 'wellness': return { bg: '#E8F5E8', text: colors.sage };
      case 'focus_tool': return { bg: '#E8F0FF', text: colors.dustyBlue };
      default: return { bg: colors.muted, text: colors.mutedForeground };
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 70) return colors.sage;
    if (score >= 50) return colors.accent;
    return '#D94F4F';
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.closeBtn} onPress={() => router.back()}>
          <Feather name="x" size={18} color={colors.foreground} />
        </TouchableOpacity>
        <View>
          <Text style={styles.title}>Camera Grounding</Text>
          <Text style={styles.subtitle}>Use your room to find one small next step</Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {Platform.OS === 'web' ? (
          <View style={styles.webFallback}>
            <Feather name="camera" size={40} color={colors.mutedForeground} />
            <Text style={styles.webFallbackText}>Camera Grounding — Mobile Only</Text>
            <Text style={styles.webFallbackSub}>
              Open this screen on your mobile device to scan your workspace and get AI-powered focus analysis.
            </Text>
            <TouchableOpacity
              style={[styles.analyzeBtn, { marginTop: 8 }]}
              onPress={handleAnalyze}
            >
              <Feather name="cpu" size={16} color={colors.primaryForeground} />
              <Text style={styles.analyzeBtnText}>Run Sample Analysis</Text>
            </TouchableOpacity>
          </View>
        ) : (
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
              style={[styles.analyzeBtn, analyzeWorkspace.isPending && styles.analyzeBtnDisabled]}
              onPress={handleAnalyze}
              disabled={analyzeWorkspace.isPending}
            >
              {analyzeWorkspace.isPending ? (
                <ActivityIndicator color={colors.primaryForeground} size="small" />
              ) : (
                <Feather name="search" size={16} color={colors.primaryForeground} />
              )}
              <Text style={styles.analyzeBtnText}>
                {analyzeWorkspace.isPending ? 'Scanning...' : 'Analyze Workspace'}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {data && (
          <View style={styles.resultsSection}>
            <View style={styles.scoreCard}>
              <View style={styles.scoreRow}>
                <Text style={styles.scoreLabel}>Focus Score</Text>
                <Text style={[styles.scoreValue, { color: getScoreColor(focusScore) }]}>
                  {focusScore}
                </Text>
              </View>
              <View style={styles.scoreBar}>
                <View
                  style={[
                    styles.scoreBarFill,
                    { width: `${focusScore}%`, backgroundColor: getScoreColor(focusScore) },
                  ]}
                />
              </View>
              <View style={styles.sourceBadge}>
                <Feather
                  name={data.source === 'vision_ai' ? 'cpu' : 'database'}
                  size={10}
                  color={colors.mutedForeground}
                />
                <Text style={styles.sourceText}>
                  {data.source === 'vision_ai' ? 'AI Vision' : 'Sample data'}
                </Text>
              </View>
            </View>

            <Text style={styles.resultHeader}>Objects Detected</Text>
            <View style={styles.objectGrid}>
              {(data.objects as Array<{ label: string; game_label: string; category: string; confidence: string }>).map((obj, idx) => {
                const catColor = getCategoryColor(obj.category);
                return (
                  <View key={idx} style={styles.objectCard}>
                    <Feather
                      name={(CATEGORY_ICONS[obj.category] ?? 'box') as keyof typeof Feather.glyphMap}
                      size={20}
                      color={catColor.text}
                    />
                    <Text style={styles.objectLabel}>{matureObjectLabel(obj.game_label)}</Text>
                    <Text style={styles.objectGameLabel}>{obj.label}</Text>
                    <View style={[styles.objectCategory, { backgroundColor: catColor.bg }]}>
                      <Text style={[styles.objectCategoryText, { color: catColor.text }]}>
                        {CATEGORY_LABELS[obj.category] ?? obj.category}
                      </Text>
                    </View>
                  </View>
                );
              })}
            </View>

            <View style={styles.missionCard}>
              <Text style={styles.missionLabel}>Suggested Mission</Text>
              <Text style={styles.missionText}>{data.suggested_mission}</Text>
              <TouchableOpacity
                style={styles.startBtn}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                  router.push('/games/focus-boss');
                }}
              >
                <Text style={styles.startBtnText}>Start Focus Session</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {analyzeWorkspace.isError && (
          <View style={[styles.missionCard, { borderColor: '#D94F4F' }]}>
            <Text style={[styles.missionText, { color: '#D94F4F' }]}>Scan failed</Text>
            <Text style={styles.objectGameLabel}>Could not analyze workspace. Try again.</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
