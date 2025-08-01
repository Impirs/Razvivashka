import React, { useState, useEffect } from 'react';
import type { DigitGameSettings } from './types/game_digital';

interface DigitMenuProps {
    onStart: (settings: DigitGameSettings) => void;
    initialSettings?: DigitGameSettings;
}

const DigitMenu: React.FC<DigitMenuProps> = ({ onStart, initialSettings }) => {
    const [target, setTarget] = useState<number>(initialSettings?.target || 6);
    const [size, setSize] = useState<number>(initialSettings?.size || 7);

    useEffect(() => {
        if (target === 6 || target === 7) setSize(7);
        else if (target === 9 || target === 10) setSize(9);
        else if (target === 8 && size !== 7 && size !== 9) setSize(7);
    }, [target]);

    let availableSizes: number[] = [];
    if (target === 6 || target === 7) availableSizes = [7];
    else if (target === 9 || target === 10) availableSizes = [9];
    else if (target === 8) availableSizes = [7, 9];

    return (
        <div className="digit-setup">
            <h3>Настройки игры</h3>
            <div className="digit-setup-setting">
                Найти состав числа:
                <div>
                    {[6, 7, 8, 9, 10].map((val) => (
                        <div
                            key={val}
                            className={`digit-setup-value${target === val ? ' active' : ''}`}
                            style={{
                                minWidth: '10%',
                                background: target === val ? '#e0e0ff' : '#fff',
                                cursor: 'pointer',
                                userSelect: 'none',
                            }}
                            onClick={() => setTarget(val)}
                        >
                            {val}
                        </div>
                    ))}
                </div>
            </div>
            <div className="digit-setup-setting">
                Размер поля:
                <div className={`digit-size-options digit-size-options--${availableSizes.length}`}>
                    {availableSizes.map((val) => (
                        <div
                            key={val}
                            className={`digit-setup-value${size === val ? ' active' : ''}`}
                            style={{
                                fontFamily: 'Snide hand',
                                width: availableSizes.length === 1 ? '100%' : '50%',
                                textAlign: 'center',
                                background: size === val ? '#e0e0ff' : '#fff',
                                cursor: 'pointer',
                                userSelect: 'none',
                            }}
                            onClick={() => setSize(val)}
                        >
                            {val === 7 ? 'Стандарт' : 'Большой'}
                        </div>
                    ))}
                </div>
            </div>
            <button onClick={() => onStart({ target, size })}>Старт</button>
        </div>
    );
};

export default DigitMenu;
