import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Card, TextInput, Button, Text, HelperText } from 'react-native-paper';
import { validateRuns, validateWickets, validateOvers } from '../utils/matchValidation';

interface MatchScoreInputProps {
  teamName: string;
  runs: number;
  wickets: number;
  overs: number;
  onRunsChange: (runs: number) => void;
  onWicketsChange: (wickets: number) => void;
  onOversChange: (overs: number) => void;
  maxOvers?: number;
  disabled?: boolean;
  showStrikeRate?: boolean;
  strikeRate?: number;
  showEconomy?: boolean;
  economy?: number;
}

/**
 * Match score input component
 * Provides inputs for runs, wickets, and overs with validation
 */
export const MatchScoreInput: React.FC<MatchScoreInputProps> = ({
  teamName,
  runs,
  wickets,
  overs,
  onRunsChange,
  onWicketsChange,
  onOversChange,
  maxOvers,
  disabled = false,
  showStrikeRate = false,
  strikeRate,
  showEconomy = false,
  economy,
}) => {
  const [runsError, setRunsError] = useState<string>('');
  const [wicketsError, setWicketsError] = useState<string>('');
  const [oversError, setOversError] = useState<string>('');

  const handleRunsChange = (text: string) => {
    const value = parseInt(text, 10) || 0;
    const validation = validateRuns(value);
    if (!validation.isValid) {
      setRunsError(validation.error || '');
    } else {
      setRunsError('');
      onRunsChange(value);
    }
  };

  const handleWicketsChange = (text: string) => {
    const value = parseInt(text, 10) || 0;
    const validation = validateWickets(value);
    if (!validation.isValid) {
      setWicketsError(validation.error || '');
    } else {
      setWicketsError('');
      onWicketsChange(value);
    }
  };

  const handleOversChange = (text: string) => {
    const value = parseFloat(text) || 0;
    const validation = validateOvers(value, maxOvers);
    if (!validation.isValid) {
      setOversError(validation.error || '');
    } else {
      setOversError('');
      onOversChange(value);
    }
  };

  return (
    <Card style={styles.card} mode="outlined">
      <Card.Content>
        <Text variant="titleMedium" style={styles.teamName}>
          {teamName}
        </Text>

        <View style={styles.inputsContainer}>
          <View style={styles.inputGroup}>
            <TextInput
              label="Runs"
              value={runs.toString()}
              onChangeText={handleRunsChange}
              keyboardType="numeric"
              mode="outlined"
              disabled={disabled}
              error={!!runsError}
              style={styles.input}
              accessibilityLabel={`${teamName} runs input`}
            />
            {runsError ? <HelperText type="error">{runsError}</HelperText> : null}
          </View>

          <View style={styles.inputGroup}>
            <TextInput
              label="Wickets"
              value={wickets.toString()}
              onChangeText={handleWicketsChange}
              keyboardType="numeric"
              mode="outlined"
              disabled={disabled}
              error={!!wicketsError}
              style={styles.input}
              accessibilityLabel={`${teamName} wickets input`}
            />
            {wicketsError ? <HelperText type="error">{wicketsError}</HelperText> : null}
          </View>

          <View style={styles.inputGroup}>
            <TextInput
              label="Overs"
              value={overs.toString()}
              onChangeText={handleOversChange}
              keyboardType="decimal-pad"
              mode="outlined"
              disabled={disabled}
              error={!!oversError}
              style={styles.input}
              accessibilityLabel={`${teamName} overs input`}
            />
            {oversError ? <HelperText type="error">{oversError}</HelperText> : null}
          </View>
        </View>

        {(showStrikeRate || showEconomy) && (
          <View style={styles.statsContainer}>
            {showStrikeRate && strikeRate !== undefined && (
              <View style={styles.statItem}>
                <Text variant="bodySmall" style={styles.statLabel}>
                  Strike Rate
                </Text>
                <Text variant="bodyMedium" style={styles.statValue}>
                  {strikeRate.toFixed(2)}
                </Text>
              </View>
            )}
            {showEconomy && economy !== undefined && (
              <View style={styles.statItem}>
                <Text variant="bodySmall" style={styles.statLabel}>
                  Economy
                </Text>
                <Text variant="bodyMedium" style={styles.statValue}>
                  {economy.toFixed(2)}
                </Text>
              </View>
            )}
          </View>
        )}
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginVertical: 8,
  },
  teamName: {
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  inputsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  inputGroup: {
    flex: 1,
  },
  input: {
    backgroundColor: '#fff',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    color: '#666',
    marginBottom: 4,
  },
  statValue: {
    fontWeight: '600',
    color: '#007AFF',
  },
});

