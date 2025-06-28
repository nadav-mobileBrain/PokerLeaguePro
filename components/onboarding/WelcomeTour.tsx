
import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import Swiper from 'react-native-swiper';
import { ThemedView } from '../ThemedView';
import { ThemedText } from '../ThemedText';

interface WelcomeTourProps {
  onFinish: () => void;
}

const WelcomeTour: React.FC<WelcomeTourProps> = ({ onFinish }) => {
  return (
    <Swiper style={styles.wrapper} showsButtons={true}>
      <ThemedView style={styles.slide}>
        <ThemedText style={styles.title}>Welcome to PokerLeaguePro</ThemedText>
        <ThemedText style={styles.text}>Track your poker games with friends</ThemedText>
      </ThemedView>
      <ThemedView style={styles.slide}>
        <ThemedText style={styles.title}>Leagues</ThemedText>
        <ThemedText style={styles.text}>Create or join leagues to track games with your poker groups</ThemedText>
      </ThemedView>
      <ThemedView style={styles.slide}>
        <ThemedText style={styles.title}>Session Tracking</ThemedText>
        <ThemedText style={styles.text}>Record buy-ins and cash-outs at the end of each session</ThemedText>
      </ThemedView>
      <ThemedView style={styles.slide}>
        <ThemedText style={styles.title}>Statistics</ThemedText>
        <ThemedText style={styles.text}>See who's really winning over time</ThemedText>
        <Button title="Get Started" onPress={onFinish} />
      </ThemedView>
    </Swiper>
  );
};

const styles = StyleSheet.create({
  wrapper: {},
  slide: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  text: {
    fontSize: 16,
  },
});

export default WelcomeTour;
