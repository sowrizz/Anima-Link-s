import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';
import Svg, { Polyline, Circle } from 'react-native-svg';

const HEARTBEAT_PATTERN = [
  30, 30, 30, 30, 30, 30, 30, 30, // baseline
  28, 33, // P wave
  30, 30, // baseline
  25, 5, 55, 30, // QRS complex
  30, 30, // baseline
  20, 30, // T wave
  30, 30, 30, 30, // baseline
];

const SCREEN_WIDTH = Dimensions.get('window').width;

export default function PulseScannerScreen() {
  const router = useRouter();
  const colors = useColors();
  const insets = useSafeAreaInsets();

  const [scanning, setScanning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [stage, setStage] = useState('Hold finger over camera lens');
  const [wavePoints, setWavePoints] = useState<number[]>(Array(40).fill(30));
  const [result, setResult] = useState<any>(null);

  const tickRef = useRef(0);
  const progressIntervalRef = useRef<any>(null);
  const waveIntervalRef = useRef<any>(null);

  useEffect(() => {
    return () => {
      stopScan();
    };
  }, []);

  const startScan = () => {
    setScanning(true);
    setProgress(0);
    setResult(null);
    setStage('Aligning sensor baseline...');

    // Progress timer
    progressIntervalRef.current = setInterval(() => {
      setProgress((prev) => {
        const next = prev + 1;
        if (next <= 25) {
          setStage('Calibrating photoplethysmogram index...');
        } else if (next <= 60) {
          setStage('Reading rPPG pulse amplitude...');
        } else if (next <= 85) {
          setStage('Analyzing spectral HRV dimensions...');
        } else if (next < 100) {
          setStage('Finalizing biological telemetry...');
        } else {
          completeScan();
        }
        return next;
      });
    }, 120);

    // Wave/EKG roller
    waveIntervalRef.current = setInterval(() => {
      setWavePoints((prev) => {
        const next = [...prev.slice(1)];
        const idx = tickRef.current % HEARTBEAT_PATTERN.length;
        next.push(HEARTBEAT_PATTERN[idx]);
        tickRef.current += 1;
        return next;
      });
    }, 50);
  };

  const stopScan = () => {
    setScanning(false);
    setProgress(0);
    if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    if (waveIntervalRef.current) clearInterval(waveIntervalRef.current);
  };

  const completeScan = () => {
    stopScan();
    // Generate realistic simulated readings
    setResult({
      heartRate: Math.floor(Math.random() * 15) + 68, // 68 - 83 bpm
      hrv: Math.floor(Math.random() * 25) + 40, // 40 - 65 ms
      coherence: 'High',
      confidence: '97%',
      mentalStrainIndex: 38,
      statusLabel: 'Balanced State',
      insight: 'Heart rate variability is optimal. Clear cognitive focus indicated. Physiological biomarkers demonstrate low acute anxiety and steady stress recovery.',
    });
  };

  const wavePointsString = wavePoints
    .map((y, x) => `${(x * (SCREEN_WIDTH - 80)) / (wavePoints.length - 1)},${y}`)
    .join(' ');

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
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
        <Text style={[styles.title, { color: colors.foreground }]}>rPPG Pulse Sensor</Text>
        <View style={{ width: 40 }} />
      </View>

      {!result && (
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.cardTitle, { color: colors.foreground }]}>
            Camera Bio-Sensing
          </Text>
          <Text style={[styles.cardSubtitle, { color: colors.mutedForeground }]}>
            Anima-Link uses camera-based photoplethysmography to read heart rate fluctuations through micro-vascular blood flow changes.
          </Text>

          {/* Pulse animation area */}
          <View style={styles.pulseArea}>
            <View
              style={[
                styles.pulseOuter,
                {
                  borderColor: scanning ? colors.primary : colors.border,
                  backgroundColor: scanning ? colors.primary + '10' : 'transparent',
                },
              ]}
            >
              <View
                style={[
                  styles.pulseInner,
                  {
                    backgroundColor: scanning ? colors.primary + '20' : colors.muted,
                  },
                ]}
              >
                <Feather
                  name={scanning ? 'heart' : 'aperture'}
                  size={40}
                  color={scanning ? colors.destructive : colors.mutedForeground}
                />
              </View>
            </View>

            {scanning && (
              <View style={styles.progressContainer}>
                <Text style={[styles.progressText, { color: colors.foreground }]}>
                  {progress}% Complete
                </Text>
                <Text style={[styles.stageText, { color: colors.primary }]}>{stage}</Text>
              </View>
            )}

            {!scanning && (
              <Pressable
                style={[styles.btn, { backgroundColor: colors.primary, width: '80%' }]}
                onPress={startScan}
              >
                <Text style={[styles.btnText, { color: colors.primaryForeground }]}>
                  Begin 10s Scan
                </Text>
              </Pressable>
            )}
          </View>

          {/* EKG wave viewer */}
          <View
            style={[
              styles.ekgContainer,
              {
                backgroundColor: colors.background,
                borderColor: colors.border,
              },
            ]}
          >
            <Svg height="60" width={SCREEN_WIDTH - 80}>
              <Polyline
                points={wavePointsString}
                fill="none"
                stroke={scanning ? colors.destructive : colors.mutedForeground}
                strokeWidth="2.5"
              />
            </Svg>
          </View>
        </View>
      )}

      {result && (
        <View style={styles.resultContainer}>
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.resultHeader}>
              <Feather name="activity" size={28} color={colors.primary} />
              <Text style={[styles.resultTitle, { color: colors.foreground }]}>Scan Results</Text>
            </View>

            {/* Metrics grid */}
            <View style={styles.metricsGrid}>
              <View style={[styles.metricBox, { backgroundColor: colors.background }]}>
                <Text style={[styles.metricLabel, { color: colors.mutedForeground }]}>Pulse Rate</Text>
                <Text style={[styles.metricValue, { color: colors.foreground }]}>
                  {result.heartRate} <Text style={styles.unitText}>BPM</Text>
                </Text>
              </View>

              <View style={[styles.metricBox, { backgroundColor: colors.background }]}>
                <Text style={[styles.metricLabel, { color: colors.mutedForeground }]}>HRV (SDNN)</Text>
                <Text style={[styles.metricValue, { color: colors.foreground }]}>
                  {result.hrv} <Text style={styles.unitText}>MS</Text>
                </Text>
              </View>
            </View>

            <View style={styles.metricsGrid}>
              <View style={[styles.metricBox, { backgroundColor: colors.background }]}>
                <Text style={[styles.metricLabel, { color: colors.mutedForeground }]}>Coherence</Text>
                <Text style={[styles.metricValue, { color: colors.sage }]}>
                  {result.coherence}
                </Text>
              </View>

              <View style={[styles.metricBox, { backgroundColor: colors.background }]}>
                <Text style={[styles.metricLabel, { color: colors.mutedForeground }]}>MSI Score</Text>
                <Text style={[styles.metricValue, { color: colors.primary }]}>
                  {result.mentalStrainIndex}/100
                </Text>
              </View>
            </View>

            <View style={[styles.divider, { backgroundColor: colors.border }]} />

            {/* Insights */}
            <View style={styles.insightsBox}>
              <Text style={[styles.insightsTitle, { color: colors.foreground }]}>Companion Analysis</Text>
              <Text style={[styles.insightsBody, { color: colors.mutedForeground }]}>
                {result.insight}
              </Text>
            </View>

            {/* Disclaimer */}
            <View style={[styles.disclaimerBox, { backgroundColor: colors.muted }]}>
              <Text style={[styles.disclaimerText, { color: colors.mutedForeground }]}>
                Disclaimer: rPPG micro-blood flow analysis is an experimental prototype. This is not medical diagnostic software. Please consult a professional for health-critical needs.
              </Text>
            </View>
          </View>

          {/* Action buttons */}
          <View style={styles.resultActions}>
            <Pressable
              style={[styles.btn, { backgroundColor: colors.primary }]}
              onPress={() => router.replace('/(tabs)/home')}
            >
              <Text style={[styles.btnText, { color: colors.primaryForeground }]}>
                Store Readings & Finish
              </Text>
            </Pressable>

            <Pressable
              style={[styles.btn, { backgroundColor: colors.muted }]}
              onPress={startScan}
            >
              <Text style={[styles.btnText, { color: colors.foreground }]}>Scan Again</Text>
            </Pressable>
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  closeBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'flex-start' },
  title: { fontSize: 24, fontFamily: 'Inter_700Bold' },
  card: { borderRadius: 24, borderWidth: 1, padding: 20, marginBottom: 24 },
  cardTitle: { fontSize: 20, fontFamily: 'Inter_700Bold', marginBottom: 8 },
  cardSubtitle: { fontSize: 14, fontFamily: 'Inter_400Regular', lineHeight: 20, marginBottom: 24 },
  pulseArea: { alignItems: 'center', marginVertical: 12, gap: 20 },
  pulseOuter: {
    width: 150,
    height: 150,
    borderRadius: 75,
    borderWidth: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pulseInner: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressContainer: { alignItems: 'center', gap: 6 },
  progressText: { fontSize: 18, fontFamily: 'Inter_700Bold' },
  stageText: { fontSize: 14, fontFamily: 'Inter_500Medium', textAlign: 'center' },
  btn: { height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center', width: '100%' },
  btnText: { fontSize: 16, fontFamily: 'Inter_600SemiBold' },
  ekgContainer: {
    height: 90,
    borderRadius: 20,
    borderWidth: 1,
    marginTop: 24,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    overflow: 'hidden',
  },
  resultContainer: { gap: 16 },
  resultHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 20 },
  resultTitle: { fontSize: 22, fontFamily: 'Inter_700Bold' },
  metricsGrid: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  metricBox: { flex: 1, padding: 16, borderRadius: 20, gap: 6 },
  metricLabel: { fontSize: 12, fontFamily: 'Inter_700Bold', textTransform: 'uppercase' },
  metricValue: { fontSize: 24, fontFamily: 'Inter_700Bold' },
  unitText: { fontSize: 12, fontFamily: 'Inter_500Medium' },
  divider: { height: 1, marginVertical: 12 },
  insightsBox: { gap: 8, marginBottom: 16 },
  insightsTitle: { fontSize: 16, fontFamily: 'Inter_700Bold' },
  insightsBody: { fontSize: 14, fontFamily: 'Inter_400Regular', lineHeight: 20 },
  disclaimerBox: { padding: 14, borderRadius: 20 },
  disclaimerText: { fontSize: 12, fontFamily: 'Inter_400Regular', lineHeight: 18 },
  resultActions: { gap: 12 },
});
