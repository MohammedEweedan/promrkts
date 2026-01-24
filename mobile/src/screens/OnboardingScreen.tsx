import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Image,
  FlatList,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

const { width, height } = Dimensions.get('window');

type OnboardingSlide = {
  id: string;
  icon: keyof typeof Ionicons.glyphMap;
  titleKey: string;
  descriptionKey: string;
};

const SLIDES: OnboardingSlide[] = [
  {
    id: '1',
    icon: 'trending-up',
    titleKey: 'onboarding.slide1_title',
    descriptionKey: 'onboarding.slide1_desc',
  },
  {
    id: '2',
    icon: 'school',
    titleKey: 'onboarding.slide2_title',
    descriptionKey: 'onboarding.slide2_desc',
  },
  {
    id: '3',
    icon: 'people',
    titleKey: 'onboarding.slide3_title',
    descriptionKey: 'onboarding.slide3_desc',
  },
  {
    id: '4',
    icon: 'analytics',
    titleKey: 'onboarding.slide4_title',
    descriptionKey: 'onboarding.slide4_desc',
  },
];

type Props = {
  onComplete: () => void;
  onLogin: () => void;
  onRegister: () => void;
};

export default function OnboardingScreen({ onComplete, onLogin, onRegister }: Props) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const { setHasSeenOnboarding } = useAuth();
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const scrollX = useRef(new Animated.Value(0)).current;

  const handleNext = () => {
    if (currentIndex < SLIDES.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handleSkip = async () => {
    await setHasSeenOnboarding(true);
    onComplete();
  };

  const handleGetStarted = async () => {
    await setHasSeenOnboarding(true);
    onComplete();
  };

  const renderSlide = ({ item }: { item: OnboardingSlide }) => (
    <View style={[styles.slide, { width }]}>
      <View style={[styles.iconContainer, { backgroundColor: colors.primary + '20' }]}>
        <Ionicons name={item.icon} size={80} color={colors.primary} />
      </View>
      <Text style={[styles.title, { color: colors.text }]}>
        {t(item.titleKey)}
      </Text>
      <Text style={[styles.description, { color: colors.textMuted }]}>
        {t(item.descriptionKey)}
      </Text>
    </View>
  );

  const renderPagination = () => (
    <View style={styles.pagination}>
      {SLIDES.map((_, index) => {
        const inputRange = [(index - 1) * width, index * width, (index + 1) * width];
        const dotWidth = scrollX.interpolate({
          inputRange,
          outputRange: [8, 24, 8],
          extrapolate: 'clamp',
        });
        const opacity = scrollX.interpolate({
          inputRange,
          outputRange: [0.3, 1, 0.3],
          extrapolate: 'clamp',
        });

        return (
          <Animated.View
            key={index}
            style={[
              styles.dot,
              { backgroundColor: colors.primary, width: dotWidth, opacity },
            ]}
          />
        );
      })}
    </View>
  );

  const isLastSlide = currentIndex === SLIDES.length - 1;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Image
          source={require('../../assets/logo.gif')}
          style={styles.logo}
          resizeMode="contain"
        />
        {!isLastSlide && (
          <TouchableOpacity onPress={handleSkip}>
            <Text style={[styles.skipText, { color: colors.textMuted }]}>
              {t('onboarding.skip')}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        ref={flatListRef}
        data={SLIDES}
        renderItem={renderSlide}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false }
        )}
        onMomentumScrollEnd={(e) => {
          const index = Math.round(e.nativeEvent.contentOffset.x / width);
          setCurrentIndex(index);
        }}
      />

      {renderPagination()}

      <View style={styles.footer}>
        {isLastSlide ? (
          <>
            <TouchableOpacity
              style={[styles.primaryButton, { backgroundColor: colors.primary }]}
              onPress={onRegister}
            >
              <Text style={styles.primaryButtonText}>{t('onboarding.create_account')}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.secondaryButton, { borderColor: colors.border }]}
              onPress={onLogin}
            >
              <Text style={[styles.secondaryButtonText, { color: colors.text }]}>
                {t('onboarding.login')}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleGetStarted}>
              <Text style={[styles.guestText, { color: colors.textMuted }]}>
                {t('onboarding.continue_guest')}
              </Text>
            </TouchableOpacity>
          </>
        ) : (
          <TouchableOpacity
            style={[styles.nextButton, { backgroundColor: colors.primary }]}
            onPress={handleNext}
          >
            <Text style={styles.nextButtonText}>{t('onboarding.next')}</Text>
            <Ionicons name="arrow-forward" size={20} color="#fff" />
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  logo: {
    width: 60,
    height: 60,
  },
  skipText: {
    fontSize: 16,
    fontWeight: '500',
  },
  slide: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  iconContainer: {
    width: 160,
    height: 160,
    borderRadius: 80,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
  },
  dot: {
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  footer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  nextButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  primaryButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  secondaryButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    marginBottom: 16,
  },
  secondaryButtonText: {
    fontSize: 18,
    fontWeight: '600',
  },
  guestText: {
    fontSize: 14,
    textAlign: 'center',
    textDecorationLine: 'underline',
  },
});
