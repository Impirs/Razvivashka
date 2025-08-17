import { useEffect, useMemo, useRef, useState } from 'react';
import type { QueensSettings, QueensBoard } from './types/game_queens';
import { createBoard, computeConflicts, isSolved, placeQueen, removeQueen, moveQueen, countQueens } from './queensGameLogic';
import { useGameController } from '@/contexts/gameController';
import { useLanguage } from '@/contexts/i18n';
import { generateRecordProps } from '@/utils/pt';
import { formatTime } from '@/utils/ft';

import Icon from '@/components/icon/icon';
import fireworksGif from '@/assets/animations/fireworks.gif';
import unluckyGif from '@/assets/animations/unlucky.gif';

interface QueensGameProps { settings: QueensSettings; }

function QueensGame({ settings }: QueensGameProps) {
	const { status, endGame, setGameContext, startedAt } = useGameController();
	const { t } = useLanguage();

	const [board, setBoard] = useState<QueensBoard>([]);
	const [seconds, setSeconds] = useState(0);
	const timerRef = useRef<number | null>(null);
	const lastStartRef = useRef<number | null>(null);

	const [dragFrom, setDragFrom] = useState<{row:number; col:number} | null>(null);

	// init per run
	useEffect(() => {
		if (status === 'playing' && startedAt) {
			if (lastStartRef.current !== startedAt) {
				lastStartRef.current = startedAt;
				setBoard(createBoard(settings.size));
				setSeconds(0);
				setGameContext('queens', generateRecordProps('queens', settings), true);
				if (timerRef.current) window.clearInterval(timerRef.current);
				timerRef.current = window.setInterval(() => setSeconds(s => s + 1), 1000);
			}
		} else {
			if (timerRef.current) { window.clearInterval(timerRef.current); timerRef.current = null; }
			if (status === 'idle') { lastStartRef.current = null; setSeconds(0); setBoard([]); }
		}
		return () => { if (timerRef.current) { window.clearInterval(timerRef.current); timerRef.current = null; } };
	}, [status, startedAt, settings.size]);

	const conflicts = useMemo(() => computeConflicts(board), [board]);
	const placed = useMemo(() => countQueens(board), [board]);
	const remaining = Math.max(0, settings.size - placed);

	useEffect(() => {
		if (status === 'playing' && board.length > 0 && isSolved(board)) {
			if (timerRef.current) { window.clearInterval(timerRef.current); timerRef.current = null; }
			endGame('win', seconds);
		}
	}, [board, status, seconds, endGame]);

	// interactions
	const onCellDoubleClick = (row: number, col: number) => {
		if (status !== 'playing') return;
		setBoard(prev => (prev[row][col].hasQueen ? removeQueen(prev, row, col) : placeQueen(prev, row, col)));
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
			if (from.row !== row || from.col !== col) setBoard(prev => moveQueen(prev, from, { row, col }));
		}
	};

	const size = settings.size;
	const cellPx = 480 / size;

	return (
		<section className="game-main-panel queens-panel">
			<header className="game-utils-panel">
				<div className="queens-remaining" aria-label="remaining">
					<Icon name="queen" size={24} />
					<span style={{ marginLeft: 8 }}>{remaining}</span>
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
			<h3>{'Double click to place/remove a queen. Drag to move.'}</h3>
					</div>
				)}
				{status === 'win' && (
					<div style={{ textAlign: 'center', width: '60%' }}>
						<img src={fireworksGif} alt="fireworks-animation" />
						<h3>{t('game-info.win')}</h3>
						<h3>{t('game-info.your_time')} {formatTime(seconds)}</h3>
					</div>
				)}
				{status === 'lose' && (
					<div style={{ textAlign: 'center', width: '60%' }}>
						<img src={unluckyGif} alt="unlucky-animation" />
						<h3>{t('game-info.lose')}</h3>
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
								return (
									<div
										key={`${r}-${c}`}
										className={`q-cell region-${cell.region} ${cell.hasQueen ? 'has-queen' : ''} ${rowBad ? 'row-bad' : ''} ${colBad ? 'col-bad' : ''} ${regionBad ? 'region-bad' : ''}`.trim()}
										onDoubleClick={() => onCellDoubleClick(r, c)}
										onMouseDown={() => onMouseDown(r, c)}
										onMouseUp={() => onMouseUp(r, c)}
										title={`r${r+1},c${c+1} · region ${cell.region+1}`}
									>
										{cell.hasQueen && <Icon name="queen" className="q-piece" />}
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

