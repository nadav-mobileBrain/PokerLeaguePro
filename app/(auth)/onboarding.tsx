
import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import NicknameSetupModal from '../../components/onboarding/NicknameSetupModal';
import WelcomeTour from '../../components/onboarding/WelcomeTour';
import FirstActionChoice from '../../components/onboarding/FirstActionChoice';
import { useUserStore } from '../../store/userStore';
import { useAuth } from '@clerk/clerk-expo';

const OnboardingScreen = () => {
  const [step, setStep] = useState('nickname'); // nickname, tour, choice
  const router = useRouter();
  const { setOnboardingCompleted, updateUserNickname } = useUserStore();
  const { userId } = useAuth();

  const handleNicknameSave = async (nickname: string) => {
    if (userId) {
      await updateUserNickname(userId, nickname);
      setStep('tour');
    }
  };

  const handleTourFinish = () => {
    setStep('choice');
  };

  const handleCreateLeague = () => {
    setOnboardingCompleted(true);
    router.replace('/(tabs)/create-league');
  };

  const handleJoinLeague = () => {
    setOnboardingCompleted(true);
    router.replace('/join-league');
  };

  const handleExplore = () => {
    setOnboardingCompleted(true);
    router.replace('/(tabs)');
  };

  return (
    <View style={styles.container}>
      {step === 'nickname' && (
        <NicknameSetupModal
          visible={true}
          onClose={() => setStep('tour')}
          onSave={handleNicknameSave}
        />
      )}
      {step === 'tour' && <WelcomeTour onFinish={handleTourFinish} />}
      {step === 'choice' && (
        <FirstActionChoice
          onCreateLeague={handleCreateLeague}
          onJoinLeague={handleJoinLeague}
          onExplore={handleExplore}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default OnboardingScreen;
