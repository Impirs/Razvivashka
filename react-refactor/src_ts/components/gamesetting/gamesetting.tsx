import React from 'react';

type Key = string | number;

export interface GameSettingOption {
    key: Key;
    label: React.ReactNode;
}

interface GameSettingProps {
    title: string;
    options: GameSettingOption[];
    selected: Key | null | undefined;
    onChange: (key: Key) => void;
    className?: string;
}

const GameSetting = ({ title, options, selected, onChange, className } : GameSettingProps) => {
    return (
        <div className={`game-setting ${className ?? ''}`.trim()} >
            <div className="game-setting__title">
                <span>{title}</span>
            </div>
            <div className="game-setting__options">
                {options.map(opt => {
                    const isActive = opt.key === selected;
                    return (
                        <button
                            key={String(opt.key)}
                            type="button"
                            className={`game-setting__option${isActive ? ' is-active' : ''}`}
                            aria-pressed={isActive}
                            onClick={() => onChange(opt.key)}
                        >
                            {opt.label}
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default GameSetting;
