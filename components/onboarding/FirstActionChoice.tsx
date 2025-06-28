
import React from 'react';
import { View, Button, StyleSheet } from 'react-native';
import { ThemedView } from '../ThemedView';
import { ThemedText } from '../ThemedText';

interface FirstActionChoiceProps {
  onCreateLeague: () => void;
  onJoinLeague: () => void;
  onExplore: () => void;
}

const FirstActionChoice: React.FC<FirstActionChoiceProps> = ({ onCreateLeague, onJoinLeague, onExplore }) => {
  return (
    <ThemedView style={styles.container}>
      <ThemedText style={styles.title}>What would you like to do first?</ThemedText>
      <View style={styles.buttonContainer}>
        <Button title="Create My First League" onPress={onCreateLeague} />
      </View>
      <View style={styles.buttonContainer}>
        <Button title="Join an Existing League" onPress={onJoinLeague} />
      </View>
      <View style={styles.buttonContainer}>
        <Button title="Explore the App First" onPress={onExplore} />
      </View>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 40,
  },
  buttonContainer: {
    marginVertical: 10,
    width: '80%',
  },
});

export default FirstActionChoice;
