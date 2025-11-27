import { useCallback, useEffect, useState } from "react";

export interface HttpTraceDevMenuOptions {
  title?: string;
  enabled?: boolean;
}

export const useHttpTraceDevMenu = (options: HttpTraceDevMenuOptions = {}) => {
  const [modalVisible, setModalVisible] = useState(false);

  const openModal = useCallback(() => setModalVisible(true), []);
  const closeModal = useCallback(() => setModalVisible(false), []);

  useEffect(() => {
    if (!options.enabled) return;

    const { DevSettings } = require("react-native");
    DevSettings.addMenuItem("Http trace", openModal);
  }, [options.enabled, openModal]);

  return {
    modalVisible,
    openModal,
    closeModal,
    title: options.title || "HTTP Trace - Dev Menu",
  };
};
