import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { socialAPI, uploadAPI } from '../api/client';

const MAX_CONTENT_LENGTH = 500;

export default function CreatePostScreen() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const { user } = useAuth();
  const navigation = useNavigation<any>();

  const [content, setContent] = useState('');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [posting, setPosting] = useState(false);

  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (!permissionResult.granted) {
      Alert.alert('Permission Required', 'Please allow access to your photo library to attach images.');
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

  const takeScreenshot = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    
    if (!permissionResult.granted) {
      Alert.alert('Permission Required', 'Please allow camera access to take screenshots.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setImageUri(result.assets[0].uri);
    }
  };

  const removeImage = () => {
    setImageUri(null);
  };

  const handlePost = async () => {
    if (!content.trim() && !imageUri) {
      Alert.alert('Error', 'Please add some content or an image');
      return;
    }

    if (content.length > MAX_CONTENT_LENGTH) {
      Alert.alert('Error', `Content must be ${MAX_CONTENT_LENGTH} characters or less`);
      return;
    }

    setPosting(true);
    try {
      let uploadedImageUrl: string | undefined;

      if (imageUri) {
        setUploading(true);
        try {
          const uploadRes = await uploadAPI.uploadImage(imageUri, 'chart');
          uploadedImageUrl = uploadRes.data?.url || uploadRes.data?.imageUrl;
        } catch (uploadError) {
          console.error('Image upload failed:', uploadError);
          // Continue without image if upload fails
        }
        setUploading(false);
      }

      await socialAPI.createPost(content.trim(), uploadedImageUrl);
      
      Alert.alert('Success', 'Post created successfully', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error: any) {
      console.error('Error creating post:', error);
      Alert.alert('Error', error.response?.data?.message || 'Failed to create post');
    } finally {
      setPosting(false);
      setUploading(false);
    }
  };

  const remainingChars = MAX_CONTENT_LENGTH - content.length;
  const isOverLimit = remainingChars < 0;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.cancelButton}>
          <Text style={[styles.cancelText, { color: colors.textMuted }]}>Cancel</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Create Post</Text>
        <TouchableOpacity 
          style={[
            styles.postButton, 
            { 
              backgroundColor: (content.trim() || imageUri) && !isOverLimit 
                ? colors.primary 
                : colors.border 
            }
          ]}
          onPress={handlePost}
          disabled={(!content.trim() && !imageUri) || isOverLimit || posting}
        >
          {posting ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.postButtonText}>Post</Text>
          )}
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView 
        style={styles.flex} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView style={styles.content} keyboardShouldPersistTaps="handled">
          <View style={styles.composerContainer}>
            <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
              <Text style={styles.avatarText}>
                {user?.name?.charAt(0).toUpperCase() || '?'}
              </Text>
            </View>
            <View style={styles.inputContainer}>
              <TextInput
                style={[styles.textInput, { color: colors.text }]}
                placeholder="What's on your mind?"
                placeholderTextColor={colors.textMuted}
                value={content}
                onChangeText={setContent}
                multiline
                maxLength={MAX_CONTENT_LENGTH + 50}
                autoFocus
              />
            </View>
          </View>

          {imageUri && (
            <View style={styles.imagePreviewContainer}>
              <Image source={{ uri: imageUri }} style={styles.imagePreview} />
              <TouchableOpacity 
                style={[styles.removeImageButton, { backgroundColor: colors.background }]}
                onPress={removeImage}
              >
                <Ionicons name="close-circle" size={28} color="#EF4444" />
              </TouchableOpacity>
              {uploading && (
                <View style={styles.uploadingOverlay}>
                  <ActivityIndicator size="large" color="#fff" />
                  <Text style={styles.uploadingText}>Uploading...</Text>
                </View>
              )}
            </View>
          )}

          <View style={[styles.charCounter, { borderTopColor: colors.border }]}>
            <Text 
              style={[
                styles.charCountText, 
                { color: isOverLimit ? '#EF4444' : colors.textMuted }
              ]}
            >
              {remainingChars}
            </Text>
          </View>
        </ScrollView>

        <View style={[styles.toolbar, { backgroundColor: colors.card, borderTopColor: colors.border }]}>
          <TouchableOpacity style={styles.toolbarButton} onPress={pickImage}>
            <Ionicons name="image-outline" size={24} color={colors.primary} />
            <Text style={[styles.toolbarText, { color: colors.primary }]}>Gallery</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.toolbarButton} onPress={takeScreenshot}>
            <Ionicons name="camera-outline" size={24} color={colors.primary} />
            <Text style={[styles.toolbarText, { color: colors.primary }]}>Camera</Text>
          </TouchableOpacity>

          <View style={styles.toolbarDivider} />

          <View style={styles.chartHint}>
            <Ionicons name="analytics-outline" size={20} color={colors.textMuted} />
            <Text style={[styles.chartHintText, { color: colors.textMuted }]}>
              Attach chart analysis screenshots
            </Text>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  cancelButton: {
    paddingVertical: 4,
  },
  cancelText: {
    fontSize: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  postButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    minWidth: 70,
    alignItems: 'center',
  },
  postButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  composerContainer: {
    flexDirection: 'row',
    padding: 16,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  inputContainer: {
    flex: 1,
    marginLeft: 12,
  },
  textInput: {
    fontSize: 18,
    lineHeight: 24,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  imagePreviewContainer: {
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  imagePreview: {
    width: '100%',
    height: 200,
    borderRadius: 12,
  },
  removeImageButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    borderRadius: 14,
  },
  uploadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
  },
  uploadingText: {
    color: '#fff',
    marginTop: 8,
    fontSize: 14,
  },
  charCounter: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    alignItems: 'flex-end',
    borderTopWidth: 1,
  },
  charCountText: {
    fontSize: 14,
  },
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
  },
  toolbarButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
  },
  toolbarText: {
    marginLeft: 6,
    fontSize: 14,
    fontWeight: '500',
  },
  toolbarDivider: {
    width: 1,
    height: 24,
    backgroundColor: '#E5E7EB',
    marginRight: 16,
  },
  chartHint: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  chartHintText: {
    marginLeft: 6,
    fontSize: 12,
  },
});
