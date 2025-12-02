import React, { useCallback, useEffect, useRef, useState } from "react";
import { PanResponder, View } from "react-native";

import { useHttpTrace } from "../../hooks/useHttpTrace";
import { HttpTraceModal } from "../HttpTraceModal";

interface HttpTraceViewProps {
  children?: React.ReactNode;
  longPressDuration?: number;
  enableLongPress?: boolean;
}

const MINIMUM_SWIPE_DISTANCE = 20;
const DEFAULT_LONG_PRESS_DURATION = 1500;
const LONG_PRESS_CANCEL_THRESHOLD = 5;

function HttpTraceGestureDetector({
  children,
  longPressDuration = DEFAULT_LONG_PRESS_DURATION,
  enableLongPress = true,
}: HttpTraceViewProps) {
  const [modalVisible, setModalVisible] = useState(false);
  const startPosition = useRef({ x: 0, y: 0 });
  const isThreeFingerGesture = useRef(false);

  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const touchStartTime = useRef<number>(0);
  const isTouchActive = useRef(false);

  const clearLongPressTimer = useCallback(() => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      clearLongPressTimer();
    };
  }, [clearLongPressTimer]);

  const handleTouchStart = useCallback(
    (evt: any) => {
      if (!enableLongPress) return;

      const touchCount = evt.nativeEvent.touches.length;
      if (touchCount !== 1) {
        clearLongPressTimer();
        return;
      }

      const touch = evt.nativeEvent.touches[0];
      if (!touch) return;

      isTouchActive.current = true;
      touchStartTime.current = Date.now();
      startPosition.current = { x: touch.pageX, y: touch.pageY };

      clearLongPressTimer();
      longPressTimer.current = setTimeout(() => {
        if (isTouchActive.current) {
          setModalVisible(true);
          isTouchActive.current = false;
        }
      }, longPressDuration);
    },
    [enableLongPress, longPressDuration, clearLongPressTimer]
  );

  const handleTouchMove = useCallback(
    (evt: any) => {
      if (!enableLongPress || !isTouchActive.current) return;

      const touch = evt.nativeEvent.touches[0];
      if (!touch) {
        clearLongPressTimer();
        isTouchActive.current = false;
        return;
      }

      const deltaX = touch.pageX - startPosition.current.x;
      const deltaY = touch.pageY - startPosition.current.y;
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

      if (distance > LONG_PRESS_CANCEL_THRESHOLD) {
        clearLongPressTimer();
        isTouchActive.current = false;
      }
    },
    [enableLongPress, clearLongPressTimer]
  );

  const handleTouchEnd = useCallback(() => {
    clearLongPressTimer();
    isTouchActive.current = false;
  }, [clearLongPressTimer]);

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
        style={{ flex: 1 }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchEnd}
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

export function HttpTraceView({
  children,
  longPressDuration,
  enableLongPress,
}: HttpTraceViewProps) {
  const { shouldShowHttpTrace } = useHttpTrace();

  if (!shouldShowHttpTrace) {
    return children as React.ReactElement;
  }

  return (
    <HttpTraceGestureDetector
      longPressDuration={longPressDuration}
      enableLongPress={enableLongPress}
    >
      {children}
    </HttpTraceGestureDetector>
  );
}
