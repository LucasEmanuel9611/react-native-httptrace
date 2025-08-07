import React from "react";
import { StyleSheet, Text, TouchableOpacity } from "react-native";

interface HttpTraceButtonProps {
  onPress: () => void;
  visible?: boolean;
}

export function HttpTraceButton({
  onPress,
  visible = true,
}: HttpTraceButtonProps) {
  if (!visible) return null;

  return (
    <TouchableOpacity style={styles.floatingButton} onPress={onPress}>
      <Text style={styles.buttonText}>🌐</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  floatingButton: {
    position: "absolute",
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#007AFF",
    justifyContent: "center",
    alignItems: "center",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    zIndex: 1000,
  },
  buttonText: {
    fontSize: 24,
    color: "#fff",
  },
});
