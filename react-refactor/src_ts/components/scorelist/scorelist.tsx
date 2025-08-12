import { useGameStore } from "@/contexts/gameStore";
import type { UserGameRecord } from "@/types/gamestore";

import Icon from "../icon/icon";
import { toTime } from "@/utils/tt";

type Props = {
    gameId?: string;
    gameProps?: string;
};

/* 
TODO:
    I would like to add a feature that displays the player's rank based on their score,
    but I'm not sure if it's needed.
    Also, it might be useful to add hints for score span and Icons, so user can see that
    the score has gold color and a star icon cuz it's a perfect score and so on.
*/

const Record = ({ record, latestRecord }: { record: UserGameRecord, latestRecord?: UserGameRecord }) => (
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
            <div>
                {/* {record.modification.map((mod, index) => (
                    <Icon 
                        key={index}
                        name={`${mod}`}
                    />
                ))} */}
            </div>
            <time dateTime={record.played as any}>
                {new Date(record.played as any).toLocaleString()}
            </time>
        </section>
    </article>
);

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


