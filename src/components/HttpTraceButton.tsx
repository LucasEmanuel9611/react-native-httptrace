import React, { useState } from "react";
import { StyleSheet, Text, TouchableOpacity } from "react-native";
import { HttpTraceModal } from "./HttpTraceModal";

interface HttpTraceButtonProps {
  visible?: boolean;
}

export function HttpTraceButton({ visible = true }: HttpTraceButtonProps) {
  const [modalVisible, setModalVisible] = useState(false);

  if (!visible) return null;

  return (
    <>
      <TouchableOpacity
        style={styles.floatingButton}
        onPress={() => setModalVisible(true)}
      >
        <Text style={styles.buttonText}>🌐</Text>
      </TouchableOpacity>

      <HttpTraceModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
      />
    </>
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
