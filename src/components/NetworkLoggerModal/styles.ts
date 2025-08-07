import { Platform, ScrollView, TouchableOpacity } from 'react-native';

import styled from 'styled-components/native';

export const Container = styled.SafeAreaView`
  flex: 1;
  background-color: #f5f5f5;
`;

export const Header = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding-horizontal: 16px;
  padding-vertical: 12px;
  background-color: #fff;
  border-bottom-width: 1px;
  border-bottom-color: #e0e0e0;
`;

export const BackButton = styled.Text`
  font-size: 16px;
  color: #007aff;
`;

export const Title = styled.Text`
  font-size: 18px;
  font-weight: bold;
  color: #333;
`;

export const ClearButton = styled.Text`
  font-size: 16px;
  color: #ff3b30;
`;

export const Content = styled.View`
  flex: 1;
`;

export const RequestItem = styled(TouchableOpacity)<{ selected?: boolean }>`
  background-color: #fff;
  margin-horizontal: 16px;
  margin-vertical: 4px;
  border-radius: 8px;
  padding: 12px;
  elevation: 2;
  shadow-color: #000;
  shadow-offset: 0px 1px;
  shadow-opacity: 0.1;
  shadow-radius: 2px;
  border-color: ${props => (props.selected ? '#007AFF' : 'transparent')};
  border-width: ${props => (props.selected ? '2px' : '0px')};
`;

export const RequestHeader = styled.View`
  flex-direction: row;
  align-items: center;
`;

export const MethodContainer = styled.View`
  margin-right: 12px;
`;

export const Method = styled.Text<{ backgroundColor: string }>`
  font-size: 12px;
  font-weight: bold;
  color: #fff;
  padding-horizontal: 8px;
  padding-vertical: 4px;
  border-radius: 4px;
  min-width: 50px;
  text-align: center;
  background-color: ${props => props.backgroundColor};
`;

export const RequestInfo = styled.View`
  flex: 1;
`;

export const Url = styled.Text`
  font-size: 14px;
  font-weight: 500;
  color: #333;
  margin-bottom: 4px;
`;

export const Timestamp = styled.Text`
  font-size: 12px;
  color: #666;
`;

export const StatusContainer = styled.View`
  align-items: flex-end;
`;

export const Status = styled.Text<{ color: string }>`
  font-size: 14px;
  font-weight: bold;
  margin-bottom: 2px;
  color: ${props => props.color};
`;

export const Duration = styled.Text`
  font-size: 12px;
  color: #666;
`;

export const EmptyContainer = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
  padding-horizontal: 32px;
`;

export const EmptyText = styled.Text`
  font-size: 18px;
  font-weight: bold;
  color: #666;
  text-align: center;
  margin-bottom: 8px;
`;

export const EmptySubtext = styled.Text`
  font-size: 14px;
  color: #999;
  text-align: center;
`;

export const DetailContainer = styled.View`
  flex: 1;
  background-color: #fff;
`;

export const DetailHeader = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  border-bottom-width: 1px;
  border-bottom-color: #e0e0e0;
`;

export const DetailTitle = styled.Text`
  font-size: 16px;
  font-weight: bold;
  color: #333;
  flex: 1;
`;

export const CloseButton = styled.Text`
  font-size: 20px;
  color: #666;
  padding: 4px;
`;

export const ActionButtons = styled.View`
  flex-direction: row;
  padding: 16px;
  border-bottom-width: 1px;
  border-bottom-color: #e0e0e0;
`;

export const ActionButton = styled(TouchableOpacity)`
  background-color: #007aff;
  padding-vertical: 8px;
  padding-horizontal: 16px;
  border-radius: 6px;
  margin-right: 8px;
`;

export const ActionButtonText = styled.Text`
  color: #fff;
  font-size: 14px;
  font-weight: 500;
`;

export const DetailContent = styled(ScrollView)`
  flex: 1;
  padding: 16px;
`;

export const Section = styled.View`
  margin-bottom: 16px;
`;

export const SectionHeader = styled(TouchableOpacity)`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding-vertical: 12px;
  padding-horizontal: 16px;
  background-color: #f8f9fa;
  border-radius: 8px;
`;

export const SectionTitle = styled.Text`
  font-size: 18px;
  font-weight: bold;
  color: #333;
`;

export const ExpandIcon = styled.Text`
  font-size: 16px;
  color: #666;
`;

export const SectionContent = styled.View`
  padding: 16px;
  background-color: #fff;
  border-width: 1px;
  border-color: #e0e0e0;
  border-top-width: 0px;
  border-bottom-left-radius: 8px;
  border-bottom-right-radius: 8px;
`;

export const DetailText = styled.Text`
  font-size: 16px;
  color: #333;
  font-family: ${Platform.OS === 'ios' ? 'Menlo' : 'monospace'};
  margin-bottom: 12px;
`;

export const CopyButton = styled(TouchableOpacity)`
  background-color: #28a745;
  padding-vertical: 8px;
  padding-horizontal: 16px;
  border-radius: 6px;
  align-self: flex-start;
`;

export const CopyButtonText = styled.Text`
  color: #fff;
  font-size: 16px;
  font-weight: 500;
`;
