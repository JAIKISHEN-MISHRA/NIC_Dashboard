import React from 'react';
import { View, Button, Text } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';

export type UploadableFile = {
  uri: string;
  name: string;
  mimeType: string;
};

export default function FilePicker({ onFileSelect }: { onFileSelect: (file: UploadableFile) => void }) {
  const pickFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'text/csv',
        copyToCacheDirectory: true,
      });

      if (result.assets && result.assets.length > 0 && result.assets[0].uri) {
        const file = result.assets[0];
        onFileSelect({
          uri: file.uri,
          name: file.name,
          mimeType: file.mimeType || 'text/csv',
        });
      }
    } catch (error) {
      console.error('File pick error:', error);
    }
  };

  return (
    <View style={{ marginVertical: 10 }}>
      <Button title="Choose CSV File" onPress={pickFile} />
    </View>
  );
}
