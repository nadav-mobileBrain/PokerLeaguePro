import React, { useState } from "react";
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { supabase } from "@/lib/supabaseClient";
import appColors from "@/constants/colors";
import { useUserStore } from "@/store/userStore";

interface AddCashInModalProps {
  isVisible: boolean;
  onClose: () => void;
  gameId?: string;
  userId?: string;
  userName?: string;
  // defaultBuyIn is no longer used for input, but maybe keep for display?
  // defaultBuyIn?: number | null;
  onCashInAdded: () => void;
}

const FIXED_AMOUNTS = [50, 100]; // Define fixed amounts

export default function AddCashInModal({
  isVisible,
  onClose,
  gameId,
  userId,
  userName,
  onCashInAdded,
}: AddCashInModalProps) {
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { supabaseProfile } = useUserStore();

  const handleAddCashIn = async (amountToAdd: number) => {
    if (!gameId || !userId || !supabaseProfile?.id) {
      setError("Missing required information.");
      return;
    }

    // Amount is already validated by selection
    setSelectedAmount(amountToAdd); // Track which button is processing
    setIsLoading(true);
    setError(null);

    try {
      const { error: rpcError } = await supabase.rpc("add_game_transaction", {
        p_game_id: gameId,
        p_user_id: userId,
        p_transaction_type: "cash_in", // Specify the type
        p_amount: amountToAdd,
        p_requesting_user_id: supabaseProfile.id,
      });

      if (rpcError) throw rpcError;

      console.log(
        `[AddCashInModal] Successfully added ${amountToAdd} cash-in for ${userName}`
      );
      onCashInAdded();
      handleClose();
    } catch (err: any) {
      console.error("[AddCashInModal] Error adding cash in:", err);
      setError(err.message || "Failed to add cash-in entry.");
      Alert.alert("Error", err.message || "Failed to add cash-in entry.");
    } finally {
      setIsLoading(false);
      setSelectedAmount(null); // Reset selected amount tracking
    }
  };

  const handleClose = () => {
    // Reset state on close
    setError(null);
    setIsLoading(false);
    setSelectedAmount(null);
    onClose();
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={isVisible}
      onRequestClose={handleClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>
            Add Cash-In for {userName || "Player"}
          </Text>

          {/* --- Fixed Amount Buttons --- */}
          <View style={styles.fixedAmountContainer}>
            {FIXED_AMOUNTS.map((amount) => (
              <TouchableOpacity
                key={amount}
                style={[
                  styles.button,
                  // Conditionally apply button style based on amount
                  amount === 100
                    ? styles.fixedAmountButton100
                    : styles.fixedAmountButton50,
                  isLoading &&
                    selectedAmount === amount &&
                    styles.buttonDisabled,
                  isLoading &&
                    selectedAmount !== amount &&
                    styles.buttonDisabled,
                ]}
                onPress={() => handleAddCashIn(amount)}
                disabled={isLoading}>
                {isLoading && selectedAmount === amount ? (
                  <ActivityIndicator size="small" color={appColors.lightText} />
                ) : (
                  <Text style={styles.buttonText}>Cash In ${amount}</Text>
                )}
              </TouchableOpacity>
            ))}
          </View>
          {/* --- End Fixed Amount Buttons --- */}

          {error && <Text style={styles.errorText}>{error}</Text>}

          {/* --- Cancel Button --- */}
          <TouchableOpacity
            style={[styles.button, styles.cancelButton]}
            onPress={handleClose}
            disabled={isLoading} // Also disable cancel while processing?
          >
            <Text style={styles.buttonText}>Cancel</Text>
          </TouchableOpacity>
          {/* --- End Cancel Button --- */}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.6)",
  },
  modalContent: {
    width: "85%",
    backgroundColor: appColors.sectionBackground,
    borderRadius: 10,
    padding: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: appColors.lightText,
    marginBottom: 20, // Increased margin
    textAlign: "center",
  },
  fixedAmountContainer: {
    width: "100%",
    marginBottom: 15, // Space before error/cancel
  },
  fixedAmountButton50: {
    // Renamed from fixedAmountButton
    backgroundColor: appColors.buttonGreen,
    marginBottom: 10,
  },
  fixedAmountButton100: {
    // New style for $100
    backgroundColor: "#007bff", // A darker green
    marginBottom: 10,
  },
  errorText: {
    color: appColors.accentRed,
    marginBottom: 15, // Space before cancel
    textAlign: "center",
  },
  button: {
    width: "100%", // Make buttons full width
    paddingVertical: 12,
    borderRadius: 8, // Slightly more rounded
    alignItems: "center",
    justifyContent: "center",
  },
  cancelButton: {
    backgroundColor: appColors.secondaryText,
    marginTop: 5, // Add a little space above cancel
  },
  buttonText: {
    color: appColors.lightText,
    fontWeight: "bold",
    fontSize: 16,
  },
  buttonDisabled: {
    backgroundColor: appColors.inputBorder, // More prominent disabled state
    opacity: 0.7,
  },
});
