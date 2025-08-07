import React, { useEffect, useState } from 'react';
import {
  Alert,
  Clipboard,
  FlatList,
  Modal,
  Share,
  TouchableOpacity,
} from 'react-native';

import { networkLogger, NetworkRequest } from '../../services/network-logger';
import * as S from './styles';

interface ExpandedSections {
  [key: string]: {
    headers: boolean;
    body: boolean;
    response: boolean;
    error: boolean;
  };
}

interface NetworkLoggerModalProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  showCloseButton?: boolean;
}

export function NetworkLoggerModal({
  visible,
  onClose,
  title = 'Network Logger',
  showCloseButton = true,
}: NetworkLoggerModalProps) {
  const [requests, setRequests] = useState<NetworkRequest[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<NetworkRequest | null>(
    null,
  );
  const [expandedSections, setExpandedSections] = useState<ExpandedSections>(
    {},
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
      'Limpar Logs',
      'Tem certeza que deseja limpar todos os logs de rede?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Limpar',
          style: 'destructive',
          onPress: () => {
            networkLogger.clearRequests();
            setExpandedSections({});
          },
        },
      ],
    );
  };

  const getStatusColor = (status?: number) => {
    if (!status) return '#999';
    if (status >= 200 && status < 300) return '#4CAF50';
    if (status >= 400 && status < 500) return '#FF9800';
    if (status >= 500) return '#F44336';
    return '#999';
  };

  const formatDuration = (duration?: number) => {
    if (!duration) return 'N/A';
    return `${duration}ms`;
  };

  const toggleSection = (
    section: 'headers' | 'body' | 'response' | 'error',
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
    Alert.alert('Copiado!', `${label} copiado para a área de transferência`);
  };

  const generateCurl = (request: NetworkRequest) => {
    let fullUrl = request.fullUrl || request.url;

    if (!fullUrl.startsWith('http://') && !fullUrl.startsWith('https://')) {
      const { BASE_URL } = process.env;
      const baseUrl = `${BASE_URL}/conta-digital-bvr/v1`;
      fullUrl = `${baseUrl}${fullUrl.startsWith('/') ? '' : '/'}${fullUrl}`;
    }

    let curl = `curl -X ${request.method}`;

    Object.entries(request.headers).forEach(([key, value]) => {
      if (key.toLowerCase() !== 'content-length' && value) {
        curl += ` -H "${key}: ${value}"`;
      }
    });

    if (request.body) {
      const bodyString =
        typeof request.body === 'string'
          ? request.body
          : JSON.stringify(request.body);
      curl += ` -d '${bodyString}'`;
    }

    curl += ` "${fullUrl}"`;

    return curl;
  };

  const shareRequest = async (request: NetworkRequest) => {
    try {
      const requestData = {
        method: request.method,
        url: request.url,
        headers: request.headers,
        body: request.body,
        status: request.status,
        response: request.response,
        error: request.error,
        duration: request.duration,
      };

      await Share.share({
        message: JSON.stringify(requestData, null, 2),
        title: `Request ${request.method} ${request.url}`,
      });
    } catch (error) {
      console.error('Error sharing request:', error);
    }
  };

  const renderRequest = ({ item }: { item: NetworkRequest }) => (
    <S.RequestItem
      selected={selectedRequest?.id === item.id}
      onPress={() => setSelectedRequest(item)}
    >
      <S.RequestHeader>
        <S.MethodContainer>
          <S.Method backgroundColor={getStatusColor(item.status)}>
            {item.method}
          </S.Method>
        </S.MethodContainer>
        <S.RequestInfo>
          <S.Url numberOfLines={1}>{item.url}</S.Url>
          <S.Timestamp>{item.timestamp.toLocaleTimeString()}</S.Timestamp>
        </S.RequestInfo>
        <S.StatusContainer>
          <S.Status color={getStatusColor(item.status)}>
            {item.status || 'PENDING'}
          </S.Status>
          <S.Duration>{formatDuration(item.duration)}</S.Duration>
        </S.StatusContainer>
      </S.RequestHeader>
    </S.RequestItem>
  );

  const renderRequestDetail = () => {
    if (!selectedRequest) return null;

    const expanded = getExpandedState(selectedRequest.id);

    return (
      <S.DetailContainer>
        <S.DetailHeader>
          <S.DetailTitle>
            {selectedRequest.method} {selectedRequest.url}
          </S.DetailTitle>
          <TouchableOpacity onPress={() => setSelectedRequest(null)}>
            <S.CloseButton>✕</S.CloseButton>
          </TouchableOpacity>
        </S.DetailHeader>

        <S.ActionButtons>
          <S.ActionButton
            onPress={() =>
              copyToClipboard(
                JSON.stringify(selectedRequest, null, 2),
                'Request JSON',
              )
            }
          >
            <S.ActionButtonText>Copy JSON</S.ActionButtonText>
          </S.ActionButton>
          <S.ActionButton
            onPress={() =>
              copyToClipboard(generateCurl(selectedRequest), 'cURL')
            }
          >
            <S.ActionButtonText>Copy cURL</S.ActionButtonText>
          </S.ActionButton>
          <S.ActionButton onPress={() => shareRequest(selectedRequest)}>
            <S.ActionButtonText>Share</S.ActionButtonText>
          </S.ActionButton>
        </S.ActionButtons>

        <S.DetailContent>
          <S.Section>
            <S.SectionHeader onPress={() => toggleSection('headers')}>
              <S.SectionTitle>Headers</S.SectionTitle>
              <S.ExpandIcon>{expanded.headers ? '▼' : '▶'}</S.ExpandIcon>
            </S.SectionHeader>
            {expanded.headers && (
              <S.SectionContent>
                <S.DetailText>
                  {JSON.stringify(selectedRequest.headers, null, 2)}
                </S.DetailText>
                <S.CopyButton
                  onPress={() =>
                    copyToClipboard(
                      JSON.stringify(selectedRequest.headers, null, 2),
                      'Headers',
                    )
                  }
                >
                  <S.CopyButtonText>Copy</S.CopyButtonText>
                </S.CopyButton>
              </S.SectionContent>
            )}
          </S.Section>

          {selectedRequest.body && (
            <S.Section>
              <S.SectionHeader onPress={() => toggleSection('body')}>
                <S.SectionTitle>Body</S.SectionTitle>
                <S.ExpandIcon>{expanded.body ? '▼' : '▶'}</S.ExpandIcon>
              </S.SectionHeader>
              {expanded.body && (
                <S.SectionContent>
                  <S.DetailText>
                    {JSON.stringify(selectedRequest.body, null, 2)}
                  </S.DetailText>
                  <S.CopyButton
                    onPress={() =>
                      copyToClipboard(
                        JSON.stringify(selectedRequest.body, null, 2),
                        'Body',
                      )
                    }
                  >
                    <S.CopyButtonText>Copy</S.CopyButtonText>
                  </S.CopyButton>
                </S.SectionContent>
              )}
            </S.Section>
          )}

          {selectedRequest.response && (
            <S.Section>
              <S.SectionHeader onPress={() => toggleSection('response')}>
                <S.SectionTitle>Response</S.SectionTitle>
                <S.ExpandIcon>{expanded.response ? '▼' : '▶'}</S.ExpandIcon>
              </S.SectionHeader>
              {expanded.response && (
                <S.SectionContent>
                  <S.DetailText>
                    {JSON.stringify(selectedRequest.response, null, 2)}
                  </S.DetailText>
                  <S.CopyButton
                    onPress={() =>
                      copyToClipboard(
                        JSON.stringify(selectedRequest.response, null, 2),
                        'Response',
                      )
                    }
                  >
                    <S.CopyButtonText>Copy</S.CopyButtonText>
                  </S.CopyButton>
                </S.SectionContent>
              )}
            </S.Section>
          )}

          {selectedRequest.error && (
            <S.Section>
              <S.SectionHeader onPress={() => toggleSection('error')}>
                <S.SectionTitle>Error</S.SectionTitle>
                <S.ExpandIcon>{expanded.error ? '▼' : '▶'}</S.ExpandIcon>
              </S.SectionHeader>
              {expanded.error && (
                <S.SectionContent>
                  <S.DetailText>
                    {JSON.stringify(selectedRequest.error, null, 2)}
                  </S.DetailText>
                  <S.CopyButton
                    onPress={() =>
                      copyToClipboard(
                        JSON.stringify(selectedRequest.error, null, 2),
                        'Error',
                      )
                    }
                  >
                    <S.CopyButtonText>Copy</S.CopyButtonText>
                  </S.CopyButton>
                </S.SectionContent>
              )}
            </S.Section>
          )}

          <S.Section>
            <S.SectionHeader
              onPress={() =>
                copyToClipboard(generateCurl(selectedRequest), 'cURL')
              }
            >
              <S.SectionTitle>cURL Command</S.SectionTitle>
              <S.CopyButtonText>Copy</S.CopyButtonText>
            </S.SectionHeader>
            <S.SectionContent>
              <S.DetailText>{generateCurl(selectedRequest)}</S.DetailText>
            </S.SectionContent>
          </S.Section>
        </S.DetailContent>
      </S.DetailContainer>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <S.Container>
        <S.Header>
          {showCloseButton && (
            <TouchableOpacity onPress={onClose}>
              <S.BackButton>✕ Fechar</S.BackButton>
            </TouchableOpacity>
          )}
          <S.Title>{title}</S.Title>
          <TouchableOpacity onPress={clearRequests}>
            <S.ClearButton>Limpar</S.ClearButton>
          </TouchableOpacity>
        </S.Header>

        <S.Content>
          {selectedRequest ? (
            renderRequestDetail()
          ) : (
            <FlatList
              data={requests}
              renderItem={renderRequest}
              keyExtractor={(item: NetworkRequest) => item.id}
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={
                <S.EmptyContainer>
                  <S.EmptyText>Nenhuma request capturada ainda</S.EmptyText>
                  <S.EmptySubtext>
                    Faça algumas requisições para ver os logs aqui
                  </S.EmptySubtext>
                </S.EmptyContainer>
              }
            />
          )}
        </S.Content>
      </S.Container>
    </Modal>
  );
}
