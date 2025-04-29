import React, { createContext, useContext } from "react";
import useStorage from "./hooks/useStorage";

const StorageContext = createContext(null);

export function StorageProvider({ children }) {
    const storage = useStorage();
    // console.log(storage);
    return (
        <StorageContext.Provider value={storage}>
            {children}
        </StorageContext.Provider>
    );
}

export function useStorageContext() {
    return useContext(StorageContext);
}