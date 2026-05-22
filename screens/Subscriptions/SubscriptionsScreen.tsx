import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, Alert } from 'react-native';
import {
  Surface,
  Title,
  Paragraph,
  Card,
  CardContent,
  Button,
  List,
  Chip,
  ActivityIndicator,
  Divider,
} from 'react-native-paper';
import { useSubscriptions, SubscriptionPlan } from '../../hooks/useSubscriptions';
import { useAuthStore } from '../../store/authStore';

/**
 * SubscriptionsScreen
 * Displays subscription plans and allows users to subscribe or manage existing subscriptions
 */
export const SubscriptionsScreen: React.FC = () => {
  const { user } = useAuthStore();
  const {
    loading,
    error,
    subscription,
    isPremium,
    getPlans,
    subscribe,
    cancelSubscription,
  } = useSubscriptions();
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    const result = await getPlans();
    if (result.success && result.data) {
      setPlans(result.data);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadPlans();
    setRefreshing(false);
  };

  const handleSubscribe = async (planId: string) => {
    Alert.alert(
      'Subscribe',
      'This will redirect you to the payment gateway. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Continue',
          onPress: async () => {
            const result = await subscribe(planId);
            if (result.success) {
              Alert.alert('Success', 'Subscription activated successfully!');
            } else {
              Alert.alert('Error', result.error || 'Failed to subscribe');
            }
          },
        },
      ]
    );
  };

  const handleCancel = async () => {
    Alert.alert(
      'Cancel Subscription',
      'Your subscription will remain active until the end of the current billing period. Continue?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: async () => {
            const result = await cancelSubscription(true);
            if (result.success) {
              Alert.alert('Success', 'Subscription will be cancelled at the end of the period.');
            } else {
              Alert.alert('Error', result.error || 'Failed to cancel subscription');
            }
          },
        },
      ]
    );
  };

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
    >
      <Surface style={styles.header}>
        <Title style={styles.headerTitle}>Subscriptions</Title>
        <Paragraph style={styles.headerSubtitle}>
          Choose a plan that fits your needs
        </Paragraph>
      </Surface>

      {subscription && (
        <Surface style={styles.currentPlan}>
          <View style={styles.currentPlanHeader}>
            <Title style={styles.currentPlanTitle}>Current Plan</Title>
            <Chip style={styles.premiumChip} textStyle={styles.premiumChipText}>
              {subscription.plan?.name || 'Premium'}
            </Chip>
          </View>
          {subscription.plan && (
            <List.Item
              title="Plan"
              description={subscription.plan.name}
              left={() => <List.Icon icon="star" />}
            />
          )}
          <List.Item
            title="Status"
            description={subscription.status}
            left={() => <List.Icon icon="check-circle" />}
          />
          <List.Item
            title="Renews On"
            description={new Date(subscription.endDate).toLocaleDateString()}
            left={() => <List.Icon icon="calendar" />}
          />
          {subscription.cancelAtPeriodEnd && (
            <Surface style={styles.cancelNotice}>
              <Paragraph style={styles.cancelNoticeText}>
                Your subscription will be cancelled at the end of the current period.
              </Paragraph>
            </Surface>
          )}
          {!subscription.cancelAtPeriodEnd && (
            <Button
              mode="outlined"
              onPress={handleCancel}
              style={styles.cancelButton}
              textColor="#F44336"
            >
              Cancel Subscription
            </Button>
          )}
        </Surface>
      )}

      <Title style={styles.plansTitle}>Available Plans</Title>

      {loading && plans.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" />
          <Paragraph style={styles.loadingText}>Loading plans...</Paragraph>
        </View>
      ) : (
        plans.map((plan) => (
          <Card key={plan.id} style={styles.planCard}>
            <CardContent>
              <View style={styles.planHeader}>
                <Title style={styles.planName}>{plan.name}</Title>
                <View style={styles.priceContainer}>
                  <Title style={styles.price}>
                    ₹{plan.price}
                    {plan.interval === 'monthly' ? '/mo' : '/yr'}
                  </Title>
                </View>
              </View>

              {plan.description && (
                <Paragraph style={styles.planDescription}>{plan.description}</Paragraph>
              )}

              <Divider style={styles.divider} />

              <Title style={styles.featuresTitle}>Features:</Title>
              {plan.features && plan.features.length > 0 ? (
                plan.features.map((feature, index) => (
                  <List.Item
                    key={index}
                    title={feature}
                    left={() => <List.Icon icon="check" color="#4CAF50" />}
                    titleStyle={styles.featureText}
                  />
                ))
              ) : (
                <Paragraph style={styles.noFeatures}>No features listed</Paragraph>
              )}

              <Button
                mode={subscription?.planId === plan.id ? 'outlined' : 'contained'}
                onPress={() => handleSubscribe(plan.id)}
                style={styles.subscribeButton}
                disabled={subscription?.planId === plan.id}
              >
                {subscription?.planId === plan.id ? 'Current Plan' : 'Subscribe'}
              </Button>
            </CardContent>
          </Card>
        ))
      )}

      {error && (
        <Surface style={styles.errorContainer}>
          <Paragraph style={styles.errorText}>{error}</Paragraph>
        </Surface>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    margin: 16,
    borderRadius: 12,
    elevation: 2,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  currentPlan: {
    padding: 20,
    margin: 16,
    marginTop: 0,
    borderRadius: 12,
    elevation: 2,
    backgroundColor: '#E3F2FD',
  },
  currentPlanHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  currentPlanTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  premiumChip: {
    backgroundColor: '#4CAF50',
    height: 32,
  },
  premiumChipText: {
    color: '#fff',
    fontWeight: '600',
  },
  cancelNotice: {
    padding: 12,
    marginTop: 16,
    backgroundColor: '#FFF3E0',
    borderRadius: 8,
  },
  cancelNoticeText: {
    fontSize: 13,
    color: '#E65100',
  },
  cancelButton: {
    marginTop: 16,
    borderColor: '#F44336',
  },
  plansTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginHorizontal: 16,
    marginBottom: 16,
  },
  loadingContainer: {
    padding: 32,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    color: '#666',
  },
  planCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    elevation: 2,
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  planName: {
    fontSize: 20,
    fontWeight: '600',
    flex: 1,
  },
  priceContainer: {
    alignItems: 'flex-end',
  },
  price: {
    fontSize: 24,
    fontWeight: '700',
    color: '#007AFF',
  },
  planDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  divider: {
    marginVertical: 12,
  },
  featuresTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  featureText: {
    fontSize: 14,
  },
  noFeatures: {
    fontSize: 13,
    color: '#666',
    fontStyle: 'italic',
  },
  subscribeButton: {
    marginTop: 16,
  },
  errorContainer: {
    padding: 16,
    margin: 16,
    borderRadius: 12,
    backgroundColor: '#FFEBEE',
  },
  errorText: {
    color: '#C62828',
    textAlign: 'center',
  },
});

