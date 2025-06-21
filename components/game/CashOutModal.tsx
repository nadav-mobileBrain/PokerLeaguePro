import React, { useState, useEffect } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  StyleSheet,
  Alert,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import appColors from "@/constants/colors"; // Assuming you have a colors constant file
import { FontAwesome } from "@expo/vector-icons";
import { supabase } from "@/lib/supabaseClient"; // Import Supabase client

interface CashOutModalProps {
  isVisible: boolean;
  onClose: () => void;
  onSuccess: () => void; // Simple callback on success
  userName: string;
  userId: string;
  gameId: string;
  totalCashIn: number;
}

export default function CashOutModal({
  isVisible,
  onClose,
  onSuccess,
  userName,
  userId,
  gameId,
  totalCashIn,
}: CashOutModalProps) {
  const [finalAmountInput, setFinalAmountInput] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  // Reset input when modal becomes visible or user changes
  useEffect(() => {
    if (isVisible) {
      setFinalAmountInput(""); // Clear input on open
      setIsLoading(false);
    }
  }, [isVisible, userName]);

  const handleAmountChange = (text: string) => {
    // Allow only numbers and a single decimal point
    if (/^\d*\.?\d*$/.test(text)) {
      setFinalAmountInput(text);
    }
  };

  const handleSubmit = async () => {
    const finalAmount = parseFloat(finalAmountInput);
    if (isNaN(finalAmount) || finalAmount < 0) {
      Alert.alert(
        "Invalid Amount",
        "Please enter a valid non-negative amount."
      );
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase.rpc("cash_out_player", {
        p_game_id: gameId,
        p_user_id: userId,
        p_cash_out_amount: finalAmount,
      });

      if (error) throw error;

      Alert.alert("Success", `${userName} has been cashed out.`);
      onSuccess(); // Triggers a refetch on the previous screen
      onClose(); // Closes the modal
    } catch (error: any) {
      console.error("Cash out error:", error);
      Alert.alert("Error", "Could not process cash out. " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const calculatedProfit = () => {
    const finalAmount = parseFloat(finalAmountInput);
    if (isNaN(finalAmount) || finalAmount < 0) {
      return null; // Not a valid number yet
    }
    return finalAmount - totalCashIn;
  };

  const profit = calculatedProfit();

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={isVisible}
      onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.centeredView}>
        <View style={styles.modalView}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={onClose}
            disabled={isLoading}>
            <FontAwesome
              name="close"
              size={24}
              color={appColors.secondaryText}
            />
          </TouchableOpacity>

          <Text style={styles.modalTitle}>Cash Out: {userName}</Text>
          <Text style={styles.cashInInfo}>
            Total Cash In: ${totalCashIn.toFixed(2)}
          </Text>

          <Text style={styles.inputLabel}>Enter Final Chip Amount:</Text>
          <TextInput
            style={styles.input}
            onChangeText={handleAmountChange}
            value={finalAmountInput}
            keyboardType="numeric"
            placeholder="e.g., 150.50"
            placeholderTextColor={appColors.secondaryText}
            editable={!isLoading}
          />

          {profit !== null && (
            <Text
              style={[
                styles.profitText,
                profit >= 0 ? styles.profitPositive : styles.profitNegative,
              ]}>
              Calculated Profit: ${profit.toFixed(2)}
            </Text>
          )}

          <TouchableOpacity
            style={[
              styles.submitButton,
              isLoading && styles.submitButtonDisabled,
            ]}
            onPress={handleSubmit}
            disabled={isLoading}>
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.submitButtonText}>Confirm Cash Out</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.6)", // Dimmed background
  },
  modalView: {
    margin: 20,
    width: "90%",
    backgroundColor: appColors.chipBlack,
    borderRadius: 10,
    padding: 35,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    position: "relative", // Needed for absolute positioning of close button
  },
  closeButton: {
    position: "absolute",
    top: 10,
    right: 10,
    padding: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
    color: appColors.lightText,
    textAlign: "center",
  },
  cashInInfo: {
    fontSize: 16,
    color: appColors.secondaryText,
    marginBottom: 20,
    textAlign: "center",
  },
  inputLabel: {
    fontSize: 16,
    color: appColors.lightText,
    alignSelf: "flex-start",
    marginBottom: 5,
  },
  input: {
    height: 45,
    borderColor: appColors.inputBorder,
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 15,
    paddingHorizontal: 10,
    width: "100%",
    fontSize: 16,
    color: appColors.lightText,
    backgroundColor: appColors.background, // Slightly different background for input
  },
  profitText: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  profitPositive: {
    color: appColors.buttonGreen,
  },
  profitNegative: {
    color: appColors.accentRed,
  },
  submitButton: {
    backgroundColor: appColors.buttonGreen,
    borderRadius: 5,
    paddingVertical: 12,
    paddingHorizontal: 20,
    elevation: 2,
    width: "100%",
    alignItems: "center",
  },
  submitButtonDisabled: {
    backgroundColor: appColors.secondaryText,
  },
  submitButtonText: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
    fontSize: 16,
  },
});
