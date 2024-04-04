"use client"
import { GetPiConnection, UpdatePiConnection } from "@/services/database";
import { DefaultPiConnection, PiConnection } from "@/services/rasberry-pi";
import {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

export interface ConnectionContext {
  connectionState: PiConnection;
  setConnectionState: (newState: PiConnection) => void;
}

const ConnectionContext = createContext<ConnectionContext | null>(null);

// Create a provider component
interface ConnectionProviderProps {
  children: ReactNode;
}

export function ConnectionProvider({ children }: ConnectionProviderProps) {
  const [connectionState, setConnectionState] =
    useState<PiConnection>(DefaultPiConnection);

  useEffect(() => {
    // Simulate getting the state from Redis
    const getState = async () => {
      try {
        const connection = await GetPiConnection();
        if (connection) {
          setConnectionState(connection);
        }
        else{
          await UpdatePiConnection(DefaultPiConnection);
        }
      } catch (error) {
        console.error('Error fetching state:', error);
      }
    };

    getState();
  }, []); // Run once on component mount

  const updateState = async (newState: PiConnection) => {
    try {
      // Simulate updating the state in Redis
      await UpdatePiConnection(newState);
      setConnectionState(newState);
    } catch (error) {
      console.error('Error updating state:', error);
    }
  };

  return (
    <ConnectionContext.Provider
      value={{
        connectionState,
        setConnectionState: updateState,
      }}
    >
      {children}
    </ConnectionContext.Provider>
  );
}

export function useConnectionContext() {
  const context = useContext(ConnectionContext);
  if (!context) {
    throw new Error(
      "useConnectionContext must be used within a ConnectionProvider"
    );
  }
  return context;
};
