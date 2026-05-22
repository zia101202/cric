import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Image, TouchableOpacity } from 'react-native';
import {
  Card,
  Text,
  TextInput,
  Button,
  ActivityIndicator,
  IconButton,
} from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';
import { Venue } from '../store/tournamentStore';

/**
 * Props for VenuePicker component
 */
interface VenuePickerProps {
  venue?: Venue | null;
  onSave: (venueData: VenueData) => void;
  onCancel?: () => void;
  isLoading?: boolean;
}

/**
 * Venue data interface
 */
export interface VenueData {
  name: string;
  address: string;
  city: string;
  state?: string;
  country: string;
  latitude: number;
  longitude: number;
  imageUri?: string;
  capacity?: number;
  facilities?: string[];
}

/**
 * VenuePicker component
 * Location picker and image uploader for tournament venues
 * Supports GPS coordinates and venue photo uploads
 */
export const VenuePicker: React.FC<VenuePickerProps> = ({
  venue,
  onSave,
  onCancel,
  isLoading = false,
}) => {
  const [name, setName] = useState(venue?.name || '');
  const [address, setAddress] = useState(venue?.address || '');
  const [city, setCity] = useState(venue?.city || '');
  const [state, setState] = useState(venue?.state || '');
  const [country, setCountry] = useState(venue?.country || '');
  const [latitude, setLatitude] = useState(venue?.latitude?.toString() || '');
  const [longitude, setLongitude] = useState(venue?.longitude?.toString() || '');
  const [capacity, setCapacity] = useState(venue?.capacity?.toString() || '');
  const [imageUri, setImageUri] = useState<string | null>(venue?.imageUrl || null);
  const [uploading, setUploading] = useState(false);

  const handlePickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setImageUri(result.assets[0].uri);
    }
  };

  const handleGetLocation = async () => {
    // In a real app, you would use a location picker or map integration
    // For now, this is a placeholder
    // You can integrate with react-native-maps or a location picker library
  };

  const handleSave = () => {
    if (!name || !address || !city || !country || !latitude || !longitude) {
      return;
    }

    const venueData: VenueData = {
      name,
      address,
      city,
      state: state || undefined,
      country,
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      imageUri: imageUri || undefined,
      capacity: capacity ? parseInt(capacity, 10) : undefined,
    };

    onSave(venueData);
  };

  const isFormValid =
    name && address && city && country && latitude && longitude;

  return (
    <ScrollView style={styles.container}>
      <Card>
        <Card.Title title={venue ? 'Edit Venue' : 'Add Venue'} />
        <Card.Content>
          <TextInput
            label="Venue Name *"
            value={name}
            onChangeText={setName}
            mode="outlined"
            style={styles.input}
          />

          <TextInput
            label="Address *"
            value={address}
            onChangeText={setAddress}
            mode="outlined"
            style={styles.input}
            multiline
          />

          <View style={styles.row}>
            <TextInput
              label="City *"
              value={city}
              onChangeText={setCity}
              mode="outlined"
              style={[styles.input, styles.halfInput]}
            />
            <TextInput
              label="State"
              value={state}
              onChangeText={setState}
              mode="outlined"
              style={[styles.input, styles.halfInput]}
            />
          </View>

          <TextInput
            label="Country *"
            value={country}
            onChangeText={setCountry}
            mode="outlined"
            style={styles.input}
          />

          <Text variant="titleSmall" style={styles.sectionTitle}>
            Location Coordinates
          </Text>
          <View style={styles.row}>
            <TextInput
              label="Latitude *"
              value={latitude}
              onChangeText={setLatitude}
              keyboardType="numeric"
              mode="outlined"
              style={[styles.input, styles.halfInput]}
            />
            <TextInput
              label="Longitude *"
              value={longitude}
              onChangeText={setLongitude}
              keyboardType="numeric"
              mode="outlined"
              style={[styles.input, styles.halfInput]}
            />
          </View>
          <Button
            mode="outlined"
            icon="map-marker"
            onPress={handleGetLocation}
            style={styles.locationButton}
          >
            Pick from Map
          </Button>

          <TextInput
            label="Capacity"
            value={capacity}
            onChangeText={setCapacity}
            keyboardType="numeric"
            mode="outlined"
            style={styles.input}
          />

          <Text variant="titleSmall" style={styles.sectionTitle}>
            Venue Image
          </Text>
          {imageUri && (
            <View style={styles.imageContainer}>
              <Image source={{ uri: imageUri }} style={styles.image} />
              <IconButton
                icon="close"
                size={20}
                onPress={() => setImageUri(null)}
                style={styles.removeImageButton}
              />
            </View>
          )}
          <Button
            mode="outlined"
            icon="camera"
            onPress={handlePickImage}
            style={styles.imageButton}
          >
            {imageUri ? 'Change Image' : 'Upload Image'}
          </Button>

          <View style={styles.actionsContainer}>
            <Button
              mode="contained"
              onPress={handleSave}
              disabled={!isFormValid || isLoading || uploading}
              style={styles.saveButton}
              loading={isLoading || uploading}
            >
              {venue ? 'Update Venue' : 'Save Venue'}
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
  input: {
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfInput: {
    flex: 1,
  },
  sectionTitle: {
    marginTop: 16,
    marginBottom: 12,
    fontWeight: 'bold',
  },
  locationButton: {
    marginBottom: 12,
  },
  imageContainer: {
    position: 'relative',
    marginBottom: 12,
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 8,
  },
  removeImageButton: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  imageButton: {
    marginBottom: 12,
  },
  actionsContainer: {
    marginTop: 24,
    gap: 12,
  },
  saveButton: {
    marginBottom: 8,
  },
  cancelButton: {
    marginBottom: 8,
  },
});

