import Clipboard from "@react-native-clipboard/clipboard";
import React, { useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { networkLogger, NetworkRequest } from "../services/network-logger";

interface ExpandedSections {
  [key: string]: {
    headers: boolean;
    body: boolean;
    response: boolean;
    error: boolean;
  };
}

interface HttpTraceModalProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  showCloseButton?: boolean;
}

export function HttpTraceModal({
  visible,
  onClose,
  title = "HTTP Trace",
  showCloseButton = true,
}: HttpTraceModalProps) {
  const [requests, setRequests] = useState<NetworkRequest[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<NetworkRequest | null>(
    null
  );
  const [expandedSections, setExpandedSections] = useState<ExpandedSections>(
    {}
  );

  useEffect(() => {
    return networkLogger.subscribe(setRequests);
  }, []);

  useEffect(() => {
    if (selectedRequest && !expandedSections[selectedRequest.id]) {
      const newExpandedSections = { ...expandedSections };
      newExpandedSections[selectedRequest.id] = {
        headers: false,
        body: false,
        response: false,
        error: false,
      };
      setExpandedSections(newExpandedSections);
    }
  }, [selectedRequest, expandedSections]);

  const clearRequests = () => {
    Alert.alert(
      "Limpar Logs",
      "Tem certeza que deseja limpar todos os logs de rede?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Limpar",
          style: "destructive",
          onPress: () => {
            networkLogger.clearRequests();
            setExpandedSections({});
          },
        },
      ]
    );
  };

  const getStatusColor = (status?: number) => {
    if (!status) return "#999";
    if (status >= 200 && status < 300) return "#4CAF50";
    if (status >= 400 && status < 500) return "#FF9800";
    if (status >= 500) return "#F44336";
    return "#999";
  };

  const formatDuration = (duration?: number) => {
    if (!duration) return "N/A";
    return `${duration}ms`;
  };

  const toggleSection = (
    section: "headers" | "body" | "response" | "error"
  ) => {
    if (!selectedRequest) return;

    const newExpandedSections = { ...expandedSections };
    const currentState = newExpandedSections[selectedRequest.id] || {
      headers: false,
      body: false,
      response: false,
      error: false,
    };

    newExpandedSections[selectedRequest.id] = {
      ...currentState,
      [section]: !currentState[section],
    };
    setExpandedSections(newExpandedSections);
  };

  const getExpandedState = (requestId: string) => {
    return (
      expandedSections[requestId] || {
        headers: false,
        body: false,
        response: false,
        error: false,
      }
    );
  };

  const copyToClipboard = (text: string, label: string) => {
    Clipboard.setString(text);
    Alert.alert("Copiado!", `${label} copiado para a área de transferência`);
  };

  const generateCurl = (request: NetworkRequest) => {
    let curl = `curl -X ${request.method} "${request.url}"`;

    if (request.headers) {
      Object.entries(request.headers).forEach(([key, value]) => {
        curl += ` \\\n  -H "${key}: ${value}"`;
      });
    }

    if (request.body && typeof request.body === "string") {
      curl += ` \\\n  -d '${request.body}'`;
    }

    return curl;
  };

  const renderRequest = ({ item }: { item: NetworkRequest }) => (
    <TouchableOpacity
      style={[
        styles.requestItem,
        selectedRequest?.id === item.id && styles.requestItemSelected,
      ]}
      onPress={() => setSelectedRequest(item)}
    >
      <View style={styles.requestHeader}>
        <View style={styles.methodContainer}>
          <Text
            style={[
              styles.method,
              { backgroundColor: getStatusColor(item.status) },
            ]}
          >
            {item.method}
          </Text>
        </View>
        <View style={styles.requestInfo}>
          <Text style={styles.url} numberOfLines={1}>
            {item.url}
          </Text>
          <Text style={styles.timestamp}>
            {new Date(item.timestamp).toLocaleTimeString()}
          </Text>
        </View>
        <View style={styles.statusContainer}>
          <Text style={[styles.status, { color: getStatusColor(item.status) }]}>
            {item.status || "PENDING"}
          </Text>
          <Text style={styles.duration}>{formatDuration(item.duration)}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderSection = (
    title: string,
    content: any,
    sectionKey: "headers" | "body" | "response" | "error",
    copyLabel: string
  ) => {
    if (!selectedRequest || !content) return null;

    const expanded = getExpandedState(selectedRequest.id);
    const isExpanded = expanded[sectionKey];

    return (
      <View style={styles.section}>
        <TouchableOpacity
          style={styles.sectionHeader}
          onPress={() => toggleSection(sectionKey)}
        >
          <Text style={styles.sectionTitle}>{title}</Text>
          <Text style={styles.expandIcon}>{isExpanded ? "▼" : "▶"}</Text>
        </TouchableOpacity>
        {isExpanded && (
          <View style={styles.sectionContent}>
            <ScrollView style={styles.contentScroll}>
              <Text style={styles.detailText}>
                {typeof content === "string"
                  ? content
                  : JSON.stringify(content, null, 2)}
              </Text>
            </ScrollView>
            <TouchableOpacity
              style={styles.copyButton}
              onPress={() =>
                copyToClipboard(
                  typeof content === "string"
                    ? content
                    : JSON.stringify(content, null, 2),
                  copyLabel
                )
              }
            >
              <Text style={styles.copyButtonText}>Copy</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  const renderRequestDetail = () => {
    if (!selectedRequest) return null;

    return (
      <View style={styles.detailContainer}>
        <View style={styles.detailHeader}>
          <Text style={styles.detailTitle}>
            {selectedRequest.method} {selectedRequest.url}
          </Text>
          <TouchableOpacity onPress={() => setSelectedRequest(null)}>
            <Text style={styles.closeButton}>✕</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.detailContent}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Informações Gerais</Text>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>URL:</Text>
              <TouchableOpacity
                onPress={() => copyToClipboard(selectedRequest.url, "URL")}
              >
                <Text style={styles.infoValue}>{selectedRequest.url}</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Método:</Text>
              <Text style={styles.infoValue}>{selectedRequest.method}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Status:</Text>
              <Text
                style={[
                  styles.infoValue,
                  { color: getStatusColor(selectedRequest.status) },
                ]}
              >
                {selectedRequest.status || "Pending"}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Duração:</Text>
              <Text style={styles.infoValue}>
                {formatDuration(selectedRequest.duration)}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Timestamp:</Text>
              <Text style={styles.infoValue}>
                {new Date(selectedRequest.timestamp).toLocaleString()}
              </Text>
            </View>
          </View>

          {renderSection(
            "Request Headers",
            selectedRequest.headers,
            "headers",
            "Request Headers"
          )}

          {renderSection(
            "Request Body",
            selectedRequest.body,
            "body",
            "Request Body"
          )}

          {renderSection(
            "Response",
            selectedRequest.response,
            "response",
            "Response Data"
          )}

          {renderSection("Error", selectedRequest.error, "error", "Error")}

          <View style={styles.section}>
            <TouchableOpacity
              style={styles.sectionHeader}
              onPress={() =>
                copyToClipboard(generateCurl(selectedRequest), "cURL")
              }
            >
              <Text style={styles.sectionTitle}>cURL Command</Text>
              <Text style={styles.copyButtonText}>Copy</Text>
            </TouchableOpacity>
            <View style={styles.sectionContent}>
              <ScrollView style={styles.contentScroll}>
                <Text style={styles.detailText}>
                  {generateCurl(selectedRequest)}
                </Text>
              </ScrollView>
            </View>
          </View>
        </ScrollView>
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          {showCloseButton && (
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.backButton}>✕ Fechar</Text>
            </TouchableOpacity>
          )}
          <Text style={styles.title}>{title}</Text>
          <TouchableOpacity onPress={clearRequests}>
            <Text style={styles.clearButton}>Limpar</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          {selectedRequest ? (
            renderRequestDetail()
          ) : (
            <FlatList
              data={requests}
              renderItem={renderRequest}
              keyExtractor={(item: NetworkRequest) => item.id}
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>
                    Nenhuma request capturada ainda
                  </Text>
                  <Text style={styles.emptySubtext}>
                    Faça algumas requisições para ver os logs aqui
                  </Text>
                </View>
              }
            />
          )}
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  backButton: {
    fontSize: 16,
    color: "#007aff",
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  clearButton: {
    fontSize: 16,
    color: "#ff3b30",
  },
  content: {
    flex: 1,
  },
  requestItem: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginVertical: 4,
    borderRadius: 8,
    padding: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  requestItemSelected: {
    borderColor: "#007AFF",
    borderWidth: 2,
  },
  requestHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  methodContainer: {
    marginRight: 12,
  },
  method: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#fff",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    minWidth: 50,
    textAlign: "center",
  },
  requestInfo: {
    flex: 1,
  },
  url: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
    marginBottom: 4,
  },
  timestamp: {
    fontSize: 12,
    color: "#666",
  },
  statusContainer: {
    alignItems: "flex-end",
  },
  status: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 2,
  },
  duration: {
    fontSize: 12,
    color: "#666",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#666",
    textAlign: "center",
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#999",
    textAlign: "center",
  },
  detailContainer: {
    flex: 1,
    backgroundColor: "#fff",
  },
  detailHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  detailTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    flex: 1,
  },
  closeButton: {
    fontSize: 18,
    color: "#007aff",
  },
  detailContent: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  expandIcon: {
    fontSize: 16,
    color: "#666",
  },
  sectionContent: {
    padding: 16,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderTopWidth: 0,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
  },
  contentScroll: {
    maxHeight: 200,
  },
  detailText: {
    fontSize: 14,
    color: "#333",
    fontFamily: "monospace",
  },
  copyButton: {
    marginTop: 8,
    padding: 8,
    backgroundColor: "#007aff",
    borderRadius: 4,
    alignItems: "center",
  },
  copyButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
  },
  infoRow: {
    flexDirection: "row",
    paddingVertical: 4,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#666",
    width: 80,
  },
  infoValue: {
    fontSize: 14,
    color: "#333",
    flex: 1,
  },
});
