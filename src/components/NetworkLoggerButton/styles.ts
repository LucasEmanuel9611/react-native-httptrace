import { TouchableOpacity } from 'react-native';

import styled from 'styled-components/native';

export const FloatingButton = styled(TouchableOpacity)`
  position: absolute;
  bottom: 100px;
  right: 20px;
  width: 50px;
  height: 50px;
  border-radius: 25px;
  background-color: blue;
  justify-content: center;
  align-items: center;
  elevation: 8;
  shadow-color: #000;
  shadow-offset: 0px 2px;
  shadow-opacity: 0.25;
  shadow-radius: 3.84px;
  z-index: 9999;
`;
