import React, { useEffect, useState } from "react";
import { Animated, StyleSheet, Text, TouchableOpacity } from "react-native";
import { networkLogger, NetworkRequest } from "../services/network-logger";
import { HttpTraceModal } from "./HttpTraceModal";

interface HttpTraceBadgeProps {
  position?: "top-left" | "top-right" | "bottom-left" | "bottom-right";
  showOnlyErrors?: boolean;
  autoHide?: boolean;
  autoHideDelay?: number;
}

export function HttpTraceBadge({
  position = "top-right",
  showOnlyErrors = true,
  autoHide = true,
  autoHideDelay = 5000,
}: HttpTraceBadgeProps) {
  const [modalVisible, setModalVisible] = useState(false);
  const [errorCount, setErrorCount] = useState(0);
  const [requestCount, setRequestCount] = useState(0);
  const [fadeAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    return networkLogger.subscribe((requests: NetworkRequest[]) => {
      const errors = requests.filter(
        (req) => req.status && req.status >= 400
      ).length;
      const total = requests.length;

      setErrorCount(errors);
      setRequestCount(total);

      const shouldShow = showOnlyErrors ? errors > 0 : total > 0;

      if (shouldShow) {
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }).start();

        if (autoHide && errors > 0) {
          setTimeout(() => {
            Animated.timing(fadeAnim, {
              toValue: 0,
              duration: 300,
              useNativeDriver: true,
            }).start();
          }, autoHideDelay);
        }
      } else {
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }).start();
      }
    });
  }, [showOnlyErrors, autoHide, autoHideDelay, fadeAnim]);

  const getPositionStyle = () => {
    const base = { position: "absolute" as const, zIndex: 999 };
    switch (position) {
      case "top-left":
        return { ...base, top: 50, left: 20 };
      case "top-right":
        return { ...base, top: 50, right: 20 };
      case "bottom-left":
        return { ...base, bottom: 100, left: 20 };
      case "bottom-right":
        return { ...base, bottom: 100, right: 20 };
      default:
        return { ...base, top: 50, right: 20 };
    }
  };

  const getBadgeText = () => {
    if (showOnlyErrors) {
      return errorCount > 0
        ? `${errorCount} erro${errorCount > 1 ? "s" : ""}`
        : "";
    }
    return `${requestCount} req${requestCount !== 1 ? "s" : ""}`;
  };

  const getBadgeColor = () => {
    if (errorCount > 0) return "#FF3B30";
    return "#007AFF";
  };

  if (showOnlyErrors && errorCount === 0) return null;
  if (!showOnlyErrors && requestCount === 0) return null;

  return (
    <>
      <Animated.View style={[getPositionStyle(), { opacity: fadeAnim }]}>
        <TouchableOpacity
          style={[styles.badge, { backgroundColor: getBadgeColor() }]}
          onPress={() => setModalVisible(true)}
        >
          <Text style={styles.badgeText}>{getBadgeText()}</Text>
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
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    minWidth: 30,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  badgeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
});
