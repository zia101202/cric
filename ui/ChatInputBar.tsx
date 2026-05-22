import React, { useState } from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { TextInput, IconButton } from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';

/**
 * Props for ChatInputBar component
 */
interface ChatInputBarProps {
  onSend: (text: string, imageUri?: string) => void;
  placeholder?: string;
  disabled?: boolean;
  isLoading?: boolean;
}

/**
 * ChatInputBar component
 * Message input with emoji support
 * Smooth scrolling and clean aesthetic using Paper's styling
 */
export const ChatInputBar: React.FC<ChatInputBarProps> = ({
  onSend,
  placeholder = 'Type a message...',
  disabled = false,
  isLoading = false,
}) => {
  const [text, setText] = useState('');
  const [imageUri, setImageUri] = useState<string | null>(null);

  const handleSend = () => {
    if (text.trim() || imageUri) {
      onSend(text.trim(), imageUri || undefined);
      setText('');
      setImageUri(null);
    }
  };

  const handlePickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setImageUri(result.assets[0].uri);
    }
  };

  const handleRemoveImage = () => {
    setImageUri(null);
  };

  return (
    <View style={styles.container}>
      {imageUri && (
        <View style={styles.imagePreview}>
          <Image source={{ uri: imageUri }} style={styles.previewImage} />
          <IconButton
            icon="close"
            size={16}
            onPress={handleRemoveImage}
            style={styles.removeImageButton}
          />
        </View>
      )}
      <View style={styles.inputContainer}>
        <IconButton
          icon="image"
          size={24}
          onPress={handlePickImage}
          disabled={disabled || isLoading}
        />
        <TextInput
          mode="flat"
          placeholder={placeholder}
          value={text}
          onChangeText={setText}
          multiline
          maxLength={1000}
          style={styles.input}
          disabled={disabled || isLoading}
          right={
            <TextInput.Icon
              icon="send"
              onPress={handleSend}
              disabled={(!text.trim() && !imageUri) || disabled || isLoading}
            />
          }
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    paddingBottom: 8,
  },
  imagePreview: {
    position: 'relative',
    marginHorizontal: 12,
    marginTop: 8,
    marginBottom: 4,
  },
  previewImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
  },
  removeImageButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#fff',
    margin: 0,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 4,
  },
  input: {
    flex: 1,
    maxHeight: 100,
    backgroundColor: '#f5f5f5',
    borderRadius: 20,
    marginHorizontal: 4,
  },
});

