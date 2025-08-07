import { useEffect } from "react";
import { NativeModules } from "react-native";

interface DevMenuOptions {
  title?: string;
  enabled?: boolean;
}

export const useHttpTraceDevMenu = (
  onOpenLogger: () => void,
  options: DevMenuOptions = {}
) => {
  const { title = "HTTP Trace", enabled = true } = options;

  useEffect(() => {
    if (!enabled || !__DEV__) return;

    try {
      const DevMenu = NativeModules.DevMenu;
      if (DevMenu && DevMenu.addItem) {
        DevMenu.addItem(title, onOpenLogger);

        return () => {
          if (DevMenu.removeItem) {
            DevMenu.removeItem(title);
          }
        };
      }
    } catch (error) {
      console.warn("HttpTrace: Could not add to dev menu:", error);
    }
  }, [title, enabled, onOpenLogger]);
};
