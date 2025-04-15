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
            syllable : [
                {id: "1x1" , count: 0},
                {id: "1x2" , count: 0}, 
                {id: "2x1" , count: 0},  
                {id: "2x2" , count: 0}
            ]
        },
        achievements: {
            "digit": [
                { id: "7x6", ranks: [150, 200], unlocked: [false, false], title: "Отличное начало!" },
                { id: "7x7", ranks: [150, 200], unlocked: [false, false], title: "Семь+Я" },
                { id: "7x8", ranks: [150, 200], unlocked: [false, false], title: "Знаток основ" },
                { id: "9x8", ranks: [180, 240, 360], unlocked: [false, false, false], title: "Высшая лига" },
                { id: "9x9", ranks: [180, 240, 360], unlocked: [false, false, false], title: "Юный математик" },
                { id: "9x10", ranks: [180, 240, 360], unlocked: [false, false, false], title: "Профессионал" },
                { id: "7x100", ranks: [10000], unlocked: [false], title: "Идеальный подход" },
                { id: "9x100", ranks: [20000], unlocked: [false], title: "Идеальный подход" },
            ],
            "syllable": [
                { id: "1x1", ranks: [10, 5, 1], unlocked: [false, false, false], title: "Секреты букваря" },
                { id: "1x2", ranks: [10, 5, 1], unlocked: [false, false, false], title: "Весёлый буквоед" },
                { id: "2x1", ranks: [10, 5, 1], unlocked: [false, false, false], title: "Загадочный шёпот" },
                { id: "2x2", ranks: [10, 5, 1], unlocked: [false, false, false], title: "Читающий герой" }
            ],
            "shulte": [
                { id: "4x4", ranks: [45, 60, 90], unlocked: [false, false, false], title: "Зоркий глаз"},
                { id: "5x5", ranks: [60, 90, 120], unlocked: [false, false, false], title: "Сама Внимательность"}
            ],
        },  
        games: [
            {id: "digit", title: "Состав числа", type: "count"},
            {id: "shulte", title: "Таблица Шульте", type: "attention"},
            {id: "syllable", title: "Гласные - согласные", type: "reading"},
            //{id: "sum", title: "Сумма чисел", type: "count"},
            //{id: "multi", title: "Произведение чисел", type: "count"},
        ]
    },
    settings: {
        volume: {
            notification: 0.5,
            game_effects: 0.5,
        },
        games: {
            "digit": {
                show_available: {
                    state: true,
                    description: "Подсвечивать доступные к нажатию клетки другим цветом"
                },
            },
            "syllable": {
                check_all_letters_tested: {
                    state: true,
                    description: "Засчитывать упражнения только когда все буквы были прочитаны"
                },
            },
            "shulte": {
                shide_scored: {
                    state: true,
                    description: "Скрывать цифры после нажатия"
                } 
            }
        }
    }
};
