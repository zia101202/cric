import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Avatar, Text, IconButton, Menu } from 'react-native-paper';
import { Comment } from '../store/commentStore';
import { useAuthStore } from '../store/authStore';

/**
 * Props for CommentListItem component
 */
interface CommentListItemProps {
  comment: Comment;
  onReply?: (comment: Comment) => void;
  onLike?: (commentId: string) => void;
  onReport?: (commentId: string) => void;
  onDelete?: (commentId: string) => void;
  showReplies?: boolean;
}

/**
 * CommentListItem component
 * Display of comment thread using List, Avatar, Divider
 * Supports reply option and real-time syncing
 */
export const CommentListItem: React.FC<CommentListItemProps> = ({
  comment,
  onReply,
  onLike,
  onReport,
  onDelete,
  showReplies = true,
}) => {
  const { user } = useAuthStore();
  const [menuVisible, setMenuVisible] = useState(false);
  const isOwnComment = user?.id === comment.userId;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <View style={styles.container}>
      <View style={styles.commentHeader}>
        <View style={styles.commentInfo}>
          {comment.userAvatar ? (
            <Avatar.Image size={32} source={{ uri: comment.userAvatar }} />
          ) : (
            <Avatar.Text size={32} label={comment.userName.charAt(0).toUpperCase()} />
          )}
          <View style={styles.commentContent}>
            <View style={styles.commentHeaderRow}>
              <Text variant="bodyMedium" style={styles.userName}>
                {comment.userName}
              </Text>
              <Text variant="bodySmall" style={styles.timestamp}>
                {formatDate(comment.createdAt)}
              </Text>
            </View>
            <Text variant="bodyMedium" style={styles.commentText}>
              {comment.content}
            </Text>
          </View>
        </View>
        <Menu
          visible={menuVisible}
          onDismiss={() => setMenuVisible(false)}
          anchor={
            <IconButton
              icon="dots-vertical"
              size={18}
              onPress={() => setMenuVisible(true)}
            />
          }
        >
          {onReply && (
            <Menu.Item
              onPress={() => {
                setMenuVisible(false);
                onReply(comment);
              }}
              title="Reply"
              leadingIcon="reply"
            />
          )}
          {onLike && (
            <Menu.Item
              onPress={() => {
                setMenuVisible(false);
                onLike(comment.id);
              }}
              title={comment.isLiked ? 'Unlike' : 'Like'}
              leadingIcon={comment.isLiked ? 'heart' : 'heart-outline'}
            />
          )}
          {onReport && !isOwnComment && (
            <Menu.Item
              onPress={() => {
                setMenuVisible(false);
                onReport(comment.id);
              }}
              title="Report"
              leadingIcon="flag-outline"
            />
          )}
          {onDelete && isOwnComment && (
            <Menu.Item
              onPress={() => {
                setMenuVisible(false);
                onDelete(comment.id);
              }}
              title="Delete"
              leadingIcon="delete-outline"
            />
          )}
        </Menu>
      </View>

      <View style={styles.actionsContainer}>
        {onLike && (
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => onLike(comment.id)}
          >
            <IconButton
              icon={comment.isLiked ? 'heart' : 'heart-outline'}
              size={18}
              iconColor={comment.isLiked ? '#f44336' : '#666'}
            />
            <Text variant="bodySmall" style={styles.actionText}>
              {comment.likes}
            </Text>
          </TouchableOpacity>
        )}
        {onReply && (
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => onReply(comment)}
          >
            <IconButton icon="reply" size={18} iconColor="#666" />
            <Text variant="bodySmall" style={styles.actionText}>
              {comment.replyCount > 0 ? comment.replyCount : 'Reply'}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {showReplies && comment.replies && comment.replies.length > 0 && (
        <View style={styles.repliesContainer}>
          {comment.replies.map((reply) => (
            <CommentListItem
              key={reply.id}
              comment={reply}
              onReply={onReply}
              onLike={onLike}
              showReplies={false}
            />
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  commentInfo: {
    flexDirection: 'row',
    flex: 1,
  },
  commentContent: {
    marginLeft: 12,
    flex: 1,
  },
  commentHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  userName: {
    fontWeight: 'bold',
    marginRight: 8,
  },
  timestamp: {
    color: '#666',
    fontSize: 11,
  },
  commentText: {
    color: '#333',
    lineHeight: 20,
  },
  actionsContainer: {
    flexDirection: 'row',
    marginTop: 8,
    marginLeft: 44,
    gap: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionText: {
    color: '#666',
    marginLeft: -8,
  },
  repliesContainer: {
    marginLeft: 44,
    marginTop: 8,
    paddingLeft: 12,
    borderLeftWidth: 2,
    borderLeftColor: '#e0e0e0',
  },
});

