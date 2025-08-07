import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { networkLogger, NetworkRequest } from "../services/network-logger";
import { HttpTraceModal } from "./HttpTraceModal";

interface HttpTraceStatusIndicatorProps {
  showPendingCount?: boolean;
  showErrorCount?: boolean;
  compact?: boolean;
  color?: string;
  backgroundColor?: string;
}

export function HttpTraceStatusIndicator({
  showPendingCount = true,
  showErrorCount = true,
  compact = false,
  color = "#007AFF",
  backgroundColor = "transparent",
}: HttpTraceStatusIndicatorProps) {
  const [modalVisible, setModalVisible] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const [errorCount, setErrorCount] = useState(0);
  const [hasActivity, setHasActivity] = useState(false);

  useEffect(() => {
    return networkLogger.subscribe((requests: NetworkRequest[]) => {
      const pending = requests.filter((req) => !req.status).length;
      const errors = requests.filter(
        (req) => req.status && req.status >= 400
      ).length;

      setPendingCount(pending);
      setErrorCount(errors);
      setHasActivity(pending > 0);
    });
  }, []);

  const getIndicatorText = () => {
    const parts = [];

    if (showPendingCount && pendingCount > 0) {
      parts.push(`${pendingCount}⌛`);
    }

    if (showErrorCount && errorCount > 0) {
      parts.push(`${errorCount}❌`);
    }

    if (parts.length === 0) {
      return compact ? "🌐" : "Network OK";
    }

    return parts.join(" ");
  };

  const getIndicatorColor = () => {
    if (errorCount > 0) return "#FF3B30";
    if (pendingCount > 0) return "#FF9500";
    return color;
  };

  return (
    <>
      <TouchableOpacity
        style={[styles.container, { backgroundColor }]}
        onPress={() => setModalVisible(true)}
      >
        <View style={styles.content}>
          {hasActivity && (
            <ActivityIndicator
              size="small"
              color={getIndicatorColor()}
              style={styles.spinner}
            />
          )}
          <Text style={[styles.text, { color: getIndicatorColor() }]}>
            {getIndicatorText()}
          </Text>
        </View>
      </TouchableOpacity>

      <HttpTraceModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    minWidth: 60,
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
  },
  spinner: {
    marginRight: 4,
  },
  text: {
    fontSize: 12,
    fontWeight: "500",
  },
});
