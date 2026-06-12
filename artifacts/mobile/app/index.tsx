import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors } from '@/hooks/useColors';
import { Feather } from '@expo/vector-icons';

export default function WelcomeScreen() {
  const router = useRouter();
  const colors = useColors();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <View style={styles.content}>
        <View style={styles.hero}>
          <View style={[styles.illustration, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={[styles.phone, { borderColor: colors.foreground }]}>
              <Feather name="message-circle" size={24} color={colors.primary} />
            </View>
            <View style={[styles.node, { backgroundColor: colors.lavender }]} />
            <View style={[styles.nodeSmall, { backgroundColor: colors.sage }]} />
            <Feather name="cloud" size={32} color={colors.dustyBlue} style={styles.cloud} />
          </View>
          <Text style={[styles.title, { color: colors.foreground }]}>Anima-Link</Text>
          <Text style={[styles.productLabel, { color: colors.mutedForeground }]}>Persistent Cognitive Companion</Text>
          <Text style={[styles.tagline, { color: colors.primary }]}>Sense. Remember. Reframe. Act.</Text>
        </View>
        
        <Text style={[styles.description, { color: colors.mutedForeground }]}>
          Your premium mental health and cognitive companion. Master your emotions through guided missions and therapeutic intelligence.
        </Text>
      </View>

      <View style={styles.footer}>
        <Pressable 
          style={[styles.button, { backgroundColor: colors.primary }]}
          onPress={() => router.push('/onboarding/privacy')}
        >
          <Text style={[styles.buttonText, { color: colors.primaryForeground }]}>Get Started</Text>
        </Pressable>
        <Pressable style={styles.secondaryButton}>
          <Text style={[styles.secondaryButtonText, { color: colors.mutedForeground }]}>I already have an account</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  hero: {
    alignItems: 'center',
    marginBottom: 48,
  },
  illustration: {
    width: 190,
    height: 170,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  phone: {
    width: 70,
    height: 104,
    borderRadius: 16,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  node: {
    position: 'absolute',
    width: 18,
    height: 18,
    borderRadius: 9,
    left: 40,
    top: 42,
  },
  nodeSmall: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 6,
    right: 42,
    bottom: 44,
  },
  cloud: {
    position: 'absolute',
    right: 28,
    top: 28,
  },
  title: {
    fontSize: 40,
    fontFamily: 'Inter_700Bold',
    marginTop: 34,
    marginBottom: 8,
  },
  productLabel: {
    fontSize: 15,
    fontFamily: 'Inter_600SemiBold',
    marginBottom: 8,
  },
  tagline: {
    fontSize: 18,
    fontFamily: 'Inter_500Medium',
    letterSpacing: 0.5,
  },
  description: {
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 16,
  },
  footer: {
    padding: 24,
    gap: 16,
  },
  button: {
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
  },
  secondaryButton: {
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonText: {
    fontSize: 15,
    fontFamily: 'Inter_500Medium',
  },
});
