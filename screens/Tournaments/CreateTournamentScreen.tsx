import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { TextInput, Button, Text, SegmentedButtons, ActivityIndicator } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { useTournamentManagement } from '../../hooks/useTournamentManagement';
import type { TournamentFormat, TournamentType, PrizeDistribution } from '../../store/tournamentManagementStore';

/**
 * Create Tournament Screen
 * Form for creating a new tournament
 */
export function CreateTournamentScreen() {
  const navigation = useNavigation();
  const { createTournament, isCreating, error } = useTournamentManagement();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [format, setFormat] = useState<TournamentFormat>('T20');
  const [type, setType] = useState<TournamentType>('league');
  const [entryFee, setEntryFee] = useState('');
  const [minTeams, setMinTeams] = useState('8');

  const formatOptions = [
    { value: 'T10', label: 'T10' },
    { value: 'T20', label: 'T20' },
    { value: 'ODI', label: 'ODI' },
  ];

  const typeOptions = [
    { value: 'knockout', label: 'Knockout' },
    { value: 'league', label: 'League' },
    { value: 'group', label: 'Group' },
  ];

  const handleCreate = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter a tournament name');
      return;
    }

    const entryFeeNum = parseFloat(entryFee);
    if (isNaN(entryFeeNum) || entryFeeNum < 0) {
      Alert.alert('Error', 'Please enter a valid entry fee');
      return;
    }

    const minTeamsNum = parseInt(minTeams, 10);
    if (isNaN(minTeamsNum) || minTeamsNum < 2) {
      Alert.alert('Error', 'Minimum teams must be at least 2');
      return;
    }

    // Default prize distribution: 50% first, 30% second, 20% third
    const prizeDistribution: PrizeDistribution[] = [
      { position: 1, amount: entryFeeNum * minTeamsNum * 0.5, percentage: 50 },
      { position: 2, amount: entryFeeNum * minTeamsNum * 0.3, percentage: 30 },
      { position: 3, amount: entryFeeNum * minTeamsNum * 0.2, percentage: 20 },
    ];

    const result = await createTournament({
      name: name.trim(),
      description: description.trim() || undefined,
      format,
      type,
      entryFee: entryFeeNum,
      prizeDistribution,
      minTeams: minTeamsNum,
    });

    if (result.success) {
      Alert.alert('Success', 'Tournament created successfully!', [
        {
          text: 'OK',
          onPress: () => navigation.goBack(),
        },
      ]);
    } else {
      Alert.alert('Error', error || 'Failed to create tournament');
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text variant="headlineSmall" style={styles.title}>
        Create Tournament
      </Text>

      <TextInput
        label="Tournament Name *"
        value={name}
        onChangeText={setName}
        mode="outlined"
        style={styles.input}
        autoCapitalize="words"
      />

      <TextInput
        label="Description"
        value={description}
        onChangeText={setDescription}
        mode="outlined"
        style={styles.input}
        multiline
        numberOfLines={4}
      />

      <View style={styles.section}>
        <Text variant="titleMedium" style={styles.sectionTitle}>
          Format
        </Text>
        <SegmentedButtons
          value={format}
          onValueChange={(value) => setFormat(value as TournamentFormat)}
          buttons={formatOptions}
          style={styles.segmentedButtons}
        />
      </View>

      <View style={styles.section}>
        <Text variant="titleMedium" style={styles.sectionTitle}>
          Tournament Type
        </Text>
        <SegmentedButtons
          value={type}
          onValueChange={(value) => setType(value as TournamentType)}
          buttons={typeOptions}
          style={styles.segmentedButtons}
        />
      </View>

      <TextInput
        label="Entry Fee *"
        value={entryFee}
        onChangeText={setEntryFee}
        mode="outlined"
        style={styles.input}
        keyboardType="numeric"
        left={<TextInput.Icon icon="currency-usd" />}
      />

      <TextInput
        label="Minimum Teams *"
        value={minTeams}
        onChangeText={setMinTeams}
        mode="outlined"
        style={styles.input}
        keyboardType="numeric"
        left={<TextInput.Icon icon="account-group" />}
      />

      {error && (
        <Text variant="bodyMedium" style={styles.error}>
          {error}
        </Text>
      )}

      <View style={styles.buttonContainer}>
        <Button
          mode="outlined"
          onPress={() => navigation.goBack()}
          style={styles.button}
          disabled={isCreating}
        >
          Cancel
        </Button>
        <Button
          mode="contained"
          onPress={handleCreate}
          style={styles.button}
          disabled={isCreating || !name.trim()}
          loading={isCreating}
        >
          Create Tournament
        </Button>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    padding: 16,
  },
  title: {
    marginBottom: 24,
    fontWeight: 'bold',
  },
  input: {
    marginBottom: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    marginBottom: 8,
    fontWeight: '600',
  },
  segmentedButtons: {
    marginTop: 8,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
    gap: 12,
  },
  button: {
    flex: 1,
  },
  error: {
    color: '#d32f2f',
    marginTop: 8,
    marginBottom: 8,
  },
});

