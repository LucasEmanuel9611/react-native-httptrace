import React, { useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  Modal,
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { shareText } from "../../helpers/share";
import { networkLogger, NetworkRequest } from "../../services/network-logger";
import {
  getMethodStyle,
  getRequestItemStyle,
  getStatusStyle,
  styles,
} from "./styles";

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

  const handleShare = (text: string, title: string) => {
    shareText(text, title).catch(() => {});
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
    <TouchableOpacity onPress={() => setSelectedRequest(item)}>
      <View style={getRequestItemStyle(selectedRequest?.id === item.id)}>
        <View style={styles.requestHeader}>
          <View style={styles.methodContainer}>
            <Text style={getMethodStyle(getStatusColor(item.status))}>
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
            <Text style={getStatusStyle(getStatusColor(item.status))}>
              {item.status || "PENDING"}
            </Text>
            <Text style={styles.duration}>{formatDuration(item.duration)}</Text>
          </View>
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
        <TouchableOpacity onPress={() => toggleSection(sectionKey)}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{title}</Text>
            <Text style={styles.expandIcon}>{isExpanded ? "▼" : "▶"}</Text>
          </View>
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
              onPress={() =>
                handleShare(
                  typeof content === "string"
                    ? content
                    : JSON.stringify(content, null, 2),
                  copyLabel
                )
              }
            >
              <View style={styles.copyButton}>
                <Text style={styles.copyButtonText}>Copy</Text>
              </View>
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
          <TouchableOpacity
            onPress={() =>
              handleShare(generateCurl(selectedRequest), "cURL Command")
            }
          >
            <Text style={styles.closeButton}>📤</Text>
          </TouchableOpacity>
          <Text style={styles.detailTitle}>
            {selectedRequest.method} {selectedRequest.url}
          </Text>

          <TouchableOpacity onPress={() => setSelectedRequest(null)}>
            <Text style={styles.closeButton}>X</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.detailContent}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Informações Gerais</Text>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>URL:</Text>
              <TouchableOpacity
                onPress={() => handleShare(selectedRequest.url, "URL")}
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
              onPress={() => handleShare(generateCurl(selectedRequest), "cURL")}
            >
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>cURL Command</Text>
                <Text style={styles.copyButtonText}>Copy</Text>
              </View>
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
      <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.container}>
          <View style={styles.header}>
            {showCloseButton && (
              <TouchableOpacity onPress={onClose}>
                <Text style={styles.backButton}>X Fechar</Text>
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
        </View>
      </SafeAreaView>
    </Modal>
  );
}
