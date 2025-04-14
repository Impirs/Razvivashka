module.exports = {
    user: {
        name: "default",
        highScores: {
            digit: {
                "7x6": [],
                "7x7": [],
                "7x8": [],
                "9x8": [],
                "9x9": [],
                "9x10": []
            },
            shulte: {
                "4x4": [],
                "5x5": []
            }
        },
        played: {
            syllable: [
                { id: "1x1", count: 0 },
                { id: "1x2", count: 0 },
                { id: "2x1", count: 0 },
                { id: "2x2", count: 0 }
            ]
        },
        achievements: {
            digit: [
                { id: "7x6", ranks: [150, 200], unlocked: [false, false], title: "Отличное начало!" },
                // и т.д.
            ],
            syllable: [],
            shulte: []
        },
        games: [
            { id: "digit", title: "Состав числа", type: "count" },
            { id: "shulte", title: "Таблица Шульте", type: "attention" },
            { id: "syllable", title: "Гласные - согласные", type: "reading" }
        ]
    },
    settings: {
        volume: {
            notification: 0.5,
            game_effects: 0.5,
        },
        games: {
            digit: {
                show_available: {
                    state: true,
                    description: "Подсвечивать доступные к нажатию клетки другим цветом"
                },
            },
            syllable: {
                check_all_letters_tested: {
                    state: true,
                    description: "Засчитывать упражнения только когда все буквы были прочитаны"
                },
            },
            shulte: {
                shide_scored: {
                    state: true,
                    description: "Скрывать цифры после нажатия"
                }
            }
        }
    }
};
