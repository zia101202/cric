import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { TextInput, IconButton, Avatar, Text } from 'react-native-paper';
import { useAuthStore } from '../store/authStore';

/**
 * Props for CommentInputField component
 */
interface CommentInputFieldProps {
  onSubmit: (text: string) => void;
  placeholder?: string;
  replyTo?: { id: string; userName: string } | null;
  onCancelReply?: () => void;
  isLoading?: boolean;
}

/**
 * CommentInputField component
 * Clean UI for comment input field with reply support
 * Used in match posts, tournament posts, and team posts
 */
export const CommentInputField: React.FC<CommentInputFieldProps> = ({
  onSubmit,
  placeholder = 'Write a comment...',
  replyTo,
  onCancelReply,
  isLoading = false,
}) => {
  const { user } = useAuthStore();
  const [text, setText] = useState('');

  const handleSubmit = () => {
    if (text.trim()) {
      onSubmit(text.trim());
      setText('');
    }
  };

  return (
    <View style={styles.container}>
      {replyTo && (
        <View style={styles.replyContainer}>
          <Text variant="bodySmall" style={styles.replyText}>
            Replying to {replyTo.userName}
          </Text>
          {onCancelReply && (
            <IconButton
              icon="close"
              size={16}
              onPress={onCancelReply}
              style={styles.cancelReplyButton}
            />
          )}
        </View>
      )}
      <View style={styles.inputContainer}>
        {user && (
          <Avatar.Text
            size={32}
            label={user.email?.charAt(0).toUpperCase() || 'U'}
            style={styles.avatar}
          />
        )}
        <TextInput
          mode="outlined"
          placeholder={placeholder}
          value={text}
          onChangeText={setText}
          multiline
          maxLength={500}
          style={styles.input}
          disabled={isLoading}
          right={
            <TextInput.Icon
              icon="send"
              onPress={handleSubmit}
              disabled={!text.trim() || isLoading}
            />
          }
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 12,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  replyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: '#e3f2fd',
    borderRadius: 4,
  },
  replyText: {
    flex: 1,
    color: '#1976d2',
    fontStyle: 'italic',
  },
  cancelReplyButton: {
    margin: 0,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
  },
  avatar: {
    marginBottom: 4,
  },
  input: {
    flex: 1,
    maxHeight: 100,
  },
});

