import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MessageAnalysis } from '@workspace/api-client-react';

interface AppContextType {
  currentCharacter: string;
  setCurrentCharacter: (character: string) => void;
  lastAnalysis: MessageAnalysis | null;
  setLastAnalysis: (analysis: MessageAnalysis | null) => void;
  userName: string;
  setUserName: (name: string) => void;
  supportStyle: string;
  setSupportStyle: (style: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [currentCharacter, setCurrentCharacterState] = useState('Sera');
  const [lastAnalysis, setLastAnalysisState] = useState<MessageAnalysis | null>(null);
  const [userName, setUserNameState] = useState('Ritesh');
  const [supportStyle, setSupportStyleState] = useState('Reflect');
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    async function loadState() {
      try {
        const storedCharacter = await AsyncStorage.getItem('currentCharacter');
        const storedAnalysis = await AsyncStorage.getItem('lastAnalysis');
        const storedName = await AsyncStorage.getItem('userName');
        const storedStyle = await AsyncStorage.getItem('supportStyle');

        if (storedCharacter) setCurrentCharacterState(storedCharacter);
        if (storedAnalysis) setLastAnalysisState(JSON.parse(storedAnalysis));
        if (storedName) setUserNameState(storedName);
        if (storedStyle) setSupportStyleState(storedStyle);
      } catch (e) {
        console.error('Failed to load state', e);
      } finally {
        setIsLoaded(true);
      }
    }
    loadState();
  }, []);

  const setCurrentCharacter = async (val: string) => {
    setCurrentCharacterState(val);
    await AsyncStorage.setItem('currentCharacter', val);
  };

  const setLastAnalysis = async (val: MessageAnalysis | null) => {
    setLastAnalysisState(val);
    if (val) {
      await AsyncStorage.setItem('lastAnalysis', JSON.stringify(val));
    } else {
      await AsyncStorage.removeItem('lastAnalysis');
    }
  };

  const setUserName = async (val: string) => {
    setUserNameState(val);
    await AsyncStorage.setItem('userName', val);
  };

  const setSupportStyle = async (val: string) => {
    setSupportStyleState(val);
    await AsyncStorage.setItem('supportStyle', val);
  };

  if (!isLoaded) return null;

  return (
    <AppContext.Provider
      value={{
        currentCharacter,
        setCurrentCharacter,
        lastAnalysis,
        setLastAnalysis,
        userName,
        setUserName,
        supportStyle,
        setSupportStyle,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}

export default AppProvider;
