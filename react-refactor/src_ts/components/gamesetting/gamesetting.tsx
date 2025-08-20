import React, { useCallback } from 'react';

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

// Separate component for individual options prevents re-rendering entire list
// when only one option's state changes (e.g., active/inactive)
const GameSettingOption = React.memo<{
    option: GameSettingOption;
    isActive: boolean;
    onClick: (key: Key) => void;
}>(({ option, isActive, onClick }) => {
    // useCallback ensures stable reference for onClick handler
    const handleClick = useCallback(() => {
        onClick(option.key);
    }, [onClick, option.key]);

    return (
        <button
            key={String(option.key)}
            type="button"
            className={`game-setting__option${isActive ? ' is-active' : ''}`}
            aria-pressed={isActive}
            onClick={handleClick}
        >
            {option.label}
        </button>
    );
});

GameSettingOption.displayName = 'GameSettingOption';

const GameSetting = React.memo<GameSettingProps>(({ title, options, selected, onChange, className }) => {
    return (
        <div className={`game-setting ${className ?? ''}`.trim()} >
            <div className="game-setting__title">
                <span>{title}</span>
            </div>
            <div className="game-setting__options">
                {options.map(opt => (
                    <GameSettingOption
                        key={String(opt.key)}
                        option={opt}
                        isActive={opt.key === selected}
                        onClick={onChange}
                    />
                ))}
            </div>
        </div>
    );
});

GameSetting.displayName = 'GameSetting';

export default GameSetting;
