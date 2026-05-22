import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Platform } from 'react-native';
import {
  Card,
  Text,
  TextInput,
  Button,
  SegmentedButtons,
  Chip,
  Divider,
} from 'react-native-paper';
import { TournamentFormat } from '../store/tournamentStore';

// Conditionally import DateTimePicker only for native platforms
let DateTimePicker: any = null;
if (Platform.OS !== 'web') {
  DateTimePicker = require('@react-native-community/datetimepicker').default;
}

/**
 * Props for MatchScheduler component
 */
interface MatchSchedulerProps {
  tournamentId: string;
  teams: Array<{ id: string; name: string }>;
  venues: Array<{ id: string; name: string }>;
  format: TournamentFormat;
  customOvers?: number;
  onSubmit: (matchData: MatchScheduleData) => void;
  onCancel?: () => void;
  isLoading?: boolean;
}

/**
 * Match schedule data interface
 */
export interface MatchScheduleData {
  team1Id: string;
  team2Id: string;
  scheduledDate: string;
  scheduledTime: string;
  venueId: string;
  format: TournamentFormat;
  overs?: number;
}

/**
 * MatchScheduler component
 * Form for scheduling matches in tournaments
 * Supports date/time selection, team assignment, and format selection
 */
export const MatchScheduler: React.FC<MatchSchedulerProps> = ({
  tournamentId,
  teams,
  venues,
  format,
  customOvers,
  onSubmit,
  onCancel,
  isLoading = false,
}) => {
  const [team1Id, setTeam1Id] = useState<string>('');
  const [team2Id, setTeam2Id] = useState<string>('');
  const [venueId, setVenueId] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedTime, setSelectedTime] = useState<Date>(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState<TournamentFormat>(format);
  const [overs, setOvers] = useState<string>(customOvers?.toString() || '');

  const formatOptions: TournamentFormat[] = ['T10', 'T20', 'ODI', 'custom'];

  const handleSubmit = () => {
    if (!team1Id || !team2Id || !venueId) {
      return;
    }

    if (team1Id === team2Id) {
      return;
    }

    const matchData: MatchScheduleData = {
      team1Id,
      team2Id,
      scheduledDate: selectedDate.toISOString().split('T')[0],
      scheduledTime: selectedTime.toTimeString().slice(0, 5),
      venueId,
      format: selectedFormat,
      overs: selectedFormat === 'custom' && overs ? parseInt(overs, 10) : undefined,
    };

    onSubmit(matchData);
  };

  const isFormValid = team1Id && team2Id && venueId && team1Id !== team2Id;

  return (
    <ScrollView style={styles.container}>
      <Card>
        <Card.Title title="Schedule Match" />
        <Divider />
        <Card.Content>
          <Text variant="titleSmall" style={styles.sectionTitle}>
            Select Teams
          </Text>
          <View style={styles.teamSelection}>
            <View style={styles.teamContainer}>
              <Text variant="labelMedium" style={styles.teamLabel}>
                Team 1
              </Text>
              <View style={styles.chipContainer}>
                {teams.map((team) => (
                  <Chip
                    key={team.id}
                    selected={team1Id === team.id}
                    onPress={() => setTeam1Id(team.id)}
                    style={styles.teamChip}
                  >
                    {team.name}
                  </Chip>
                ))}
              </View>
            </View>
            <View style={styles.teamContainer}>
              <Text variant="labelMedium" style={styles.teamLabel}>
                Team 2
              </Text>
              <View style={styles.chipContainer}>
                {teams.map((team) => (
                  <Chip
                    key={team.id}
                    selected={team2Id === team.id}
                    onPress={() => setTeam2Id(team.id)}
                    style={styles.teamChip}
                    disabled={team.id === team1Id}
                  >
                    {team.name}
                  </Chip>
                ))}
              </View>
            </View>
          </View>

          <Divider style={styles.divider} />

          <Text variant="titleSmall" style={styles.sectionTitle}>
            Select Venue
          </Text>
          <View style={styles.chipContainer}>
            {venues.map((venue) => (
              <Chip
                key={venue.id}
                selected={venueId === venue.id}
                onPress={() => setVenueId(venue.id)}
                style={styles.venueChip}
              >
                {venue.name}
              </Chip>
            ))}
          </View>

          <Divider style={styles.divider} />

          <Text variant="titleSmall" style={styles.sectionTitle}>
            Match Format
          </Text>
          <SegmentedButtons
            value={selectedFormat}
            onValueChange={(value) => setSelectedFormat(value as TournamentFormat)}
            buttons={formatOptions.map((f) => ({
              value: f,
              label: f,
            }))}
            style={styles.formatButtons}
          />
          {selectedFormat === 'custom' && (
            <TextInput
              label="Overs"
              value={overs}
              onChangeText={setOvers}
              keyboardType="numeric"
              mode="outlined"
              style={styles.oversInput}
            />
          )}

          <Divider style={styles.divider} />

          <Text variant="titleSmall" style={styles.sectionTitle}>
            Date & Time
          </Text>
          {Platform.OS === 'web' ? (
            <>
              <View style={styles.webInputContainer}>
                <Text variant="labelMedium" style={styles.webLabel}>
                  Date
                </Text>
                {/* @ts-ignore - web-specific HTML input */}
                <input
                  type="date"
                  value={selectedDate.toISOString().split('T')[0]}
                  onChange={(e) => {
                    const date = new Date(e.target.value);
                    if (!isNaN(date.getTime())) {
                      setSelectedDate(date);
                    }
                  }}
                  style={styles.webInput}
                />
              </View>
              <View style={styles.webInputContainer}>
                <Text variant="labelMedium" style={styles.webLabel}>
                  Time
                </Text>
                {/* @ts-ignore - web-specific HTML input */}
                <input
                  type="time"
                  value={selectedTime.toTimeString().slice(0, 5)}
                  onChange={(e) => {
                    const [hours, minutes] = e.target.value.split(':');
                    const time = new Date(selectedTime);
                    time.setHours(parseInt(hours, 10), parseInt(minutes, 10));
                    setSelectedTime(time);
                  }}
                  style={styles.webInput}
                />
              </View>
            </>
          ) : (
            <>
              <Button
                mode="outlined"
                onPress={() => setShowDatePicker(true)}
                style={styles.dateButton}
              >
                Date: {selectedDate.toLocaleDateString()}
              </Button>
              {showDatePicker && DateTimePicker && (
                <DateTimePicker
                  value={selectedDate}
                  mode="date"
                  display="default"
                  onChange={(event, date) => {
                    setShowDatePicker(false);
                    if (date) setSelectedDate(date);
                  }}
                />
              )}
              <Button
                mode="outlined"
                onPress={() => setShowTimePicker(true)}
                style={styles.timeButton}
              >
                Time: {selectedTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </Button>
              {showTimePicker && DateTimePicker && (
                <DateTimePicker
                  value={selectedTime}
                  mode="time"
                  display="default"
                  onChange={(event, time) => {
                    setShowTimePicker(false);
                    if (time) setSelectedTime(time);
                  }}
                />
              )}
            </>
          )}

          <View style={styles.actionsContainer}>
            <Button
              mode="contained"
              onPress={handleSubmit}
              disabled={!isFormValid || isLoading}
              style={styles.submitButton}
              loading={isLoading}
            >
              Schedule Match
            </Button>
            {onCancel && (
              <Button mode="outlined" onPress={onCancel} style={styles.cancelButton}>
                Cancel
              </Button>
            )}
          </View>
        </Card.Content>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  sectionTitle: {
    marginTop: 16,
    marginBottom: 12,
    fontWeight: 'bold',
  },
  teamSelection: {
    marginBottom: 16,
  },
  teamContainer: {
    marginBottom: 16,
  },
  teamLabel: {
    marginBottom: 8,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  teamChip: {
    marginRight: 8,
    marginBottom: 8,
  },
  venueChip: {
    marginRight: 8,
    marginBottom: 8,
  },
  divider: {
    marginVertical: 16,
  },
  formatButtons: {
    marginBottom: 16,
  },
  oversInput: {
    marginTop: 12,
  },
  dateButton: {
    marginBottom: 12,
  },
  timeButton: {
    marginBottom: 12,
  },
  actionsContainer: {
    marginTop: 24,
    gap: 12,
  },
  submitButton: {
    marginBottom: 8,
  },
  cancelButton: {
    marginBottom: 8,
  },
  webInputContainer: {
    marginBottom: 12,
  },
  webLabel: {
    marginBottom: 8,
  },
  webInput: {
    width: '100%',
    padding: 12,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    fontSize: 16,
    fontFamily: 'System',
  },
});

