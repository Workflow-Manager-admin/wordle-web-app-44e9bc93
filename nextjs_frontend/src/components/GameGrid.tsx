"use client";

import React from "react";

type GameGridProps = {
  guesses: string[];
  currentGuess: string;
  solution: string;
  maxGuesses: number;
  feedbackRowIdx: number | null;
};

/**
 * Returns color state for each letter:
 *  - primary: correct (green)
 *  - secondary: present elsewhere in word (yellow)
 *  - accent: not present (gray)
 */
function getRowFeedback(guess: string, solution: string) {
  // Use arrays for state feedback: 'correct' | 'present' | 'absent' 
  const feedback: ("correct"|"present"|"absent")[] = Array(guess.length).fill("absent");
  const solutionArr = solution.split("");
  const taken = Array(solution.length).fill(false);

  // Mark exact matches first.
  for (let i = 0; i < guess.length; i++) {
    if (guess[i] === solution[i]) {
      feedback[i] = "correct";
      taken[i] = true;
    }
  }
  // Mark present (in wrong position)
  for (let i = 0; i < guess.length; i++) {
    if (feedback[i] === "correct") continue;
    const idx = solutionArr.findIndex((l, si) => l === guess[i] && !taken[si]);
    if (idx !== -1) {
      feedback[i] = "present";
      taken[idx] = true;
    }
  }
  return feedback;
}

const colorByState = {
  correct: "#538d4e",
  present: "#b59f3b",
  absent: "#3a3a3c",
};

export default function GameGrid({
  guesses,
  currentGuess,
  solution,
  maxGuesses,
  feedbackRowIdx
}: GameGridProps) {
  // Build all rows (filled, current typing, blanks)
  const rows = [];
  for (let i = 0; i < maxGuesses; i++) {
    if (i < guesses.length) {
      // Feedback
      const feedback = getRowFeedback(guesses[i], solution);
      rows.push(
        <Row
          key={i}
          word={guesses[i]}
          state={feedback}
          animate={feedbackRowIdx === i}
        />
      );
    } else if (i === guesses.length && currentGuess) {
      rows.push(
        <Row
          key={i}
          word={currentGuess}
          state={Array(currentGuess.length).fill("typing")}
          animate={false}
        />
      );
    } else {
      rows.push(
        <Row key={i} word={""} state={[]} animate={false} />
      );
    }
  }
  return (
    <section
      className="grid grid-rows-6 gap-1 mx-auto w-[min(96vw,350px)] max-w-full"
      aria-label="Game grid"
    >
      {rows}
    </section>
  );
}

type RowProps = {
  word: string;
  state: ("correct"|"present"|"absent"|"typing")[];
  animate: boolean;
};

function Row({ word, state, animate }: RowProps) {
  const letters = word.padEnd(5).split("");
  // Show animation when animate is true
  return (
    <div className="grid grid-cols-5 gap-1 w-full">
      {letters.map((l, i) => (
        <Cell
          key={i}
          letter={l}
          state={state[i]}
          animate={animate}
          animIdx={i}
        />
      ))}
    </div>
  );
}

type CellProps = {
  letter: string;
  state: "correct" | "present" | "absent" | "typing" | undefined;
  animate: boolean;
  animIdx: number;
};
function Cell({ letter, state, animate, animIdx }: CellProps) {
  let bg = "#fafaff"; // blank
  if (state === "correct") bg = colorByState.correct;
  else if (state === "present") bg = colorByState.present;
  else if (state === "absent") bg = colorByState.absent;
  
  const animStyle = animate
    ? {
        animation: `flipIn 0.28s ${(animIdx * 0.18).toFixed(2)}s cubic-bezier(.23,1.2,.57,1) both`,
      }
    : {};

  return (
    <div
      className="aspect-square text-2xl rounded-md flex items-center justify-center font-semibold border border-[#e0e0e0] uppercase transition-colors"
      style={{
        background: state && state !== "typing" ? bg : undefined,
        color: state && state !== "typing" ? "#fff" : "#2b2b2b",
        border: !letter
          ? "1.5px solid #e0e0e0"
          : state && state !== "typing"
            ? "2px solid " + bg
            : "2px solid #bdbdbd",
        ...animStyle,
      }}
    >
      {letter}
      <style jsx global>{`
        @keyframes flipIn {
          0% {transform: rotateX(0deg);}
          60% {transform: rotateX(90deg);}
          100% {transform: rotateX(0deg);}
        }
      `}</style>
    </div>
  );
}
