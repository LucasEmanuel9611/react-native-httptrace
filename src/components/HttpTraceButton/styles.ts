import { StyleSheet } from "react-native";

export const BUTTON_SIZE = 56;

export const styles = StyleSheet.create({
  floatingButton: {
    position: "absolute",
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
    borderRadius: BUTTON_SIZE / 2,
    backgroundColor: "#007aff",
    justifyContent: "center",
    alignItems: "center",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    zIndex: 1000,
  },
  buttonText: {
    fontSize: 24,
    color: "#fff",
  },
});
