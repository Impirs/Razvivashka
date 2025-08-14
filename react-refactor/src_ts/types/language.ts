export type Language = 'en' | 'ru' | 'sb_lat' | 'sb_cy';

// Generic translation type
export type Translation = Record<string, string | Record<string, unknown>>;

// Utility type to extract all possible keys
type PathsToStringProps<T> = T extends string
    ? []
    : {
        [K in Extract<keyof T, string>]: [K, ...PathsToStringProps<T[K]>]
    }[Extract<keyof T, string>];

type Join<T extends string[], D extends string = '.'> =
    T extends [] ? never :
    T extends [infer F] ? F :
    T extends [infer F, ...infer R] ?
    F extends string ?
    `${F}${D}${Join<Extract<R, string[]>, D>}` :
    never :
    string;

export type TranslationKey<T extends Translation> = Join<
    PathsToStringProps<T>
>;

export interface LanguageContextType<T extends Translation> {
    language: Language;
    setLanguage: (language: Language) => void;
    t: (key: TranslationKey<T>) => string;
    translations: Record<Language, T>;
}