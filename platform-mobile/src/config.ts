import Constants from "expo-constants";
import { Platform } from "react-native";

const DEFAULT_FRONTEND_PORT = 5174;

const trimTrailingSlash = (value: string) => value.replace(/\/+$/, "");

const getDebuggerHost = () => {
  const hostUri =
    Constants.expoConfig?.hostUri ||
    Constants.manifest2?.extra?.expoGo?.debuggerHost ||
    Constants.manifest?.debuggerHost;

  return hostUri?.split(":")[0];
};

export const getPlatformFrontendOrigin = () => {
  const configured =
    process.env.EXPO_PUBLIC_PLATFORM_FRONTEND_URL ||
    Constants.expoConfig?.extra?.platformFrontendUrl;

  if (typeof configured === "string" && configured.length > 0) {
    return trimTrailingSlash(configured);
  }

  if (Platform.OS === "android") {
    return `http://10.0.2.2:${DEFAULT_FRONTEND_PORT}`;
  }

  const debuggerHost = getDebuggerHost();
  if (debuggerHost) {
    return `http://${debuggerHost}:${DEFAULT_FRONTEND_PORT}`;
  }

  return `http://localhost:${DEFAULT_FRONTEND_PORT}`;
};

export const platformFrontendOrigin = getPlatformFrontendOrigin();
