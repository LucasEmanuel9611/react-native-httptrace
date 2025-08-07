import React, { useEffect, useState } from "react";
import {
  Animated,
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { networkLogger, NetworkRequest } from "../services/network-logger";
import { HttpTraceModal } from "./HttpTraceModal";

interface HttpTraceToastProps {
  position?: "top" | "bottom";
  duration?: number;
  showOnlyErrors?: boolean;
  maxWidth?: number;
}

export function HttpTraceToast({
  position = "top",
  duration = 4000,
  showOnlyErrors = true,
  maxWidth = Dimensions.get("window").width - 40,
}: HttpTraceToastProps) {
  const [modalVisible, setModalVisible] = useState(false);
  const [lastError, setLastError] = useState<NetworkRequest | null>(null);
  const [slideAnim] = useState(new Animated.Value(-100));

  useEffect(() => {
    return networkLogger.subscribe((requests: NetworkRequest[]) => {
      const latestError = requests
        .filter((req) => req.status && req.status >= 400)
        .sort(
          (a, b) =>
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        )[0];

      if (latestError && (!lastError || latestError.id !== lastError.id)) {
        setLastError(latestError);
        showToast();
      }
    });
  }, [lastError]);

  const showToast = () => {
    Animated.sequence([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.delay(duration),
      Animated.timing(slideAnim, {
        toValue: position === "top" ? -100 : 100,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const getPositionStyle = () => {
    const base = {
      position: "absolute" as const,
      left: 20,
      right: 20,
      zIndex: 1000,
    };

    if (position === "top") {
      return {
        ...base,
        top: 60,
        transform: [{ translateY: slideAnim }],
      };
    } else {
      return {
        ...base,
        bottom: 100,
        transform: [{ translateY: slideAnim }],
      };
    }
  };

  const getErrorMessage = () => {
    if (!lastError) return "";
    return `${lastError.method} ${lastError.url} - ${lastError.status}`;
  };

  if (!lastError) return null;

  return (
    <>
      <Animated.View style={[getPositionStyle()]}>
        <TouchableOpacity
          style={[styles.toast, { maxWidth }]}
          onPress={() => setModalVisible(true)}
          activeOpacity={0.8}
        >
          <View style={styles.toastContent}>
            <Text style={styles.toastTitle}>🚨 Erro de Rede</Text>
            <Text style={styles.toastMessage} numberOfLines={1}>
              {getErrorMessage()}
            </Text>
            <Text style={styles.toastAction}>Toque para ver detalhes</Text>
          </View>
        </TouchableOpacity>
      </Animated.View>

      <HttpTraceModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  toast: {
    backgroundColor: "#FF3B30",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  toastContent: {
    alignItems: "center",
  },
  toastTitle: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 4,
  },
  toastMessage: {
    color: "#fff",
    fontSize: 12,
    marginBottom: 4,
    textAlign: "center",
  },
  toastAction: {
    color: "#fff",
    fontSize: 10,
    opacity: 0.8,
    fontStyle: "italic",
  },
});
