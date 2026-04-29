import { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, LayoutAnimation, Platform, UIManager } from 'react-native';

import { shareText } from '../../helpers/share';
import { networkLogger, NetworkRequest } from '../../services/network-logger';
import { Theme } from '../../theme';

if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

type RequestTypeFilter = 'all' | 'fetch' | 'xhr';
type RequestStatusFilter = 'all' | '2xx' | '4xx' | '5xx' | 'error';
type ExpandableSectionKey = 'headers' | 'body' | 'response' | 'error';

interface ExpandedSections {
  [key: string]: Record<ExpandableSectionKey, boolean>;
}

const DEFAULT_SECTION_STATE: Record<ExpandableSectionKey, boolean> = {
  headers: false,
  body: false,
  response: false,
  error: false,
};

const extractPathFromUrl = (fullUrl: string): string => {
  try {
    const parsedUrl = new URL(fullUrl);
    return parsedUrl.pathname + parsedUrl.search;
  } catch {
    return fullUrl;
  }
};

const matchesStatusFilter = (
  request: NetworkRequest,
  filter: RequestStatusFilter,
): boolean => {
  if (filter === 'all') return true;
  const { status } = request;
  if (filter === 'error') return !status || status === 0 || status >= 400;
  if (filter === '2xx') return !!status && status >= 200 && status < 300;
  if (filter === '4xx') return !!status && status >= 400 && status < 500;
  if (filter === '5xx') return !!status && status >= 500;
  return true;
};

const getStatusColor = (status?: number): string => {
  if (!status) return '#999';
  if (status >= 200 && status < 300) return '#4CAF50';
  if (status >= 400 && status < 500) return '#FF9800';
  if (status >= 500) return '#F44336';
  return '#999';
};

const formatDuration = (duration?: number): string => {
  if (!duration) return 'N/A';
  return `${duration}ms`;
};

const getDurationColor = (duration?: number): string => {
  if (!duration) return Theme.colors.neutralDark;
  if (duration >= 3000) return '#F44336';
  if (duration >= 1000) return '#FF9800';
  return Theme.colors.neutralDark;
};

const generateCurl = (request: NetworkRequest): string => {
  let curl = `curl -X ${request.method} "${request.url}"`;

  if (request.headers) {
    Object.entries(request.headers).forEach(([key, value]) => {
      curl += ` \\\n  -H "${key}: ${value}"`;
    });
  }

  if (request.body && typeof request.body === 'string') {
    curl += ` \\\n  -d '${request.body}'`;
  }

  return curl;
};

const useHttpTraceModal = () => {
  const [requests, setRequests] = useState<NetworkRequest[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<NetworkRequest | null>(
    null,
  );
  const [expandedSections, setExpandedSections] = useState<ExpandedSections>(
    {},
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTypeFilter, setActiveTypeFilter] =
    useState<RequestTypeFilter>('all');
  const [activeStatusFilter, setActiveStatusFilter] =
    useState<RequestStatusFilter>('all');
  const [isFilterPanelVisible, setIsFilterPanelVisible] = useState(false);

  const activeFilterBadges = useMemo(() => {
    const badges: { label: string; onRemove: () => void }[] = [];
    if (activeTypeFilter !== 'all') {
      badges.push({
        label: activeTypeFilter.toUpperCase(),
        onRemove: () => setActiveTypeFilter('all'),
      });
    }
    if (activeStatusFilter !== 'all') {
      badges.push({
        label: activeStatusFilter === 'error' ? 'Errors' : activeStatusFilter,
        onRemove: () => setActiveStatusFilter('all'),
      });
    }
    return badges;
  }, [activeTypeFilter, activeStatusFilter]);

  const hasActiveFilters =
    activeTypeFilter !== 'all' || activeStatusFilter !== 'all';

  const animateLayoutTransition = useCallback(() => {
    LayoutAnimation.configureNext({
      duration: 300,
      create: {
        type: LayoutAnimation.Types.easeInEaseOut,
        property: LayoutAnimation.Properties.opacity,
      },
      update: {
        type: LayoutAnimation.Types.easeInEaseOut,
      },
      delete: {
        type: LayoutAnimation.Types.easeInEaseOut,
        property: LayoutAnimation.Properties.opacity,
      },
    });
  }, []);

  const toggleFilterPanel = useCallback(() => {
    animateLayoutTransition();
    setIsFilterPanelVisible(prev => !prev);
  }, [animateLayoutTransition]);

  const filteredRequests = useMemo(() => {
    return requests.filter(request => {
      const matchesType =
        activeTypeFilter === 'all' || request.type === activeTypeFilter;
      const matchesSearch =
        searchQuery.length === 0 ||
        request.url.toLowerCase().includes(searchQuery.toLowerCase()) ||
        request.method.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = matchesStatusFilter(request, activeStatusFilter);
      return matchesType && matchesSearch && matchesStatus;
    });
  }, [requests, activeTypeFilter, searchQuery, activeStatusFilter]);

  useEffect(() => {
    return networkLogger.subscribe(setRequests);
  }, []);

  useEffect(() => {
    if (selectedRequest && !expandedSections[selectedRequest.id]) {
      setExpandedSections(prev => ({
        ...prev,
        [selectedRequest.id]: { ...DEFAULT_SECTION_STATE },
      }));
    }
  }, [selectedRequest, expandedSections]);

  const clearRequests = useCallback(() => {
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
  }, []);

  const toggleSection = useCallback(
    (section: ExpandableSectionKey) => {
      if (!selectedRequest) return;

      setExpandedSections(prev => {
        const currentState = prev[selectedRequest.id] || {
          ...DEFAULT_SECTION_STATE,
        };
        return {
          ...prev,
          [selectedRequest.id]: {
            ...currentState,
            [section]: !currentState[section],
          },
        };
      });
    },
    [selectedRequest],
  );

  const getExpandedState = useCallback(
    (requestId: string) => {
      return expandedSections[requestId] || DEFAULT_SECTION_STATE;
    },
    [expandedSections],
  );

  const handleShare = useCallback((text: string, shareTitle: string) => {
    shareText(text, shareTitle).catch(() => {});
  }, []);

  const toggleTypeFilter = useCallback(
    (filter: RequestTypeFilter) => {
      animateLayoutTransition();
      setActiveTypeFilter(prev => (prev === filter ? 'all' : filter));
    },
    [animateLayoutTransition],
  );

  const toggleStatusFilter = useCallback(
    (filter: RequestStatusFilter) => {
      animateLayoutTransition();
      setActiveStatusFilter(prev => (prev === filter ? 'all' : filter));
    },
    [animateLayoutTransition],
  );

  const selectRequest = useCallback(
    (request: NetworkRequest | null) => {
      animateLayoutTransition();
      setSelectedRequest(request);
    },
    [animateLayoutTransition],
  );

  return {
    filteredRequests,
    selectedRequest,
    searchQuery,
    activeTypeFilter,
    activeStatusFilter,
    isFilterPanelVisible,
    activeFilterBadges,
    hasActiveFilters,
    setSearchQuery: (query: string) => {
      animateLayoutTransition();
      setSearchQuery(query);
    },
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
  };
};

export { useHttpTraceModal };
export type { ExpandableSectionKey };
