import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  DeviceEventEmitter,
  Dimensions,
  PanResponder,
  Text,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";

import { HttpTraceModal } from "../HttpTraceModal";
import { styles } from "./styles";

interface HttpTraceButtonProps {
  visible?: boolean;
}

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");
const BUTTON_SIZE = 56;
const HIDE_DURATION = 10000;

export function HttpTraceButton({ visible = true }: HttpTraceButtonProps) {
  const [modalVisible, setModalVisible] = useState(false);
  const hideTimeoutRef = useRef<NodeJS.Timeout>();

  const translateX = useSharedValue(screenWidth - BUTTON_SIZE - 20);
  const translateY = useSharedValue(screenHeight - BUTTON_SIZE - 100);
  const opacity = useSharedValue(1);

  const hideButton = useCallback(() => {
    opacity.value = withTiming(0, { duration: 200 });

    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
    }

    hideTimeoutRef.current = setTimeout(() => {
      opacity.value = withTiming(1, { duration: 300 });
    }, HIDE_DURATION);
  }, [opacity]);

  const openModal = useCallback(() => {
    setModalVisible(true);
  }, []);

  useEffect(() => {
    if (!visible) {
      return undefined;
    }

    const handleOpenModal = () => {
      setModalVisible(true);
    };

    const subscription = DeviceEventEmitter.addListener(
      "OpenHttpTrace",
      handleOpenModal
    );

    return () => {
      subscription.remove();
    };
  }, [visible]);

  const startPosition = useRef({ x: 0, y: 0 });
  const pressStartTime = useRef(0);

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onPanResponderGrant: () => {
          startPosition.current.x = translateX.value;
          startPosition.current.y = translateY.value;
          pressStartTime.current = Date.now();
        },
        onPanResponderMove: (_, gestureState) => {
          translateX.value = startPosition.current.x + gestureState.dx;
          translateY.value = startPosition.current.y + gestureState.dy;
        },
        onPanResponderRelease: (_, gestureState) => {
          const distance = Math.sqrt(
            gestureState.dx ** 2 + gestureState.dy ** 2
          );
          const pressDuration = Date.now() - pressStartTime.current;
          const isTap = distance < 10;
          const isLongPress = pressDuration > 500;

          if (isTap && isLongPress) {
            hideButton();
            return;
          }

          if (isTap) {
            openModal();
            return;
          }

          const snapToLeft = translateX.value < screenWidth / 2;
          const finalY = Math.max(
            50,
            Math.min(screenHeight - BUTTON_SIZE - 100, translateY.value)
          );

          translateX.value = withSpring(
            snapToLeft ? 20 : screenWidth - BUTTON_SIZE - 20
          );
          translateY.value = withSpring(finalY);
        },
      }),
    [translateX, translateY, hideButton, openModal]
  );

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
      ],
      opacity: opacity.value,
    };
  });

  useEffect(() => {
    return () => {
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
      }
    };
  }, []);

  if (!visible) return null;

  return (
    <>
      <Animated.View
        style={[styles.floatingButton, animatedStyle]}
        {...panResponder.panHandlers}
      >
        <Text style={styles.buttonText}>🌐</Text>
      </Animated.View>

      <HttpTraceModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
      />
    </>
  );
}
