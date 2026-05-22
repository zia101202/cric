import React from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { Text, Avatar } from 'react-native-paper';
import { Message, MessageStatus } from '../store/messageStore';
import { useAuthStore } from '../store/authStore';

/**
 * Props for MessageBubble component
 */
interface MessageBubbleProps {
  message: Message;
  showAvatar?: boolean;
  showTimestamp?: boolean;
}

/**
 * MessageBubble component
 * WhatsApp-like chat UI using speech bubbles
 * Includes time stamps and seen indicators
 */
export const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  showAvatar = false,
  showTimestamp = true,
}) => {
  const { user } = useAuthStore();
  const isOwnMessage = user?.id === message.senderId;

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const getStatusIcon = (status: MessageStatus) => {
    switch (status) {
      case 'read':
        return '✓✓';
      case 'delivered':
        return '✓✓';
      case 'sent':
        return '✓';
      case 'sending':
        return '⏱';
      case 'failed':
        return '✗';
      default:
        return '';
    }
  };

  const getStatusColor = (status: MessageStatus) => {
    switch (status) {
      case 'read':
        return '#4caf50';
      case 'delivered':
        return '#999';
      case 'sent':
        return '#999';
      case 'sending':
        return '#999';
      case 'failed':
        return '#f44336';
      default:
        return '#999';
    }
  };

  return (
    <View
      style={[
        styles.container,
        isOwnMessage ? styles.ownMessageContainer : styles.otherMessageContainer,
      ]}
    >
      {!isOwnMessage && showAvatar && (
        <Avatar.Image
          size={32}
          source={{ uri: message.senderAvatar || '' }}
          style={styles.avatar}
        />
      )}
      <View
        style={[
          styles.bubble,
          isOwnMessage ? styles.ownBubble : styles.otherBubble,
        ]}
      >
        {!isOwnMessage && (
          <Text variant="bodySmall" style={styles.senderName}>
            {message.senderName}
          </Text>
        )}
        {message.imageUrl ? (
          <Image source={{ uri: message.imageUrl }} style={styles.messageImage} />
        ) : (
          <Text variant="bodyMedium" style={styles.messageText}>
            {message.content}
          </Text>
        )}
        <View style={styles.footer}>
          {showTimestamp && (
            <Text variant="bodySmall" style={styles.timestamp}>
              {formatTime(message.createdAt)}
            </Text>
          )}
          {isOwnMessage && (
            <Text
              variant="bodySmall"
              style={[styles.status, { color: getStatusColor(message.status) }]}
            >
              {getStatusIcon(message.status)}
            </Text>
          )}
        </View>
      </View>
      {isOwnMessage && showAvatar && (
        <Avatar.Image
          size={32}
          source={{ uri: message.senderAvatar || '' }}
          style={styles.avatar}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginVertical: 4,
    paddingHorizontal: 12,
    alignItems: 'flex-end',
  },
  ownMessageContainer: {
    justifyContent: 'flex-end',
  },
  otherMessageContainer: {
    justifyContent: 'flex-start',
  },
  avatar: {
    marginHorizontal: 8,
  },
  bubble: {
    maxWidth: '75%',
    padding: 12,
    borderRadius: 16,
  },
  ownBubble: {
    backgroundColor: '#dcf8c6',
    borderBottomRightRadius: 4,
  },
  otherBubble: {
    backgroundColor: '#ffffff',
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  senderName: {
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#1976d2',
  },
  messageText: {
    color: '#000',
    lineHeight: 20,
  },
  messageImage: {
    width: 200,
    height: 200,
    borderRadius: 8,
    marginBottom: 4,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginTop: 4,
    gap: 4,
  },
  timestamp: {
    color: '#666',
    fontSize: 11,
  },
  status: {
    fontSize: 11,
    fontWeight: 'bold',
  },
});

