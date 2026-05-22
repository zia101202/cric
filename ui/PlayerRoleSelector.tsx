import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Chip, Text } from 'react-native-paper';
import { PlayerRole } from '../store/userProfileStore';

interface PlayerRoleSelectorProps {
  selectedRole: PlayerRole | null;
  onRoleSelect: (role: PlayerRole) => void;
  disabled?: boolean;
}

/**
 * Player role selector component
 * Allows users to select their primary playing role
 */
export const PlayerRoleSelector: React.FC<PlayerRoleSelectorProps> = ({
  selectedRole,
  onRoleSelect,
  disabled = false,
}) => {
  const roles: PlayerRole[] = ['Batsman', 'Bowler', 'All-rounder', 'Wicketkeeper'];

  const getRoleIcon = (role: PlayerRole): string => {
    switch (role) {
      case 'Batsman':
        return 'cricket';
      case 'Bowler':
        return 'bowling';
      case 'All-rounder':
        return 'all-inclusive';
      case 'Wicketkeeper':
        return 'shield';
      default:
        return 'help';
    }
  };

  return (
    <View style={styles.container}>
      <Text variant="labelLarge" style={styles.label}>
        Player Role
      </Text>
      <View style={styles.chipsContainer}>
        {roles.map((role) => (
          <Chip
            key={role}
            selected={selectedRole === role}
            onPress={() => !disabled && onRoleSelect(role)}
            icon={getRoleIcon(role)}
            style={[
              styles.chip,
              selectedRole === role && styles.selectedChip,
              disabled && styles.disabledChip,
            ]}
            textStyle={selectedRole === role ? styles.selectedText : styles.text}
            disabled={disabled}
            accessibilityLabel={`Select ${role} role`}
          >
            {role}
          </Chip>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 12,
  },
  label: {
    marginBottom: 12,
    fontWeight: '600',
    color: '#333',
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    marginRight: 8,
    marginBottom: 8,
  },
  selectedChip: {
    backgroundColor: '#007AFF',
  },
  disabledChip: {
    opacity: 0.5,
  },
  text: {
    color: '#666',
  },
  selectedText: {
    color: '#fff',
    fontWeight: '600',
  },
});

