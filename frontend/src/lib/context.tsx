"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { LanguageCode, UserProfile } from "@/types";
import { translations } from "@/locales";

interface AppContextType {
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
  t: typeof translations["en"];
  user: UserProfile | null;
  setUser: (user: UserProfile | null) => void;
  logout: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<LanguageCode>("en");
  const [user, setUser] = useState<UserProfile | null>(null);

  useEffect(() => {
    const savedLang = localStorage.getItem("riceguard_lang") as LanguageCode;
    if (savedLang && translations[savedLang]) {
      setLanguageState(savedLang);
    }
    const savedUser = localStorage.getItem("riceguard_user");
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        localStorage.removeItem("riceguard_user");
      }
    }
  }, []);

  const setLanguage = (lang: LanguageCode) => {
    setLanguageState(lang);
    localStorage.setItem("riceguard_lang", lang);
  };

  const logout = () => {
    localStorage.removeItem("riceguard_token");
    localStorage.removeItem("riceguard_user");
    setUser(null);
  };

  const t = translations[language] || translations["en"];

  return (
    <AppContext.Provider value={{ language, setLanguage, t, user, setUser, logout }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
}
