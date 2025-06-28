
import React, { useState } from 'react';
import { Modal, View, Text, TextInput, Button, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { ThemedView } from '../ThemedView';
import { ThemedText } from '../ThemedText';

interface NicknameSetupModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (nickname: string) => void;
}

const NicknameSetupModal: React.FC<NicknameSetupModalProps> = ({ visible, onClose, onSave }) => {
  const [nickname, setNickname] = useState('');

  const handleSave = () => {
    if (nickname.trim().length >= 2) {
      onSave(nickname.trim());
    }
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.centeredView}
      >
        <ThemedView style={styles.modalView}>
          <ThemedText style={styles.modalText}>Welcome to PokerLeaguePro!</ThemedText>
          <ThemedText style={styles.modalSubText}>
            Choose a nickname to be displayed in your leagues.
          </ThemedText>
          <TextInput
            style={styles.input}
            placeholder="Enter your nickname (2-20 characters)"
            value={nickname}
            onChangeText={setNickname}
            maxLength={20}
          />
          <View style={styles.buttonContainer}>
            <Button title="Set Nickname" onPress={handleSave} disabled={nickname.trim().length < 2} />
            <Button title="I'll do this later" onPress={onClose} />
          </View>
        </ThemedView>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22,
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalText: {
    marginBottom: 15,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalSubText: {
    marginBottom: 15,
    textAlign: 'center',
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 20,
    paddingHorizontal: 10,
    width: 250,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
});

export default NicknameSetupModal;
