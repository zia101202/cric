import React from 'react';
import { View, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { IconButton, Text, Badge } from 'react-native-paper';

/**
 * Props for LikeButton component
 */
interface LikeButtonProps {
  isLiked: boolean;
  likeCount: number;
  onPress: () => void;
  size?: number;
  showCount?: boolean;
  disabled?: boolean;
}

/**
 * LikeButton component
 * Smooth animated like button with like counter
 * UI feedback on tap using Paper IconButton, Badge, Surface, Card
 */
export const LikeButton: React.FC<LikeButtonProps> = ({
  isLiked,
  likeCount,
  onPress,
  size = 24,
  showCount = true,
  disabled = false,
}) => {
  const scaleAnim = React.useRef(new Animated.Value(1)).current;

  const handlePress = () => {
    // Animate on press
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 1.2,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    onPress();
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      disabled={disabled}
      activeOpacity={0.7}
      style={styles.container}
    >
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <IconButton
          icon={isLiked ? 'heart' : 'heart-outline'}
          size={size}
          iconColor={isLiked ? '#f44336' : '#666'}
          disabled={disabled}
          onPress={handlePress}
        />
      </Animated.View>
      {showCount && likeCount > 0 && (
        <View style={styles.countContainer}>
          <Text variant="bodySmall" style={styles.countText}>
            {likeCount > 999 ? `${(likeCount / 1000).toFixed(1)}k` : likeCount}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  countContainer: {
    marginLeft: -8,
  },
  countText: {
    color: '#666',
    fontSize: 12,
    fontWeight: '500',
  },
});

