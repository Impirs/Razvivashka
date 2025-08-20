import { useGameStore } from "@/contexts/gamestore";
import type { UserGameRecord } from "@/types/gamestore";

import Icon from "../icon/icon";
import { toTime } from "@/utils/tt";
import { useLanguage } from "@/contexts/i18n";

type Props = {
    gameId?: string;
    gameProps?: string;
};

/* 
TODO:
    - [ ] I would like to add a feature that displays the player's rank based on their score,
          but I'm not sure if it's needed.
    - [x] Also, it might be useful to add hints for score span and Icons, so user can see that
          the score has gold color and a star icon cuz it's a perfect score and so on.
*/

const Record = ({ record, latestRecord }: { record: UserGameRecord, latestRecord?: UserGameRecord }) => {
    const { t } = useLanguage();
    return (
        <article 
            className={`record-container ${
                latestRecord &&
                record.gameId === latestRecord.gameId &&
                record.gameProps === latestRecord.gameProps &&
                toTime(record.played) === toTime(latestRecord.played)
                    ? 'new-score'
                    : ''
            }`
        }>
            <span className={`score ${record.isperfect ? 'perfect' : ''}`}>
                {record.score}
            </span>
            <section className="record-details">
                    {(() => {
                        const d = new Date(record.played as any);
                        const dateTimeISO = isNaN(d.getTime()) ? undefined : d.toISOString();
                        const hhmm = isNaN(d.getTime())
                            ? ''
                            : d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
                        const dd = String(d.getDate()).padStart(2, '0');
                        const mm = String(d.getMonth() + 1).padStart(2, '0');
                        const yy = String(d.getFullYear()).slice(-2);
                        const ddmmyy = isNaN(d.getTime()) ? '' : `${dd}/${mm}/${yy}`;
                        return (
                            <time className="record-datetime" dateTime={dateTimeISO}>
                                <span className="time-line">{hhmm}</span>
                                <span className="date-line">{ddmmyy}</span>
                            </time>
                        );
                    })()}
                <div className="record-icons">
                    {record.isperfect && (
                        <div>
                            <span 
                                className="perfect-icon"
                                aria-label={t('tooltips.perfect')}
                                data-tooltip={t('tooltips.perfect')}
                                title={t('tooltips.perfect')}
                            >
                                <Icon name="star" masked />
                            </span>
                        </div>
                    )}
                    {Array.isArray(record.modification) && record.modification.filter(Boolean).length > 0 && (
                        <div className="modification-icons">
                            {record.modification.filter(Boolean).map((mod, index) => {
                                const iconName = mod === 
                                    'view_modification' ? 
                                    'eye-closed' : mod;
                                const label = mod === 
                                    'view_modification' ? 
                                    (t('tooltips.view_modification' as any) 
                                        || 'View assistance disabled'
                                    ) : mod;
                                return (
                                    <span key={`${mod}-${index}`} 
                                        className="mod-icon" 
                                        aria-label={label} 
                                        data-tooltip={label} 
                                        title={label}
                                    >
                                        <Icon name={iconName} masked />
                                    </span>
                                );
                            })}
                        </div>
                    )}
                </div>
            </section>
        </article>
    );
};

const ScoreList = ({ gameId, gameProps }: Props) => {
    const { currentUser } = useGameStore();

    const allRecords: UserGameRecord[] = currentUser?.gameRecords ?? [];

	// Filter by gameId and gameProps for the current game
    const filtered = allRecords.filter(
        (r) =>
            (gameId ? r.gameId === gameId : true) &&
            (gameProps ? r.gameProps === gameProps : true)
    );

    // Determine the latest record by played timestamp within the filtered set
    const latestRecord = filtered.reduce<UserGameRecord | undefined>((latest, r) => {
        if (!latest) return r;
        return toTime(r.played) > toTime(latest.played) ? r : latest;
    }, undefined);

    // For time-based score, lower is better
    const records = [...filtered].sort((a, b) => a.score - b.score);

    return (
        <ul className="score-list">
            {records.map((r) => (
                <li key={`${r.gameId}-${r.gameProps}-${String(r.played)}`}>
                    <Record 
                            record={r} 
                            latestRecord={latestRecord} 
                    />
                </li>
            ))}
        </ul>
    );
};

export default ScoreList;


