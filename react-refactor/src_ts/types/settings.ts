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
            show_available: boolean;
        },
        shulte: {
            check_all_letters_tested: boolean;
        }
    },
}
