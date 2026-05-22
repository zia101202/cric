import React from 'react';
import { Button, Menu, IconButton } from 'react-native-paper';
import { View, StyleSheet } from 'react-native';
import { ExportFormat } from '../hooks/useExport';

interface ExportButtonProps {
  onExport: (format: ExportFormat) => void;
  loading?: boolean;
  disabled?: boolean;
}

/**
 * ExportButton component
 * Provides export options (CSV, PDF, JSON) for match scorecards and tournament data
 */
export const ExportButton: React.FC<ExportButtonProps> = ({
  onExport,
  loading = false,
  disabled = false,
}) => {
  const [menuVisible, setMenuVisible] = React.useState(false);

  const handleExport = (format: ExportFormat) => {
    setMenuVisible(false);
    onExport(format);
  };

  return (
    <View style={styles.container}>
      <Menu
        visible={menuVisible}
        onDismiss={() => setMenuVisible(false)}
        anchor={
          <IconButton
            icon="download"
            size={24}
            onPress={() => setMenuVisible(true)}
            disabled={disabled || loading}
            accessibilityLabel="Export options"
          />
        }
      >
        <Menu.Item
          onPress={() => handleExport('csv')}
          title="Export as CSV"
          leadingIcon="file-document-outline"
          accessibilityLabel="Export as CSV"
        />
        <Menu.Item
          onPress={() => handleExport('json')}
          title="Export as JSON"
          leadingIcon="code-json"
          accessibilityLabel="Export as JSON"
        />
        <Menu.Item
          onPress={() => handleExport('pdf')}
          title="Export as PDF"
          leadingIcon="file-pdf-box"
          accessibilityLabel="Export as PDF (requires server)"
        />
      </Menu>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});

