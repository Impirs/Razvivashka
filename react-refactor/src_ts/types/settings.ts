import { Language } from "./language";

export interface AppSettings {
    volume: {
        notifications: number;
        effects: number;
    },
    language: Language;
    currentUser: string;
    games: {
        digit: {
            view_modification: boolean;
        },
        shulte: {
            view_modification: boolean;
        },
        queens: {
            view_modification: boolean;
        }
    },
}
