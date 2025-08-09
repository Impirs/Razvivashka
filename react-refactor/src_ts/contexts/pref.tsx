import {
    createContext,
    useContext,
    useEffect,
    useRef,
    useState,
    useCallback,
    ReactNode,
} from "react";

import type { AppSettings } from "../types/settings";

type Listener<K extends keyof AppSettings> = (value: AppSettings[K]) => void;

interface SettingsAPI {
    get<K extends keyof AppSettings>( key: K ): AppSettings[K];
    set<K extends keyof AppSettings>( key: K, value: AppSettings[K] ): void;
    getAll(): AppSettings;
    useSetting<K extends keyof AppSettings>( key: K )
        : [AppSettings[K], (value: AppSettings[K]) => void];
}

const SettingsContext = createContext<SettingsAPI | null>(null);

export const SettingsProvider = ({ children }: { children: ReactNode }) => {
    const settingsRef = useRef<AppSettings>(window.settingsAPI.getAll());
    const subscribers = useRef<Partial<Record<keyof AppSettings, Set<Listener<any>>>>>(
        Object.create(null)
    );

    // subscribe to preload
    useEffect(() => {
          const unsub = window.settingsAPI.subscribe((key, value) => {
                settingsRef.current[key] = value;
                const subs = subscribers.current[key];
                if (subs) subs.forEach((fn) => fn(value));
          });
      return unsub;
    }, []);

    const get = useCallback(<K extends keyof AppSettings>(key: K) => {
        return settingsRef.current[key];
    }, []);

    const getAll = useCallback(() => {
        return settingsRef.current;
    }, []);

    const set = useCallback(<K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
        window.settingsAPI.set(key, value); // triggers .subscribe in preload
    }, []);

    const useSetting = <K extends keyof AppSettings>(key: K): [AppSettings[K], (val: AppSettings[K]) => void] => {
        const [val, setVal] = useState(() => get(key));
        
        useEffect(() => {
            // subscribe to changes
            const listener = (newVal: AppSettings[K]) => setVal(newVal);
            if (!subscribers.current[key]) subscribers.current[key] = new Set();
            subscribers.current[key]!.add(listener);
            return () => {
                subscribers.current[key]!.delete(listener);
            };
        }, [key]);
      
        const update = useCallback((value: AppSettings[K]) => {
            set(key, value);
        }, [key, set]);
      
        return [val, update];
    };

    const value: SettingsAPI = { get, getAll, set, useSetting };

    return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
};

export const useSettings = () => {
    const ctx = useContext(SettingsContext);
    if (!ctx) throw new Error("SettingsContext is missing");
    return ctx;
};
