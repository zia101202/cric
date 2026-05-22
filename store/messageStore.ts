import { create } from 'zustand';

/**
 * Message status
 */
export type MessageStatus = 'sending' | 'sent' | 'delivered' | 'read' | 'failed';

/**
 * Message interface
 */
export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string | null;
  content: string;
  imageUrl?: string | null;
  status: MessageStatus;
  createdAt: string;
  readAt?: string | null;
}

/**
 * Conversation interface
 */
export interface Conversation {
  id: string;
  participant1Id: string;
  participant1Name: string;
  participant1Avatar?: string | null;
  participant2Id: string;
  participant2Name: string;
  participant2Avatar?: string | null;
  lastMessage?: Message | null;
  lastMessageAt?: string | null;
  unreadCount: number;
  isOnline: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Messages state interface
 */
interface MessagesState {
  conversations: Conversation[];
  messages: Map<string, Message[]>; // conversationId -> messages[]
  currentConversationId: string | null;
  isLoading: boolean;
  isSending: boolean;
  error: string | null;
  onlineUsers: Set<string>; // userIds
  setConversations: (conversations: Conversation[]) => void;
  addConversation: (conversation: Conversation) => void;
  updateConversation: (id: string, updates: Partial<Conversation>) => void;
  setMessages: (conversationId: string, messages: Message[]) => void;
  addMessage: (conversationId: string, message: Message) => void;
  updateMessage: (conversationId: string, messageId: string, updates: Partial<Message>) => void;
  setCurrentConversation: (conversationId: string | null) => void;
  markConversationAsRead: (conversationId: string) => void;
  setOnlineUsers: (userIds: string[]) => void;
  setUserOnline: (userId: string, isOnline: boolean) => void;
  setLoading: (loading: boolean) => void;
  setSending: (sending: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

/**
 * Initial state
 */
const initialState = {
  conversations: [],
  messages: new Map<string, Message[]>(),
  currentConversationId: null,
  isLoading: false,
  isSending: false,
  error: null,
  onlineUsers: new Set<string>(),
};

/**
 * Zustand store for managing messages and conversations
 * Provides global access to chat data with real-time updates
 */
export const useMessageStore = create<MessagesState>((set) => ({
  ...initialState,

  setConversations: (conversations) => set({ conversations, error: null }),

  addConversation: (conversation) =>
    set((state) => ({
      conversations: [conversation, ...state.conversations],
    })),

  updateConversation: (id, updates) =>
    set((state) => ({
      conversations: state.conversations.map((c) =>
        c.id === id ? { ...c, ...updates, updatedAt: new Date().toISOString() } : c
      ),
    })),

  setMessages: (conversationId, messages) =>
    set((state) => {
      const newMessages = new Map(state.messages);
      newMessages.set(conversationId, messages);
      return { messages: newMessages };
    }),

  addMessage: (conversationId, message) =>
    set((state) => {
      const newMessages = new Map(state.messages);
      const currentMessages = newMessages.get(conversationId) || [];
      newMessages.set(conversationId, [...currentMessages, message]);
      return { messages: newMessages };
    }),

  updateMessage: (conversationId, messageId, updates) =>
    set((state) => {
      const newMessages = new Map(state.messages);
      const currentMessages = newMessages.get(conversationId) || [];
      newMessages.set(
        conversationId,
        currentMessages.map((m) => (m.id === messageId ? { ...m, ...updates } : m))
      );
      return { messages: newMessages };
    }),

  setCurrentConversation: (conversationId) => set({ currentConversationId: conversationId }),

  markConversationAsRead: (conversationId) =>
    set((state) => ({
      conversations: state.conversations.map((c) =>
        c.id === conversationId ? { ...c, unreadCount: 0 } : c
      ),
    })),

  setOnlineUsers: (userIds) =>
    set({
      onlineUsers: new Set(userIds),
    }),

  setUserOnline: (userId, isOnline) =>
    set((state) => {
      const newOnlineUsers = new Set(state.onlineUsers);
      if (isOnline) {
        newOnlineUsers.add(userId);
      } else {
        newOnlineUsers.delete(userId);
      }
      return { onlineUsers: newOnlineUsers };
    }),

  setLoading: (isLoading) => set({ isLoading }),

  setSending: (isSending) => set({ isSending }),

  setError: (error) => set({ error }),

  reset: () => set(initialState),
}));

