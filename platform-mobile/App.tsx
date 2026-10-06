import { StatusBar } from "expo-status-bar";
import PlatformWebApp from "./src/PlatformWebApp";

export default function App() {
  return (
    <>
      <StatusBar hidden />
      <PlatformWebApp />
    </>
  );
}
