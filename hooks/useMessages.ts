import { useState, useCallback, useEffect } from 'react';
import { supabase } from '../config/supabase';
import {
  useMessageStore,
  Message,
  Conversation,
  MessageStatus,
} from '../store/messageStore';
import { useAuthStore } from '../store/authStore';

/**
 * Custom hook for messaging functionality
 * Handles chat/messaging, conversation threads, and real-time updates
 */
export const useMessages = () => {
  const {
    conversations,
    messages,
    currentConversationId,
    setConversations,
    setMessages,
    addMessage,
    updateMessage,
    setCurrentConversationId,
    setLoading,
    setError,
  } = useMessageStore();
  const { user } = useAuthStore();

  /**
   * Fetch all conversations for the current user
   */
  const fetchConversations = useCallback(async () => {
    if (!user?.id) {
      setError('User not authenticated');
      return { success: false };
    }

    setLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from('conversations')
        .select('*')
        .or(`participant1Id.eq.${user.id},participant2Id.eq.${user.id}`)
        .order('updatedAt', { ascending: false });

      if (fetchError) {
        setError(fetchError.message);
        return { success: false };
      }

      const formattedConversations: Conversation[] = (data || []).map((conv: any) => {
        const isParticipant1 = conv.participant1Id === user.id;
        return {
          id: conv.id,
          participant1Id: conv.participant1Id,
          participant1Name: conv.participant1Name || 'Unknown',
          participant1Avatar: conv.participant1Avatar,
          participant2Id: conv.participant2Id,
          participant2Name: conv.participant2Name || 'Unknown',
          participant2Avatar: conv.participant2Avatar,
          lastMessage: conv.lastMessage,
          lastMessageAt: conv.lastMessageAt,
          unreadCount: isParticipant1 ? conv.participant1UnreadCount : conv.participant2UnreadCount,
          isOnline: isParticipant1 ? conv.participant2Online : conv.participant1Online,
          createdAt: conv.createdAt,
          updatedAt: conv.updatedAt,
        };
      });

      setConversations(formattedConversations);
      return { success: true, data: formattedConversations };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch conversations';
      setError(errorMessage);
      return { success: false };
    } finally {
      setLoading(false);
    }
  }, [user, setConversations, setLoading, setError]);

  /**
   * Fetch messages for a conversation
   */
  const fetchMessages = useCallback(
    async (conversationId: string) => {
      if (!user?.id) {
        setError('User not authenticated');
        return { success: false };
      }

      setLoading(true);
      setError(null);

      try {
        const { data, error: fetchError } = await supabase
          .from('messages')
          .select('*, sender:user_profiles(id, fullName, displayName, profilePictureUrl)')
          .eq('conversationId', conversationId)
          .order('createdAt', { ascending: true });

        if (fetchError) {
          setError(fetchError.message);
          return { success: false };
        }

        const formattedMessages: Message[] = (data || []).map((msg: any) => ({
          id: msg.id,
          conversationId: msg.conversationId,
          senderId: msg.senderId,
          senderName: msg.sender?.fullName || msg.sender?.displayName || 'Unknown',
          senderAvatar: msg.sender?.profilePictureUrl || null,
          content: msg.content,
          imageUrl: msg.imageUrl,
          status: msg.status,
          createdAt: msg.createdAt,
          readAt: msg.readAt,
        }));

        setMessages(conversationId, formattedMessages);
        setCurrentConversationId(conversationId);

        // Mark messages as read
        await markMessagesAsRead(conversationId);

        return { success: true, data: formattedMessages };
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch messages';
        setError(errorMessage);
        return { success: false };
      } finally {
        setLoading(false);
      }
    },
    [user, setMessages, setCurrentConversationId, setLoading, setError]
  );

  /**
   * Send a message
   */
  const sendMessage = useCallback(
    async (conversationId: string, content: string, imageUri?: string) => {
      if (!user?.id) {
        setError('User not authenticated');
        return { success: false };
      }

      setError(null);

      try {
        // Upload image if provided
        let imageUrl: string | null = null;
        if (imageUri) {
          const response = await fetch(imageUri);
          const blob = await response.blob();
          const fileExt = imageUri.split('.').pop() || 'jpg';
          const fileName = `message-${Date.now()}.${fileExt}`;
          const filePath = `messages/${fileName}`;

          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('chat-assets')
            .upload(filePath, blob, {
              cacheControl: '3600',
              upsert: true,
            });

          if (!uploadError) {
            const {
              data: { publicUrl },
            } = supabase.storage.from('chat-assets').getPublicUrl(filePath);
            imageUrl = publicUrl;
          }
        }

        // Create message
        const { data, error: messageError } = await supabase
          .from('messages')
          .insert({
            conversationId,
            senderId: user.id,
            content,
            imageUrl,
            status: 'sent',
          })
          .select()
          .single();

        if (messageError) {
          setError(messageError.message);
          return { success: false };
        }

        // Get sender details
        const { data: senderData } = await supabase
          .from('user_profiles')
          .select('fullName, displayName, profilePictureUrl')
          .eq('id', user.id)
          .single();

        const newMessage: Message = {
          id: data.id,
          conversationId,
          senderId: user.id,
          senderName: senderData?.fullName || senderData?.displayName || 'Unknown',
          senderAvatar: senderData?.profilePictureUrl || null,
          content,
          imageUrl,
          status: 'sent',
          createdAt: data.createdAt,
        };

        addMessage(conversationId, newMessage);

        // Update conversation last message
        await supabase
          .from('conversations')
          .update({
            lastMessageAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          })
          .eq('id', conversationId);

        return { success: true, data: newMessage };
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to send message';
        setError(errorMessage);
        return { success: false };
      }
    },
    [user, addMessage, setError]
  );

  /**
   * Create or get conversation with another user
   */
  const getOrCreateConversation = useCallback(
    async (otherUserId: string) => {
      if (!user?.id) {
        setError('User not authenticated');
        return { success: false };
      }

      setError(null);

      try {
        // Check if conversation exists
        const { data: existing } = await supabase
          .from('conversations')
          .select('*')
          .or(
            `and(participant1Id.eq.${user.id},participant2Id.eq.${otherUserId}),and(participant1Id.eq.${otherUserId},participant2Id.eq.${user.id})`
          )
          .single();

        if (existing) {
          return { success: true, data: existing.id };
        }

        // Get other user details
        const { data: otherUser } = await supabase
          .from('user_profiles')
          .select('id, fullName, displayName, profilePictureUrl')
          .eq('id', otherUserId)
          .single();

        // Create new conversation
        const { data: newConv, error: createError } = await supabase
          .from('conversations')
          .insert({
            participant1Id: user.id,
            participant1Name: user.email?.split('@')[0] || 'User',
            participant2Id: otherUserId,
            participant2Name: otherUser?.fullName || otherUser?.displayName || 'Unknown',
            participant2Avatar: otherUser?.profilePictureUrl,
            unreadCount: 0,
          })
          .select()
          .single();

        if (createError) {
          setError(createError.message);
          return { success: false };
        }

        return { success: true, data: newConv.id };
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to create conversation';
        setError(errorMessage);
        return { success: false };
      }
    },
    [user, setError]
  );

  /**
   * Mark messages as read
   */
  const markMessagesAsRead = useCallback(
    async (conversationId: string) => {
      if (!user?.id) {
        return { success: false };
      }

      try {
        await supabase
          .from('messages')
          .update({
            readAt: new Date().toISOString(),
            status: 'read',
          })
          .eq('conversationId', conversationId)
          .eq('status', 'delivered')
          .neq('senderId', user.id);

        // Update conversation unread count
        const conversation = conversations.find((c) => c.id === conversationId);
        if (conversation) {
          const isParticipant1 = conversation.participant1Id === user.id;
          await supabase
            .from('conversations')
            .update({
              [isParticipant1 ? 'participant1UnreadCount' : 'participant2UnreadCount']: 0,
            })
            .eq('id', conversationId);
        }

        return { success: true };
      } catch (err) {
        return { success: false };
      }
    },
    [user, conversations]
  );

  /**
   * Subscribe to real-time message updates
   */
  useEffect(() => {
    if (!currentConversationId || !user?.id) return;

    const channel = supabase
      .channel(`messages:${currentConversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversationId=eq.${currentConversationId}`,
        },
        (payload) => {
          // Handle new message
          const newMessage = payload.new as any;
          if (newMessage.senderId !== user.id) {
            fetchMessages(currentConversationId);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentConversationId, user, fetchMessages]);

  return {
    conversations,
    messages: currentConversationId ? messages.get(currentConversationId) || [] : [],
    currentConversationId,
    fetchConversations,
    fetchMessages,
    sendMessage,
    getOrCreateConversation,
    markMessagesAsRead,
  };
};

