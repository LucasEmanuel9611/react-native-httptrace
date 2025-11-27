import React, { useRef, useState } from "react";
import { PanResponder, View } from "react-native";

import { useHttpTrace } from "../../hooks/useHttpTrace";
import { HttpTraceModal } from "../HttpTraceModal";

interface HttpTraceShakeProps {
  children?: React.ReactNode;
}

const MINIMUM_SWIPE_DISTANCE = 20;

function HttpTraceGestureDetector({ children }: HttpTraceShakeProps) {
  const [modalVisible, setModalVisible] = useState(false);
  const startPosition = useRef({ x: 0, y: 0 });
  const isThreeFingerGesture = useRef(false);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponderCapture: (evt) => {
        const touchCount = evt.nativeEvent.touches.length;

        if (touchCount === 3) {
          isThreeFingerGesture.current = true;
          const touch = evt.nativeEvent.touches[0];
          if (touch) {
            startPosition.current = { x: touch.pageX, y: touch.pageY };
          }
          return true;
        }

        isThreeFingerGesture.current = false;
        return false;
      },
      onMoveShouldSetPanResponderCapture: (evt) => {
        return (
          evt.nativeEvent.touches.length === 3 && isThreeFingerGesture.current
        );
      },
      onPanResponderRelease: (evt) => {
        if (isThreeFingerGesture.current) {
          const touch = evt.nativeEvent.changedTouches[0];
          if (touch) {
            const deltaX = touch.pageX - startPosition.current.x;
            const deltaY = touch.pageY - startPosition.current.y;
            const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

            if (distance >= MINIMUM_SWIPE_DISTANCE) {
              setModalVisible(true);
            }
          }
        }
        isThreeFingerGesture.current = false;
      },
      onPanResponderTerminationRequest: () => true,
      onShouldBlockNativeResponder: () => false,
    })
  ).current;

  return (
    <>
      <View
        style={{
          flex: 1,
        }}
        {...panResponder.panHandlers}
      >
        {children}
      </View>
      <HttpTraceModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
      />
    </>
  );
}

export function HttpTraceView({ children }: HttpTraceShakeProps) {
  const { shouldShowHttpTrace } = useHttpTrace();

  if (!shouldShowHttpTrace) {
    return children as React.ReactElement;
  }

  return <HttpTraceGestureDetector>{children}</HttpTraceGestureDetector>;
}
