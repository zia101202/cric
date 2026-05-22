import { useCallback } from 'react';
import { supabase } from '../config/supabase';
import { useAuthStore } from '../store/authStore';

/**
 * Event type for telemetry
 */
export type TelemetryEventType =
  | 'error'
  | 'payment'
  | 'dispute'
  | 'video_upload'
  | 'export'
  | 'feature_usage'
  | 'performance';

/**
 * Telemetry event
 */
export interface TelemetryEvent {
  type: TelemetryEventType;
  name: string;
  properties?: Record<string, any>;
  userId?: string;
  timestamp?: string;
}

/**
 * Performance metric
 */
export interface PerformanceMetric {
  name: string;
  duration: number;
  metadata?: Record<string, any>;
}

/**
 * Custom hook for monitoring and observability
 * Handles telemetry, error tracking, and performance monitoring
 */
export const useMonitoring = () => {
  const { user } = useAuthStore();

  /**
   * Track telemetry event
   */
  const trackEvent = useCallback(
    async (event: TelemetryEvent) => {
      try {
        // In production, this would send to analytics service (e.g., Sentry, Mixpanel, etc.)
        // For now, log to console and optionally store in database

        const telemetryData = {
          type: event.type,
          name: event.name,
          properties: event.properties || {},
          user_id: event.userId || user?.id,
          timestamp: event.timestamp || new Date().toISOString(),
        };

        // Log to console in development
        if (__DEV__) {
          console.log('[Telemetry]', telemetryData);
        }

        // Store in database (if telemetry table exists)
        // await supabase.from('telemetry_events').insert(telemetryData);

        return { success: true };
      } catch (error) {
        console.error('Failed to track event:', error);
        return { success: false, error: error instanceof Error ? error.message : 'Tracking failed' };
      }
    },
    [user]
  );

  /**
   * Track error
   */
  const trackError = useCallback(
    async (error: Error, context?: Record<string, any>) => {
      try {
        await trackEvent({
          type: 'error',
          name: error.name,
          properties: {
            message: error.message,
            stack: error.stack,
            ...context,
          },
        });

        // In production, send to error tracking service (e.g., Sentry)
        // Sentry.captureException(error, { extra: context });
      } catch (err) {
        console.error('Failed to track error:', err);
      }
    },
    [trackEvent]
  );

  /**
   * Track payment event
   */
  const trackPayment = useCallback(
    async (paymentData: {
      amount: number;
      currency: string;
      type: string;
      status: string;
      transactionId?: string;
    }) => {
      return await trackEvent({
        type: 'payment',
        name: 'payment_processed',
        properties: paymentData,
      });
    },
    [trackEvent]
  );

  /**
   * Track dispute event
   */
  const trackDispute = useCallback(
    async (disputeData: {
      matchId: string;
      reportedBy: string;
      reason?: string;
    }) => {
      return await trackEvent({
        type: 'dispute',
        name: 'match_dispute',
        properties: disputeData,
      });
    },
    [trackEvent]
  );

  /**
   * Track feature usage
   */
  const trackFeatureUsage = useCallback(
    async (featureName: string, metadata?: Record<string, any>) => {
      return await trackEvent({
        type: 'feature_usage',
        name: `feature_${featureName}`,
        properties: metadata || {},
      });
    },
    [trackEvent]
  );

  /**
   * Track performance metric
   */
  const trackPerformance = useCallback(
    async (metric: PerformanceMetric) => {
      try {
        await trackEvent({
          type: 'performance',
          name: metric.name,
          properties: {
            duration: metric.duration,
            ...metric.metadata,
          },
        });

        // Log slow operations
        if (metric.duration > 1000) {
          console.warn(`[Performance] Slow operation: ${metric.name} took ${metric.duration}ms`);
        }
      } catch (error) {
        console.error('Failed to track performance:', error);
      }
    },
    [trackEvent]
  );

  /**
   * Measure async operation performance
   */
  const measurePerformance = useCallback(
    async <T,>(name: string, operation: () => Promise<T>): Promise<T> => {
      const startTime = Date.now();
      try {
        const result = await operation();
        const duration = Date.now() - startTime;
        await trackPerformance({ name, duration });
        return result;
      } catch (error) {
        const duration = Date.now() - startTime;
        await trackPerformance({ name, duration, metadata: { error: true } });
        throw error;
      }
    },
    [trackPerformance]
  );

  /**
   * Track video upload
   */
  const trackVideoUpload = useCallback(
    async (uploadData: {
      fileSize: number;
      duration?: number;
      success: boolean;
      error?: string;
    }) => {
      return await trackEvent({
        type: 'video_upload',
        name: uploadData.success ? 'video_upload_success' : 'video_upload_failed',
        properties: uploadData,
      });
    },
    [trackEvent]
  );

  /**
   * Track export job
   */
  const trackExport = useCallback(
    async (exportData: {
      type: string;
      format: string;
      duration?: number;
      success: boolean;
      error?: string;
    }) => {
      return await trackEvent({
        type: 'export',
        name: exportData.success ? 'export_success' : 'export_failed',
        properties: exportData,
      });
    },
    [trackEvent]
  );

  return {
    trackEvent,
    trackError,
    trackPayment,
    trackDispute,
    trackFeatureUsage,
    trackPerformance,
    measurePerformance,
    trackVideoUpload,
    trackExport,
  };
};

