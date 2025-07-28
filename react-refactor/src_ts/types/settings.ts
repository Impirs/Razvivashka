import { Language } from "./language";

export interface AppSettings {
    volume: {
        notifications: number;
        effects: number;
    },
    language: Language;
    games: {
        digit: {
            show_available: boolean;
        },
        shulte: {
            check_all_letters_tested: boolean;
        }
    },
}
