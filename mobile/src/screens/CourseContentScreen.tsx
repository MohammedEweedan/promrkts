import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Linking,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useTheme } from '../context/ThemeContext';
import { Header } from '../components';
import api from '../api/client';

type Resource = {
  id: string;
  type: 'pdf' | 'video';
  url: string;
  title?: string;
  description?: string;
  duration?: number;
  size?: number;
};

type Lesson = {
  id: string;
  title: string;
  description?: string;
  order: number;
  resources?: Resource[];
};

type Course = {
  id: string;
  name: string;
  description: string;
  lessons?: Lesson[];
  resources?: Resource[];
};

export default function CourseContentScreen() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { courseId } = route.params || {};

  const [loading, setLoading] = useState(true);
  const [course, setCourse] = useState<Course | null>(null);
  const [expandedLessons, setExpandedLessons] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadCourseContent();
  }, [courseId]);

  const loadCourseContent = async () => {
    try {
      const resp = await api.get(`/courses/${courseId}`);
      setCourse(resp.data);
    } catch (error) {
      console.error('Failed to load course content:', error);
      Alert.alert(t('common.error'), t('errors.load_failed'));
    } finally {
      setLoading(false);
    }
  };

  const toggleLesson = (lessonId: string) => {
    setExpandedLessons(prev => {
      const newSet = new Set(prev);
      if (newSet.has(lessonId)) {
        newSet.delete(lessonId);
      } else {
        newSet.add(lessonId);
      }
      return newSet;
    });
  };

  const openResource = async (resource: Resource) => {
    try {
      const canOpen = await Linking.canOpenURL(resource.url);
      if (canOpen) {
        await Linking.openURL(resource.url);
      } else {
        Alert.alert(t('common.error'), t('common.error'));
      }
    } catch (error) {
      console.error('Failed to open resource:', error);
      Alert.alert(t('common.error'), t('common.error'));
    }
  };

  const getResourceIcon = (type: string) => {
    switch (type) {
      case 'pdf':
        return 'document-text';
      case 'video':
        return 'play-circle';
      default:
        return 'document';
    }
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return '';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatSize = (bytes?: number) => {
    if (!bytes) return '';
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(1)} MB`;
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['left', 'right']}>
        <Header showBack onBackPress={() => navigation.goBack()} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (!course) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['left', 'right']}>
        <Header showBack onBackPress={() => navigation.goBack()} />
        <View style={styles.emptyContainer}>
          <Ionicons name="alert-circle-outline" size={64} color={colors.textMuted} />
          <Text style={[styles.emptyText, { color: colors.textMuted }]}>
            {t('store.no_courses')}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['left', 'right']}>
      <Header showBack onBackPress={() => navigation.goBack()} />
      
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Course Header */}
        <View style={[styles.header, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
          <Text style={[styles.courseTitle, { color: colors.text }]}>{course.name}</Text>
          {course.description && (
            <Text style={[styles.courseDescription, { color: colors.textMuted }]}>
              {course.description}
            </Text>
          )}
        </View>

        {/* Course Resources */}
        {course.resources && course.resources.length > 0 && (
          <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              {t('store.courses')}
            </Text>
            {course.resources.map((resource) => (
              <TouchableOpacity
                key={resource.id}
                style={[styles.resourceItem, { borderBottomColor: colors.border }]}
                onPress={() => openResource(resource)}
              >
                <View style={[styles.resourceIcon, { backgroundColor: colors.primary + '20' }]}>
                  <Ionicons name={getResourceIcon(resource.type) as any} size={24} color={colors.primary} />
                </View>
                <View style={styles.resourceInfo}>
                  <Text style={[styles.resourceTitle, { color: colors.text }]}>
                    {resource.title || `${resource.type.toUpperCase()} ${t('common.loading')}`}
                  </Text>
                  {resource.description && (
                    <Text style={[styles.resourceDescription, { color: colors.textMuted }]} numberOfLines={2}>
                      {resource.description}
                    </Text>
                  )}
                  <View style={styles.resourceMeta}>
                    {resource.duration && (
                      <Text style={[styles.metaText, { color: colors.textMuted }]}>
                        {formatDuration(resource.duration)}
                      </Text>
                    )}
                    {resource.size && (
                      <Text style={[styles.metaText, { color: colors.textMuted }]}>
                        {formatSize(resource.size)}
                      </Text>
                    )}
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Lessons */}
        {course.lessons && course.lessons.length > 0 && (
          <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              {t('progress.lessons')}
            </Text>
            {course.lessons.sort((a, b) => a.order - b.order).map((lesson, index) => (
              <View key={lesson.id}>
                <TouchableOpacity
                  style={[styles.lessonHeader, { borderBottomColor: colors.border }]}
                  onPress={() => toggleLesson(lesson.id)}
                >
                  <View style={[styles.lessonNumber, { backgroundColor: colors.primary + '20' }]}>
                    <Text style={[styles.lessonNumberText, { color: colors.primary }]}>
                      {index + 1}
                    </Text>
                  </View>
                  <View style={styles.lessonInfo}>
                    <Text style={[styles.lessonTitle, { color: colors.text }]}>{lesson.title}</Text>
                    {lesson.description && (
                      <Text style={[styles.lessonDescription, { color: colors.textMuted }]} numberOfLines={2}>
                        {lesson.description}
                      </Text>
                    )}
                  </View>
                  <Ionicons
                    name={expandedLessons.has(lesson.id) ? 'chevron-up' : 'chevron-down'}
                    size={20}
                    color={colors.textMuted}
                  />
                </TouchableOpacity>

                {expandedLessons.has(lesson.id) && lesson.resources && (
                  <View style={styles.lessonResources}>
                    {lesson.resources.map((resource) => (
                      <TouchableOpacity
                        key={resource.id}
                        style={[styles.resourceItem, { borderBottomColor: colors.border }]}
                        onPress={() => openResource(resource)}
                      >
                        <View style={[styles.resourceIcon, { backgroundColor: colors.primary + '20' }]}>
                          <Ionicons name={getResourceIcon(resource.type) as any} size={20} color={colors.primary} />
                        </View>
                        <View style={styles.resourceInfo}>
                          <Text style={[styles.resourceTitle, { color: colors.text }]}>
                            {resource.title || `${resource.type.toUpperCase()}`}
                          </Text>
                          {resource.duration && (
                            <Text style={[styles.metaText, { color: colors.textMuted }]}>
                              {formatDuration(resource.duration)}
                            </Text>
                          )}
                        </View>
                        <Ionicons name="play-circle" size={24} color={colors.primary} />
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 16,
    marginTop: 16,
    textAlign: 'center',
  },
  scrollContent: {
    paddingBottom: 32,
  },
  header: {
    margin: 16,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
  },
  courseTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
  },
  courseDescription: {
    fontSize: 15,
    lineHeight: 22,
  },
  section: {
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
  },
  resourceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  resourceIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  resourceInfo: {
    flex: 1,
  },
  resourceTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  resourceDescription: {
    fontSize: 14,
    marginBottom: 4,
  },
  resourceMeta: {
    flexDirection: 'row',
    gap: 12,
  },
  metaText: {
    fontSize: 12,
  },
  lessonHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  lessonNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  lessonNumberText: {
    fontSize: 14,
    fontWeight: '700',
  },
  lessonInfo: {
    flex: 1,
  },
  lessonTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  lessonDescription: {
    fontSize: 14,
  },
  lessonResources: {
    paddingLeft: 44,
  },
});
