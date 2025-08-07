import React, { useEffect, useState } from "react";
import { DeviceEventEmitter } from "react-native";
import { HttpTraceModal } from "./HttpTraceModal";

interface HttpTraceShakeProps {
  enabled?: boolean;
  shakeThreshold?: number;
}

export function HttpTraceShake({
  enabled = true,
  shakeThreshold = 800,
}: HttpTraceShakeProps) {
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    if (!enabled) return;

    let lastShake = 0;
    let lastX = 0,
      lastY = 0,
      lastZ = 0;

    const subscription = DeviceEventEmitter.addListener(
      "RCTDeviceMotion",
      (data) => {
        const { acceleration } = data;
        const now = Date.now();

        if (now - lastShake < 500) return;

        const deltaX = Math.abs(lastX - acceleration.x);
        const deltaY = Math.abs(lastY - acceleration.y);
        const deltaZ = Math.abs(lastZ - acceleration.z);

        const delta = deltaX + deltaY + deltaZ;

        if (delta > shakeThreshold / 1000) {
          lastShake = now;
          setModalVisible(true);
        }

        lastX = acceleration.x;
        lastY = acceleration.y;
        lastZ = acceleration.z;
      }
    );

    return () => subscription?.remove();
  }, [enabled, shakeThreshold]);

  return (
    <HttpTraceModal
      visible={modalVisible}
      onClose={() => setModalVisible(false)}
    />
  );
}
