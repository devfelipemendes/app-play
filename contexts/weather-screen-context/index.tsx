import React, { createContext, useRef, useState } from "react";
import { View } from "react-native";

const WeatherTabContext = createContext({});

const WeatherTabProvider = ({ children }: { children: React.ReactNode }) => {
  const [isChildVisible, setIsChildVisible] = useState(false);
  const [selectedTabIndex, setSelectedTabIndex] = useState(0);
  const scrollViewRef = useRef(null);
  const hasDaysTabAnimated = useRef(false);
  const hasHourlyTabChild1Animated = useRef(false);
  const hasProgressBarAnimated = useRef(0);
  const [childRefs, setChildRefs] = useState([
    { ref: useRef<View>(null), isVisible: false },
    { ref: useRef<View>(null), isVisible: false },
  ]);

  // Refs para funções de refresh de cada tab
  const refreshCallbacks = useRef<{
    [key: number]: (() => Promise<void>) | null
  }>({
    0: null, // Tab home (index.tsx)
    1: null, // Tab faturas (days.tsx)
    2: null, // Tab consumo (monthly.tsx)
  });

  // Função para registrar callback de refresh de uma tab
  const registerRefreshCallback = (tabIndex: number, callback: () => Promise<void>) => {
    refreshCallbacks.current[tabIndex] = callback;
  };

  // Função para executar refresh da tab atual
  const refreshCurrentTab = async () => {
    const callback = refreshCallbacks.current[selectedTabIndex];
    if (callback) {
      await callback();
    }
  };

  return (
    <WeatherTabContext.Provider
      value={{
        isChildVisible,
        setIsChildVisible,
        selectedTabIndex,
        setSelectedTabIndex,
        scrollViewRef,
        hasDaysTabAnimated,
        hasHourlyTabChild1Animated,
        hasProgressBarAnimated,
        childRefs,
        setChildRefs,
        registerRefreshCallback,
        refreshCurrentTab,
      }}
    >
      {children}
    </WeatherTabContext.Provider>
  );
};

export { WeatherTabContext, WeatherTabProvider };
