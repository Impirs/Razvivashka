import { useEffect, useMemo, useRef, useState } from 'react';
import type { QueensSettings, QueensBoard } from './types/game_queens';
import { createBoard, computeConflicts, isSolved, placeQueen, removeQueen, moveQueen, countQueens } from './queensGameLogic';
import { useGameController } from '@/contexts/gameController';
import { useLanguage } from '@/contexts/i18n';
import { useSettings } from '@/contexts/pref';
import { generateRecordProps } from '@/utils/pt';
import { formatTime } from '@/utils/ft';

import Icon from '@/components/icon/icon';
import fireworksGif from '@/assets/animations/fireworks.gif';
import unluckyGif from '@/assets/animations/unlucky.gif';

interface QueensGameProps { settings: QueensSettings; }

function QueensGame({ settings }: QueensGameProps) {
	const { status, endGame, setGameContext, setModifications, startedAt } = useGameController();
	const { t } = useLanguage();
	const { useSetting } = useSettings();
	const [gamesSettings] = useSetting('games');
	const assistHighlight = gamesSettings?.queens?.view_modification ?? true;

	const [board, setBoard] = useState<QueensBoard>([]);
	const [seconds, setSeconds] = useState(0);
	const timerRef = useRef<number | null>(null);
	const lastStartRef = useRef<number | null>(null);
	// guards to avoid checking solved state from previous run
	const [boardReady, setBoardReady] = useState(false);
	const [boardReadyRunId, setBoardReadyRunId] = useState<number | null>(null);

	const [dragFrom, setDragFrom] = useState<{row:number; col:number} | null>(null);

	// init per run
	useEffect(() => {
		if (status === 'playing' && startedAt) {
			if (lastStartRef.current !== startedAt) {
				lastStartRef.current = startedAt;
				setBoard([]); // clear immediately to avoid stale solved check
				setBoardReady(false);
				setBoardReadyRunId(null);
				setBoard(createBoard(settings.size));
				setSeconds(0);
				setGameContext('queens', generateRecordProps('queens', settings), true);
				const mods: string[] = [];
				if (!assistHighlight) mods.push('view_modification');
				setModifications(mods);
				if (timerRef.current) window.clearInterval(timerRef.current);
				timerRef.current = window.setInterval(() => setSeconds(s => s + 1), 1000);
			}
		} else {
			if (timerRef.current) { window.clearInterval(timerRef.current); timerRef.current = null; }
			if (status === 'idle') { lastStartRef.current = null; setSeconds(0); setBoard([]); setBoardReady(false); setBoardReadyRunId(null); }
		}
		return () => { if (timerRef.current) { window.clearInterval(timerRef.current); timerRef.current = null; } };
	}, [status, startedAt, settings.size]);

	// mark board as ready for the current run when generated
	useEffect(() => {
		if (status === 'playing' && startedAt && board.length > 0) {
			setBoardReady(true);
			setBoardReadyRunId(startedAt);
		}
	}, [board, status, startedAt]);

	const conflicts = useMemo(() => computeConflicts(board), [board]);
	const placed = useMemo(() => countQueens(board), [board]);
	const remaining = Math.max(0, settings.size - placed);

	// compute row/col blocked cells (hints) when view modification is enabled
	const blocked = useMemo(() => {
		if (!assistHighlight || board.length === 0) return new Set<string>();
		const size = board.length;
		const s = new Set<string>();
		for (let r = 0; r < size; r++) {
			for (let c = 0; c < size; c++) {
				if (!board[r][c].hasQueen) continue;
				for (let i = 0; i < size; i++) {
					if (i !== c) s.add(`${r},${i}`); // row
					if (i !== r) s.add(`${i},${c}`); // col
				}
			}
		}
		return s;
	}, [assistHighlight, board]);

	useEffect(() => {
		if (status === 'playing' && boardReady && startedAt && boardReadyRunId === startedAt && isSolved(board)) {
			if (timerRef.current) { window.clearInterval(timerRef.current); timerRef.current = null; }
			endGame('win', seconds);
		}
	}, [board, boardReady, boardReadyRunId, startedAt, status, seconds, endGame]);

	// interactions
	const onCellDoubleClick = (row: number, col: number) => {
		if (status !== 'playing') return;
		const has = board[row][col].hasQueen;
		if (!has) {
			// placing a new queen — forbid if limit reached
			if (placed >= settings.size) return;
			setBoard(prev => placeQueen(prev, row, col));
		} else {
			setBoard(prev => removeQueen(prev, row, col));
		}
	};

	// mouse drag for moving a queen
	const onMouseDown = (row: number, col: number) => {
		if (status !== 'playing') return;
		if (board[row][col].hasQueen) setDragFrom({ row, col });
	};
	const onMouseUp = (row: number, col: number) => {
		if (status !== 'playing') return;
		if (dragFrom) {
			const from = dragFrom; setDragFrom(null);
			if (from.row !== row || from.col !== col) {
				// don't move onto an occupied cell
				if (board[row][col].hasQueen) return;
				setBoard(prev => moveQueen(prev, from, { row, col }));
			}
		}
	};

	const size = settings.size;
	const cellPx = 480 / size;

	return (
		<section className="game-main-panel queens-panel">
			<header className="game-utils-panel">
				<div className="queens-remaining" aria-label="remaining">
					<Icon name="queen" size={32} color='#1c274c'/>
					<span style={{ marginLeft: 8, fontFamily:"PlayBall" }}>{remaining}</span>
				</div>
				<div/>
				<div className="game-timer">
					<div aria-label="timer">{formatTime(seconds)}</div>
				</div>
			</header>
			<div className="game-space">
		        {status === 'idle' && (
					<div style={{ textAlign: 'center', width: '60%' }}>
			            <h3>{t('game-info.time_rules')}</h3>
		                <h3>
							<span className="q-accent">{t('game-info.double_click')}</span>
							{t('game-info.queens.instruction_place')}
						</h3>
						<h3>
							<span className="q-accent">{t('game-info.drag')}</span>
							{t('game-info.queens.instruction_drag')}
						</h3>
                        <h3>
                            {t('game-info.queens.instruction')}
                        </h3>
							<hr className="q-sep" />
                        <p>{t('game-info.queens.tutorial')}</p>
					</div>
				)}
				{status === 'win' && (
					<div style={{ textAlign: 'center', width: '60%' }}>
						<img src={fireworksGif} alt="fireworks-animation" />
						<h3>{t('game-info.win')}</h3>
						<h3>{t('game-info.your_time')} {formatTime(seconds)}</h3>
					</div>
				)}
				{status === 'playing' && (
					<div
						key={`${settings.size}-${startedAt ?? 'na'}`}
						className={`queens-board size-${size}`}
						onMouseLeave={() => setDragFrom(null)}
					>
						{board.map((rowArr, r) =>
							rowArr.map((cell, c) => {
								const rowBad = conflicts.rows.has(r);
								const colBad = conflicts.cols.has(c);
								const regionBad = conflicts.regions.has(cell.region);
								const adjacentBad = cell.hasQueen && conflicts.adjacent.has(`${r},${c}`);
								const isBlocked = assistHighlight && !cell.hasQueen && blocked.has(`${r},${c}`);
								return (
									<div
										key={`${r}-${c}`}
										className={`q-cell 
                                                    region-${cell.region} 
                                                    ${cell.hasQueen ? 'has-queen' : ''} 
                                                    ${rowBad ? 'row-bad' : ''} 
                                                    ${colBad ? 'col-bad' : ''} 
														${regionBad ? 'region-bad' : ''}
														${adjacentBad ? 'adj-bad' : ''}`.trim()
                                                }
										onDoubleClick={() => onCellDoubleClick(r, c)}
										onMouseDown={() => onMouseDown(r, c)}
										onMouseUp={() => onMouseUp(r, c)}
										title={`r${r+1},c${c+1} · region ${cell.region+1}`}
									>
										{cell.hasQueen && <Icon name="queen" 
                                                                className="q-piece" 
                                                                size={cellPx / 2}
                                                                color='#1c274c'
                                                            />}
										{!cell.hasQueen && isBlocked && (
											<span className="q-blocked">×</span>
										)}
									</div>
								);
							})
						)}
					</div>
				)}
			</div>
		</section>
	);
}

export default QueensGame;

