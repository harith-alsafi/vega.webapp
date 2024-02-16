"use client"
import { DefaultPiConnection, PiConnection } from "@/services/rasberry-pi";
import {
  Dispatch,
  ReactNode,
  SetStateAction,
  createContext,
  useContext,
  useState,
} from "react";

export interface ConnectionContext {
  connectionState: PiConnection;
  setConnectionState: Dispatch<SetStateAction<PiConnection>>;
}

const ConnectionContext = createContext<ConnectionContext | null>(null);

// Create a provider component
interface ConnectionProviderProps {
  children: ReactNode;
}

export function ConnectionProvider({ children }: ConnectionProviderProps) {
  const [connectionState, setConnectionState] =
    useState<PiConnection>(DefaultPiConnection);

  return (
    <ConnectionContext.Provider
      value={{
        connectionState,
        setConnectionState,
      }}
    >
      {children}
    </ConnectionContext.Provider>
  );
}

export function useConnectionContext () {
  const context = useContext(ConnectionContext);
  if (!context) {
    throw new Error(
      "useConnectionContext must be used within a ConnectionProvider"
    );
  }
  return context;
};
