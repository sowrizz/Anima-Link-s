import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useColors } from '@/hooks/useColors';

export function CharacterBadge({ name }: { name: string }) {
  const colors = useColors();
  
  const getCharacterColor = (char: string) => {
    switch (char.toLowerCase()) {
      case 'sera': return colors.sera;
      case 'kael': return colors.kael;
      case 'nova': return colors.nova;
      case 'zen': return colors.zen;
      case 'arlo': return colors.arlo;
      default: return colors.primary;
    }
  };

  const color = getCharacterColor(name);

  return (
    <View style={[styles.badge, { backgroundColor: color + '33' }]}>
      <View style={[styles.dot, { backgroundColor: color }]} />
      <Text style={[styles.text, { color }]}>{name}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  text: {
    fontSize: 12,
    fontFamily: 'Inter_600SemiBold',
  },
});
