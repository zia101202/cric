import { useState, useCallback, useEffect } from 'react';
import { supabase } from '../config/supabase';
// Note: Requires @react-native-community/netinfo package
// import NetInfo from '@react-native-community/netinfo';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Sync queue item
 */
export interface SyncQueueItem {
  id: string;
  type: 'match_score' | 'match_report' | 'message' | 'comment' | 'like';
  action: 'create' | 'update' | 'delete';
  table: string;
  data: any;
  timestamp: string;
  retries: number;
}

/**
 * Sync status
 */
export interface SyncStatus {
  isOnline: boolean;
  queueLength: number;
  lastSyncTime: string | null;
  syncing: boolean;
}

/**
 * Custom hook for offline-first support and sync
 * Handles queuing actions when offline and syncing when online
 */
export const useOfflineSync = () => {
  const [isOnline, setIsOnline] = useState(true);
  const [queue, setQueue] = useState<SyncQueueItem[]>([]);
  const [syncing, setSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);

  const QUEUE_STORAGE_KEY = '@offline_sync_queue';
  const MAX_RETRIES = 3;

  useEffect(() => {
    // TODO: Monitor network status
    // Requires @react-native-community/netinfo package
    // const unsubscribe = NetInfo.addEventListener((state) => {
    //   const online = state.isConnected ?? false;
    //   setIsOnline(online);
    //   if (online && queue.length > 0) {
    //     syncQueue();
    //   }
    // });
    
    // For now, assume online
    setIsOnline(true);

    // Load queue from storage
    loadQueue();

    // return () => {
    //   unsubscribe();
    // };
  }, []);

  /**
   * Load queue from AsyncStorage
   */
  const loadQueue = useCallback(async () => {
    try {
      const stored = await AsyncStorage.getItem(QUEUE_STORAGE_KEY);
      if (stored) {
        const parsedQueue = JSON.parse(stored) as SyncQueueItem[];
        setQueue(parsedQueue);
      }
    } catch (error) {
      console.error('Failed to load sync queue:', error);
    }
  }, []);

  /**
   * Save queue to AsyncStorage
   */
  const saveQueue = useCallback(async (newQueue: SyncQueueItem[]) => {
    try {
      await AsyncStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(newQueue));
      setQueue(newQueue);
    } catch (error) {
      console.error('Failed to save sync queue:', error);
    }
  }, []);

  /**
   * Add item to sync queue
   */
  const queueAction = useCallback(
    async (item: Omit<SyncQueueItem, 'id' | 'timestamp' | 'retries'>) => {
      const queueItem: SyncQueueItem = {
        ...item,
        id: `${Date.now()}-${Math.random()}`,
        timestamp: new Date().toISOString(),
        retries: 0,
      };

      const newQueue = [...queue, queueItem];
      await saveQueue(newQueue);

      // If online, try to sync immediately
      if (isOnline) {
        syncQueue();
      }

      return queueItem.id;
    },
    [queue, isOnline, saveQueue]
  );

  /**
   * Sync queue items
   */
  const syncQueue = useCallback(async () => {
    if (syncing || !isOnline || queue.length === 0) {
      return;
    }

    setSyncing(true);

    try {
      const itemsToSync = [...queue];
      const successful: string[] = [];
      const failed: SyncQueueItem[] = [];

      for (const item of itemsToSync) {
        try {
          let result;

          switch (item.action) {
            case 'create':
              const { data: createData, error: createError } = await supabase
                .from(item.table)
                .insert(item.data)
                .select()
                .single();
              if (createError) throw createError;
              result = createData;
              break;

            case 'update':
              const { error: updateError } = await supabase
                .from(item.table)
                .update(item.data)
                .eq('id', item.data.id);
              if (updateError) throw updateError;
              result = { success: true };
              break;

            case 'delete':
              const { error: deleteError } = await supabase
                .from(item.table)
                .delete()
                .eq('id', item.data.id);
              if (deleteError) throw deleteError;
              result = { success: true };
              break;

            default:
              throw new Error(`Unknown action: ${item.action}`);
          }

          successful.push(item.id);
        } catch (error) {
          // Retry logic
          if (item.retries < MAX_RETRIES) {
            item.retries += 1;
            failed.push(item);
          } else {
            // Max retries reached, remove from queue
            console.error(`Failed to sync item ${item.id} after ${MAX_RETRIES} retries:`, error);
          }
        }
      }

      // Update queue with failed items
      const newQueue = failed;
      await saveQueue(newQueue);

      // Update last sync time
      if (successful.length > 0) {
        setLastSyncTime(new Date().toISOString());
      }

      return {
        success: true,
        synced: successful.length,
        failed: failed.length,
      };
    } catch (error) {
      console.error('Sync error:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Sync failed' };
    } finally {
      setSyncing(false);
    }
  }, [queue, isOnline, syncing, saveQueue]);

  /**
   * Clear sync queue
   */
  const clearQueue = useCallback(async () => {
    await AsyncStorage.removeItem(QUEUE_STORAGE_KEY);
    setQueue([]);
  }, []);

  /**
   * Get sync status
   */
  const getSyncStatus = useCallback((): SyncStatus => {
    return {
      isOnline,
      queueLength: queue.length,
      lastSyncTime,
      syncing,
    };
  }, [isOnline, queue.length, lastSyncTime, syncing]);

  /**
   * Queue match score submission
   */
  const queueMatchScore = useCallback(
    async (matchId: string, scorecard: any) => {
      return await queueAction({
        type: 'match_score',
        action: 'update',
        table: 'matches',
        data: { id: matchId, ...scorecard },
      });
    },
    [queueAction]
  );

  /**
   * Queue message draft
   */
  const queueMessage = useCallback(
    async (messageData: any) => {
      return await queueAction({
        type: 'message',
        action: 'create',
        table: 'messages',
        data: messageData,
      });
    },
    [queueAction]
  );

  return {
    isOnline,
    queue,
    syncing,
    lastSyncTime,
    queueAction,
    syncQueue,
    clearQueue,
    getSyncStatus,
    queueMatchScore,
    queueMessage,
  };
};

