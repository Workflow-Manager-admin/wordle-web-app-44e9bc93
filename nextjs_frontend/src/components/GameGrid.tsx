import React from "react";

/**
 * PUBLIC_INTERFACE
 * GameGrid component for displaying guesses and allowing the input row to stay sticky at the top.
 * The currently editing (active) row remains visible at the top while others scroll beneath.
 * - On desktop and mobile, the grid is responsive.
 * - Handles cases with 0 guesses, early/late/mid-game, and at game end.
 *
 * Props:
 * - guesses: string[] - all completed guesses, in order
 * - currentGuess: string - characters in the current (input) row
 * - maxGuesses: number - total rows for this game (grid height)
 */
interface GameGridProps {
  guesses: string[];
  currentGuess: string;
  maxGuesses: number;
}

/**
 * Helper to render a single row (either 'completed', 'active', or 'empty').
 * Styling classes map to different row states. Each row always displays five cells.
 */
function renderRow(rowValue: string, rowStatus: "completed" | "active" | "empty", key: string) {
  return (
    <div
      className={`game-row ${rowStatus}`}
      key={key}
      aria-current={rowStatus === "active" ? "step" : undefined}
    >
      {Array.from({ length: 5 }).map((_, idx) =>
        rowValue[idx] ? (
          <span className="letter-cell" key={idx}>
            {rowValue[idx]}
          </span>
        ) : (
          <span
            className={`letter-cell${rowStatus === "empty" ? " empty" : ""}`}
            key={idx}
          >
            &nbsp;
          </span>
        )
      )}
    </div>
  );
}

/**
 * GameGrid renders the sticky input row at the top, and all completed/empty rows scroll beneath it.
 * The rest of the grid remains scrollable below the sticky top row.
 */
const GameGrid: React.FC<GameGridProps> = ({
  guesses,
  currentGuess,
  maxGuesses,
}) => {
  // All completed guesses (past)
  const completedRows = guesses.map((g, i) =>
    renderRow(g, "completed", `guess-${i}`)
  );

  const isGameOver = guesses.length >= maxGuesses;
  const showActiveRow = !isGameOver;

  // The currently editing row, displayed at the top if game isn't over
  const activeRow = showActiveRow
    ? renderRow(currentGuess, "active", "active")
    : null;

  // Fill up empty rows to always fill out the grid
  const emptyRows: React.ReactNode[] = [];
  const numRowsRendered =
    completedRows.length + (showActiveRow ? 1 : 0);
  for (let i = numRowsRendered; i < maxGuesses; i++) {
    emptyRows.push(renderRow("", "empty", `empty-${i}`));
  }

  return (
    <div className="game-grid-sticky-wrapper">
      {/* Sticky top row: active input row only if game is not over */}
      {showActiveRow && (
        <div className="sticky-input-row">{activeRow}</div>
      )}
      {/* Scrollable area for completed and empty rows */}
      <div className="scrollable-rows" tabIndex={0}>
        {completedRows}
        {emptyRows}
      </div>
    </div>
  );
};

export default GameGrid;
