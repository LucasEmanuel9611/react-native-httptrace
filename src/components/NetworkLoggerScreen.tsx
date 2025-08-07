import React, { useEffect, useState } from 'react';
import { Alert, FlatList, Text, TouchableOpacity, View } from 'react-native';

import { networkLogger, NetworkRequest } from '../services/network-logger';

interface ExpandedSections {
  [key: string]: {
    headers: boolean;
    body: boolean;
    response: boolean;
    error: boolean;
  };
}

export function NetworkLoggerScreen() {
  const [requests, setRequests] = useState<NetworkRequest[]>([]);
  const [expandedSections, setExpandedSections] = useState<ExpandedSections>(
    {},
  );

  useEffect(() => {
    return networkLogger.subscribe(setRequests);
  }, []);

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

  const renderRequest = ({ item }: { item: NetworkRequest }) => (
    <View
      style={{ padding: 10, borderBottomWidth: 1, borderBottomColor: '#eee' }}
    >
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <Text style={{ fontWeight: 'bold' }}>{item.method}</Text>
        <Text style={{ color: getStatusColor(item.status) }}>
          {item.status || 'Pending'}
        </Text>
      </View>
      <Text numberOfLines={1} style={{ color: '#666', marginTop: 5 }}>
        {item.fullUrl || item.url}
      </Text>
      <Text style={{ fontSize: 12, color: '#999', marginTop: 5 }}>
        {formatDuration(item.duration)}
      </Text>
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <View
        style={{ padding: 20, borderBottomWidth: 1, borderBottomColor: '#eee' }}
      >
        <Text style={{ fontSize: 24, fontWeight: 'bold' }}>Network Logger</Text>
        <Text style={{ color: '#666', marginTop: 5 }}>
          {requests.length} requisições capturadas
        </Text>
        <TouchableOpacity
          onPress={clearRequests}
          style={{
            backgroundColor: '#f44336',
            padding: 10,
            borderRadius: 5,
            marginTop: 10,
            alignItems: 'center',
          }}
        >
          <Text style={{ color: '#fff', fontWeight: 'bold' }}>Limpar Logs</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={requests}
        renderItem={renderRequest}
        keyExtractor={item => item.id}
        style={{ flex: 1 }}
      />
    </View>
  );
}
