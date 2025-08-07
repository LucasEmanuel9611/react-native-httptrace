import { useCallback, useState } from "react";
import { useHttpTraceDevMenu } from "./useHttpTraceDevMenu";

export interface HttpTraceUIOptions {
  enableShake?: boolean;
  enableDevMenu?: boolean;
  enableToast?: boolean;
  enableBadge?: boolean;
  enableStatusIndicator?: boolean;

  badgePosition?: "top-left" | "top-right" | "bottom-left" | "bottom-right";
  badgeShowOnlyErrors?: boolean;

  toastPosition?: "top" | "bottom";
  toastDuration?: number;

  statusCompact?: boolean;
  statusColor?: string;

  shakeThreshold?: number;
}

export const useHttpTraceUI = (options: HttpTraceUIOptions = {}) => {
  const [modalVisible, setModalVisible] = useState(false);

  const openModal = useCallback(() => setModalVisible(true), []);
  const closeModal = useCallback(() => setModalVisible(false), []);

  useHttpTraceDevMenu(openModal, {
    enabled: options.enableDevMenu,
  });

  return {
    modalVisible,
    openModal,
    closeModal,
    options,
  };
};
