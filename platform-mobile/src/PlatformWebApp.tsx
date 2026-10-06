import { useState } from "react";
import {
  ActivityIndicator,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  View
} from "react-native";
import { WebView } from "react-native-webview";
import { platformFrontendOrigin } from "./config";

const createUrl = (path: string) => {
  const targetPath = path === "/" ? "/login" : path;
  const origin = platformFrontendOrigin.endsWith("/login")
    ? platformFrontendOrigin.slice(0, -"/login".length)
    : platformFrontendOrigin;

  return `${origin}${targetPath}`;
};
const NativeWebView = WebView as any;

export default function PlatformWebApp() {
  const [currentUrl, setCurrentUrl] = useState(createUrl("/login"));

  if (Platform.OS === "web") {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.webHeader}>
          <Text style={styles.title}>Platform Mobile</Text>
          <Text style={styles.origin}>{platformFrontendOrigin}</Text>
        </View>
        <iframe title="Platform frontend" src={currentUrl} style={webFrameStyle} />
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.safeArea}>
      <NativeWebView
        source={{ uri: currentUrl }}
        style={styles.webView}
        onNavigationStateChange={(event: { url: string }) => setCurrentUrl(event.url)}
        originWhitelist={["*"]}
        javaScriptEnabled
        domStorageEnabled
        sharedCookiesEnabled
        thirdPartyCookiesEnabled
        setSupportMultipleWindows={false}
        allowsBackForwardNavigationGestures
        mixedContentMode="always"
        startInLoadingState
        renderLoading={() => (
          <View style={styles.loader}>
            <ActivityIndicator size="large" color="#0f766e" />
            <Text style={styles.loaderText}>Opening platform frontend...</Text>
          </View>
        )}
      />
    </View>
  );
}

const webFrameStyle = {
  borderWidth: 0,
  flex: 1,
  height: "100%",
  width: "100%"
} as const;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#ffffff"
  },
  webHeader: {
    minHeight: 52,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: "#dbe4ee",
    backgroundColor: "#ffffff"
  },
  title: {
    color: "#0f172a",
    fontSize: 16,
    fontWeight: "700"
  },
  origin: {
    color: "#64748b",
    fontSize: 12,
    marginTop: 2,
    maxWidth: 280
  },
  webView: {
    flex: 1,
    backgroundColor: "#ffffff"
  },
  loader: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ffffff"
  },
  loaderText: {
    marginTop: 12,
    color: "#475569",
    fontSize: 14
  }
});
