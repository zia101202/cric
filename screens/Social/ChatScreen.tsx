import React from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { Button, Card, Text } from 'react-native-paper';
import { useRoute } from '@react-navigation/native';

/**
 * Chat Screen
 * Lists all conversations
 */
export function ChatScreen() {
  const route = useRoute();
  const { recipientId, recipientName } = (route.params || {}) as {
    recipientId?: string;
    recipientName?: string;
  };
  const [conversations] = React.useState([]);

  return (
    <View style={styles.container}>
      {recipientName && (
        <Card style={styles.composeCard}>
          <Card.Content>
            <Text variant="titleMedium">New message</Text>
            <Text variant="bodySmall" style={styles.composeSubtitle}>
              You’re about to message {recipientName}
            </Text>
            <Button
              mode="contained"
              icon="send"
              style={styles.composeButton}
              onPress={() => {
                // TODO: Implement actual messaging functionality
                // For now, show alert that this feature is coming soon
                alert(`Messaging feature coming soon!\n\nYou would start a conversation with ${recipientName} (ID: ${recipientId})`);
              }}
            >
              Start Conversation
            </Button>
          </Card.Content>
        </Card>
      )}
      <FlatList
        data={conversations}
        keyExtractor={(item: any) => item.id}
        renderItem={({ item }: any) => (
          <Card style={styles.card}>
            <Card.Content>
              <Text variant="titleMedium">{item.name}</Text>
              <Text variant="bodySmall" style={styles.lastMessage}>
                {item.lastMessage}
              </Text>
            </Card.Content>
          </Card>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text variant="bodyLarge" style={styles.emptyText}>
              No conversations
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  card: {
    margin: 8,
    marginHorizontal: 16,
  },
  lastMessage: {
    color: '#666',
    marginTop: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    color: '#999',
  },
  composeCard: {
    marginHorizontal: 16,
    marginTop: 16,
  },
  composeSubtitle: {
    color: '#666',
    marginTop: 4,
  },
  composeButton: {
    marginTop: 12,
  },
});

