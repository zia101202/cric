import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { TextInput, Button, Text, ActivityIndicator } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { useTeam } from '../../hooks/useTeam';

/**
 * Create Team Screen
 * Form for creating a new team
 */
export function CreateTeamScreen() {
  const navigation = useNavigation();
  const { createTeam, isCreating, error } = useTeam();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [minPlayers, setMinPlayers] = useState('11');

  const handleCreate = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter a team name');
      return;
    }

    const minPlayersNum = parseInt(minPlayers, 10);
    if (isNaN(minPlayersNum) || minPlayersNum < 2) {
      Alert.alert('Error', 'Minimum players must be at least 2');
      return;
    }

    const result = await createTeam({
      name: name.trim(),
      description: description.trim() || undefined,
      minPlayers: minPlayersNum,
    });

    if (result.success) {
      Alert.alert('Success', 'Team created successfully!', [
        {
          text: 'OK',
          onPress: () => navigation.goBack(),
        },
      ]);
    } else {
      Alert.alert('Error', error || 'Failed to create team');
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text variant="headlineSmall" style={styles.title}>
        Create Team
      </Text>

      <TextInput
        label="Team Name *"
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

      <TextInput
        label="Minimum Players *"
        value={minPlayers}
        onChangeText={setMinPlayers}
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
          Create Team
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

