import React, { useEffect, useRef } from 'react';
import {
  Animated,
  FlatList,
  Modal,
  PanResponder,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { NetworkRequest } from '../../services/network-logger';
import {
  getMethodStyle,
  getRequestItemStyle,
  getStatusStyle,
  styles,
} from './styles';
import { JsonHighlight } from './JsonHighlight';
import { ExpandableSectionKey, useHttpTraceModal } from './useHttpTraceModal';

interface HttpTraceModalProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  showCloseButton?: boolean;
}

export function HttpTraceModal({
  visible,
  onClose,
  title = '🌐 HTTP Trace',
  showCloseButton = true,
}: HttpTraceModalProps) {
  const {
    filteredRequests,
    selectedRequest,
    searchQuery,
    activeTypeFilter,
    activeStatusFilter,
    isFilterPanelVisible,
    activeFilterBadges,
    hasActiveFilters,
    setSearchQuery,
    selectRequest,
    clearRequests,
    toggleSection,
    getExpandedState,
    handleShare,
    toggleTypeFilter,
    toggleStatusFilter,
    toggleFilterPanel,
    extractPathFromUrl,
    getStatusColor,
    formatDuration,
    getDurationColor,
    generateCurl,
  } = useHttpTraceModal();

  const dismissThreshold = 150;
  const translateY = useRef(new Animated.Value(0)).current;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => gestureState.dy > 5,
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) {
          translateY.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > dismissThreshold) {
          Animated.timing(translateY, {
            toValue: 800,
            duration: 200,
            useNativeDriver: true,
          }).start(() => {
            translateY.setValue(0);
            onClose();
          });
        } else {
          Animated.spring(translateY, {
            toValue: 0,
            useNativeDriver: true,
            bounciness: 8,
          }).start();
        }
      },
    }),
  ).current;

  const filterPanelHeight = useRef(new Animated.Value(0)).current;
  const filterPanelOpacity = useRef(new Animated.Value(0)).current;
  const badgesRowHeight = useRef(new Animated.Value(0)).current;
  const badgesRowOpacity = useRef(new Animated.Value(0)).current;
  const displayedBadgesRef = useRef(activeFilterBadges);

  const hasBadges = activeFilterBadges.length > 0;

  if (hasBadges) {
    displayedBadgesRef.current = activeFilterBadges;
  }

  useEffect(() => {
    Animated.parallel([
      Animated.timing(filterPanelHeight, {
        toValue: isFilterPanelVisible ? 200 : 0,
        duration: 250,
        useNativeDriver: false,
      }),
      Animated.timing(filterPanelOpacity, {
        toValue: isFilterPanelVisible ? 1 : 0,
        duration: 250,
        useNativeDriver: false,
      }),
    ]).start();
  }, [isFilterPanelVisible, filterPanelHeight, filterPanelOpacity]);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(badgesRowHeight, {
        toValue: hasBadges ? 40 : 0,
        duration: 200,
        useNativeDriver: false,
      }),
      Animated.timing(badgesRowOpacity, {
        toValue: hasBadges ? 1 : 0,
        duration: 200,
        useNativeDriver: false,
      }),
    ]).start(() => {
      if (!hasBadges) {
        displayedBadgesRef.current = [];
      }
    });
  }, [hasBadges, badgesRowHeight, badgesRowOpacity]);

  const renderRequest = ({ item }: { item: NetworkRequest }) => (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={() => selectRequest(item)}>
      <View style={getRequestItemStyle(selectedRequest?.id === item.id)}>
        <View style={styles.requestHeader}>
          <View style={styles.methodContainer}>
            <Text style={getMethodStyle(getStatusColor(item.status))}>
              {item.method}
            </Text>
          </View>
          <View style={styles.requestInfo}>
            <Text style={styles.url} numberOfLines={1}>
              {extractPathFromUrl(item.url)}
            </Text>
            <Text style={styles.timestamp}>
              {new Date(item.timestamp).toLocaleTimeString()}
            </Text>
          </View>
          <View style={styles.statusContainer}>
            <Text style={getStatusStyle(getStatusColor(item.status))}>
              {item.status || 'PENDING'}
            </Text>
            <Text
              style={[
                styles.duration,
                { color: getDurationColor(item.duration) },
              ]}>
              {formatDuration(item.duration)}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderSection = (
    sectionTitle: string,
    content: any,
    sectionKey: ExpandableSectionKey,
    copyLabel: string,
  ) => {
    if (!selectedRequest || !content) return null;

    const expanded = getExpandedState(selectedRequest.id);
    const isExpanded = expanded[sectionKey];

    return (
      <View style={styles.section}>
        <TouchableOpacity onPress={() => toggleSection(sectionKey)}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{sectionTitle}</Text>
            <Text style={styles.expandIcon}>{isExpanded ? '▼' : '▶'}</Text>
          </View>
        </TouchableOpacity>
        {isExpanded && (
          <View style={styles.sectionContent}>
            <ScrollView
              style={styles.contentScroll}
              nestedScrollEnabled
              showsVerticalScrollIndicator>
              <JsonHighlight content={content} />
            </ScrollView>
            <TouchableOpacity
              onPress={() =>
                handleShare(
                  typeof content === 'string'
                    ? content
                    : JSON.stringify(content, null, 2),
                  copyLabel,
                )
              }>
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
              handleShare(generateCurl(selectedRequest), 'cURL Command')
            }>
            <Text style={styles.closeButton}>📤</Text>
          </TouchableOpacity>
          <Text style={styles.detailTitle}>
            {selectedRequest.method} {selectedRequest.url}
          </Text>
        </View>

        <ScrollView style={styles.detailContent}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Informações Gerais</Text>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>URL:</Text>
              <TouchableOpacity
                onPress={() => handleShare(selectedRequest.url, 'URL')}>
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
                ]}>
                {selectedRequest.status || 'Pending'}
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
            'Request Headers',
            selectedRequest.headers,
            'headers',
            'Request Headers',
          )}

          {renderSection(
            'Request Body',
            selectedRequest.body,
            'body',
            'Request Body',
          )}

          {renderSection(
            'Response',
            selectedRequest.response,
            'response',
            'Response Data',
          )}

          {renderSection('Error', selectedRequest.error, 'error', 'Error')}

          <View style={styles.section}>
            <TouchableOpacity
              onPress={() =>
                handleShare(generateCurl(selectedRequest), 'cURL')
              }>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>cURL Command</Text>
                <Text style={styles.copyButtonText}>Copy</Text>
              </View>
            </TouchableOpacity>
            <View style={styles.sectionContent}>
              <ScrollView
                style={styles.contentScroll}
                nestedScrollEnabled
                showsVerticalScrollIndicator>
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
      transparent
      onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <Animated.View
          style={[styles.container, { transform: [{ translateY }] }]}>
          <View
            style={styles.dragHandleContainer}
            {...panResponder.panHandlers}>
            <View style={styles.dragHandle} />
          </View>
          <View style={styles.header}>
            {selectedRequest ? (
              <>
                <TouchableOpacity onPress={() => selectRequest(null)}>
                  <Text style={styles.backButtonLabel}>
                    <Text style={styles.backButtonIcon}>{'‹ '}</Text>
                    Voltar
                  </Text>
                </TouchableOpacity>
                <View style={styles.headerSpacer} />
              </>
            ) : (
              <>
                {showCloseButton && (
                  <TouchableOpacity onPress={onClose}>
                    <Text style={styles.backButton}>✕ Fechar</Text>
                  </TouchableOpacity>
                )}
                <Text style={styles.title}>{title}</Text>
                <TouchableOpacity onPress={clearRequests}>
                  <Text style={styles.clearButton}>Limpar</Text>
                </TouchableOpacity>
              </>
            )}
          </View>

          {!selectedRequest && (
            <View style={styles.searchFilterContainer}>
              <View style={styles.searchRow}>
                <View style={styles.searchInputWrapper}>
                  <Text style={styles.searchIcon}>🔍</Text>
                  <TextInput
                    style={styles.searchInput}
                    placeholder="Buscar por URL ou método..."
                    placeholderTextColor="#999"
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    autoCapitalize="none"
                    autoCorrect={false}
                    clearButtonMode="while-editing"
                  />
                </View>
                <TouchableOpacity
                  onPress={toggleFilterPanel}
                  style={[
                    styles.filterToggleButton,
                    hasActiveFilters && styles.filterToggleButtonActive,
                  ]}>
                  <Text
                    style={[
                      styles.filterToggleIcon,
                      hasActiveFilters && styles.filterToggleIconActive,
                    ]}>
                    ⚙
                  </Text>
                </TouchableOpacity>
              </View>

              <Animated.View
                style={[
                  styles.activeBadgesRow,
                  {
                    maxHeight: badgesRowHeight,
                    opacity: badgesRowOpacity,
                  },
                ]}>
                {(hasBadges ? activeFilterBadges : displayedBadgesRef.current).map(badge => (
                  <TouchableOpacity
                    key={badge.label}
                    onPress={badge.onRemove}
                    style={styles.activeBadge}>
                    <Text style={styles.activeBadgeLabel}>{badge.label}</Text>
                    <Text style={styles.activeBadgeRemove}>✕</Text>
                  </TouchableOpacity>
                ))}
              </Animated.View>

              <Animated.View
                style={[
                  styles.filterPanel,
                  {
                    maxHeight: filterPanelHeight,
                    opacity: filterPanelOpacity,
                  },
                ]}>
                  <Text style={styles.filterPanelSectionTitle}>Tipo</Text>
                  <View style={styles.filterButtonsRow}>
                    <TouchableOpacity
                      onPress={() => toggleTypeFilter('xhr')}
                      style={[
                        styles.filterButton,
                        activeTypeFilter === 'xhr' && styles.filterButtonActive,
                      ]}>
                      <Text
                        style={[
                          styles.filterButtonLabel,
                          activeTypeFilter === 'xhr' &&
                            styles.filterButtonLabelActive,
                        ]}>
                        XHR
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => toggleTypeFilter('fetch')}
                      style={[
                        styles.filterButton,
                        activeTypeFilter === 'fetch' &&
                          styles.filterButtonActive,
                      ]}>
                      <Text
                        style={[
                          styles.filterButtonLabel,
                          activeTypeFilter === 'fetch' &&
                            styles.filterButtonLabelActive,
                        ]}>
                        Fetch
                      </Text>
                    </TouchableOpacity>
                  </View>
                  <Text style={styles.filterPanelSectionTitle}>Status</Text>
                  <View style={styles.filterButtonsRow}>
                    <TouchableOpacity
                      onPress={() => toggleStatusFilter('2xx')}
                      style={[
                        styles.filterButton,
                        activeStatusFilter === '2xx' &&
                          styles.filterButtonStatusSuccess,
                      ]}>
                      <Text
                        style={[
                          styles.filterButtonLabel,
                          activeStatusFilter === '2xx' &&
                            styles.filterButtonLabelActive,
                        ]}>
                        2xx
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => toggleStatusFilter('4xx')}
                      style={[
                        styles.filterButton,
                        activeStatusFilter === '4xx' &&
                          styles.filterButtonStatusWarning,
                      ]}>
                      <Text
                        style={[
                          styles.filterButtonLabel,
                          activeStatusFilter === '4xx' &&
                            styles.filterButtonLabelActive,
                        ]}>
                        4xx
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => toggleStatusFilter('5xx')}
                      style={[
                        styles.filterButton,
                        activeStatusFilter === '5xx' &&
                          styles.filterButtonStatusError,
                      ]}>
                      <Text
                        style={[
                          styles.filterButtonLabel,
                          activeStatusFilter === '5xx' &&
                            styles.filterButtonLabelActive,
                        ]}>
                        5xx
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => toggleStatusFilter('error')}
                      style={[
                        styles.filterButton,
                        activeStatusFilter === 'error' &&
                          styles.filterButtonStatusError,
                      ]}>
                      <Text
                        style={[
                          styles.filterButtonLabel,
                          activeStatusFilter === 'error' &&
                            styles.filterButtonLabelActive,
                        ]}>
                        Errors
                      </Text>
                    </TouchableOpacity>
                  </View>
              </Animated.View>
            </View>
          )}

          <View style={styles.content}>
            {selectedRequest ? (
              renderRequestDetail()
            ) : (
              <FlatList
                data={filteredRequests}
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
        </Animated.View>
      </View>
    </Modal>
  );
}
