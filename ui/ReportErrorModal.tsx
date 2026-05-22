import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import {
  Dialog,
  Text,
  TextInput,
  Button,
  RadioButton,
  HelperText,
  ActivityIndicator,
} from 'react-native-paper';
import { ReportType, CorrectedScore } from '../store/reportingStore';
import { validateRuns, validateWickets, validateOvers } from '../utils/matchValidation';

interface ReportErrorModalProps {
  visible: boolean;
  onDismiss: () => void;
  onSubmit: (
    reportType: ReportType,
    description: string,
    correctedScore?: CorrectedScore
  ) => Promise<void>;
  playerId?: string;
  playerName?: string;
  originalRuns?: number;
  originalWickets?: number;
  originalOvers?: number;
  isLoading?: boolean;
}

/**
 * Report error modal component
 * Allows users to report wrong match data and propose corrections
 */
export const ReportErrorModal: React.FC<ReportErrorModalProps> = ({
  visible,
  onDismiss,
  onSubmit,
  playerId,
  playerName,
  originalRuns,
  originalWickets,
  originalOvers,
  isLoading = false,
}) => {
  const [reportType, setReportType] = useState<ReportType>(
    playerId ? 'player_score' : 'match_result'
  );
  const [description, setDescription] = useState('');
  const [proposedRuns, setProposedRuns] = useState<string>('');
  const [proposedWickets, setProposedWickets] = useState<string>('');
  const [proposedOvers, setProposedOvers] = useState<string>('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const handleSubmit = async () => {
    const newErrors: { [key: string]: string } = {};

    if (!description.trim()) {
      newErrors.description = 'Description is required';
    }

    let correctedScore: CorrectedScore | undefined;

    if (reportType === 'player_score' && playerId) {
      if (!proposedRuns) {
        newErrors.proposedRuns = 'Proposed runs is required';
      } else {
        const runsValidation = validateRuns(parseInt(proposedRuns, 10));
        if (!runsValidation.isValid) {
          newErrors.proposedRuns = runsValidation.error || '';
        }
      }

      if (proposedWickets) {
        const wicketsValidation = validateWickets(parseInt(proposedWickets, 10));
        if (!wicketsValidation.isValid) {
          newErrors.proposedWickets = wicketsValidation.error || '';
        }
      }

      if (proposedOvers) {
        const oversValidation = validateOvers(parseFloat(proposedOvers));
        if (!oversValidation.isValid) {
          newErrors.proposedOvers = oversValidation.error || '';
        }
      }

      if (Object.keys(newErrors).length === 0) {
        correctedScore = {
          playerId,
          playerName: playerName || 'Unknown',
          originalRuns: originalRuns || 0,
          proposedRuns: parseInt(proposedRuns, 10),
          originalWickets: originalWickets,
          proposedWickets: proposedWickets ? parseInt(proposedWickets, 10) : undefined,
          originalOvers: originalOvers,
          proposedOvers: proposedOvers ? parseFloat(proposedOvers) : undefined,
          reason: description,
        };
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    await onSubmit(reportType, description, correctedScore);
    handleReset();
  };

  const handleReset = () => {
    setDescription('');
    setProposedRuns('');
    setProposedWickets('');
    setProposedOvers('');
    setErrors({});
  };

  const handleDismiss = () => {
    handleReset();
    onDismiss();
  };

  return (
    <Dialog visible={visible} onDismiss={handleDismiss} style={styles.dialog}>
      <Dialog.Title>Report Error</Dialog.Title>
      <Dialog.ScrollArea>
        <ScrollView style={styles.scrollView}>
          <View style={styles.content}>
            <Text variant="bodyMedium" style={styles.instructionText}>
              If you notice incorrect data in this match, please report it. Two reports from
              different team members will trigger a review.
            </Text>

            <View style={styles.radioGroup}>
              <RadioButton.Group
                onValueChange={(value) => setReportType(value as ReportType)}
                value={reportType}
              >
                {playerId ? (
                  <View style={styles.radioItem}>
                    <RadioButton value="player_score" />
                    <Text variant="bodyMedium">Wrong Player Score</Text>
                  </View>
                ) : null}
                <View style={styles.radioItem}>
                  <RadioButton value="match_result" />
                  <Text variant="bodyMedium">Wrong Match Result</Text>
                </View>
                <View style={styles.radioItem}>
                  <RadioButton value="entire_match" />
                  <Text variant="bodyMedium">Entire Match is Incorrect</Text>
                </View>
              </RadioButton.Group>
            </View>

            {reportType === 'player_score' && playerId && (
              <View style={styles.correctionContainer}>
                <Text variant="titleSmall" style={styles.sectionTitle}>
                  Proposed Correction for {playerName}
                </Text>

                <TextInput
                  label="Proposed Runs *"
                  value={proposedRuns}
                  onChangeText={(text) => {
                    setProposedRuns(text);
                    if (errors.proposedRuns) {
                      setErrors({ ...errors, proposedRuns: '' });
                    }
                  }}
                  keyboardType="numeric"
                  mode="outlined"
                  error={!!errors.proposedRuns}
                  style={styles.input}
                  accessibilityLabel="Proposed runs input"
                />
                {errors.proposedRuns && (
                  <HelperText type="error">{errors.proposedRuns}</HelperText>
                )}

                <TextInput
                  label="Proposed Wickets (optional)"
                  value={proposedWickets}
                  onChangeText={(text) => {
                    setProposedWickets(text);
                    if (errors.proposedWickets) {
                      setErrors({ ...errors, proposedWickets: '' });
                    }
                  }}
                  keyboardType="numeric"
                  mode="outlined"
                  error={!!errors.proposedWickets}
                  style={styles.input}
                  accessibilityLabel="Proposed wickets input"
                />
                {errors.proposedWickets && (
                  <HelperText type="error">{errors.proposedWickets}</HelperText>
                )}

                <TextInput
                  label="Proposed Overs (optional)"
                  value={proposedOvers}
                  onChangeText={(text) => {
                    setProposedOvers(text);
                    if (errors.proposedOvers) {
                      setErrors({ ...errors, proposedOvers: '' });
                    }
                  }}
                  keyboardType="decimal-pad"
                  mode="outlined"
                  error={!!errors.proposedOvers}
                  style={styles.input}
                  accessibilityLabel="Proposed overs input"
                />
                {errors.proposedOvers && (
                  <HelperText type="error">{errors.proposedOvers}</HelperText>
                )}
              </View>
            )}

            <TextInput
              label="Description *"
              value={description}
              onChangeText={(text) => {
                setDescription(text);
                if (errors.description) {
                  setErrors({ ...errors, description: '' });
                }
              }}
              mode="outlined"
              multiline
              numberOfLines={4}
              error={!!errors.description}
              style={styles.input}
              accessibilityLabel="Error description input"
            />
            {errors.description && <HelperText type="error">{errors.description}</HelperText>}
          </View>
        </ScrollView>
      </Dialog.ScrollArea>
      <Dialog.Actions>
        <Button onPress={handleDismiss} disabled={isLoading}>
          Cancel
        </Button>
        <Button
          onPress={handleSubmit}
          mode="contained"
          disabled={isLoading}
          accessibilityLabel="Submit error report"
        >
          {isLoading ? <ActivityIndicator size="small" color="#fff" /> : 'Submit Report'}
        </Button>
      </Dialog.Actions>
    </Dialog>
  );
};

const styles = StyleSheet.create({
  dialog: {
    maxHeight: '80%',
  },
  scrollView: {
    maxHeight: 400,
  },
  content: {
    padding: 8,
  },
  instructionText: {
    marginBottom: 16,
    color: '#666',
  },
  radioGroup: {
    marginBottom: 16,
  },
  radioItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  correctionContainer: {
    marginTop: 16,
    marginBottom: 16,
    padding: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  sectionTitle: {
    fontWeight: '600',
    marginBottom: 12,
  },
  input: {
    marginBottom: 8,
    backgroundColor: '#fff',
  },
});

