import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

type AvatarSize = 'sm' | 'md' | 'lg' | 'xl';

type AvatarProps = {
  name?: string;
  imageUrl?: string;
  size?: AvatarSize;
};

const getSizeValue = (size: AvatarSize) => {
  switch (size) {
    case 'sm':
      return 32;
    case 'md':
      return 44;
    case 'lg':
      return 60;
    case 'xl':
      return 80;
    default:
      return 44;
  }
};

const getFontSize = (size: AvatarSize) => {
  switch (size) {
    case 'sm':
      return 12;
    case 'md':
      return 16;
    case 'lg':
      return 22;
    case 'xl':
      return 28;
    default:
      return 16;
  }
};

export default function Avatar({ name, imageUrl, size = 'md' }: AvatarProps) {
  const sizeValue = getSizeValue(size);
  const fontSize = getFontSize(size);
  const initial = name?.[0]?.toUpperCase() || 'U';

  if (imageUrl) {
    return (
      <Image
        source={{ uri: imageUrl }}
        style={[
          styles.image,
          {
            width: sizeValue,
            height: sizeValue,
            borderRadius: sizeValue / 2,
          },
        ]}
      />
    );
  }

  return (
    <LinearGradient
      colors={['#65a8bf', '#4a8a9f']}
      style={[
        styles.container,
        {
          width: sizeValue,
          height: sizeValue,
          borderRadius: sizeValue / 2,
        },
      ]}
    >
      <Text style={[styles.initial, { fontSize }]}>{initial}</Text>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    backgroundColor: '#ccc',
  },
  initial: {
    color: '#fff',
    fontWeight: '600',
  },
});
