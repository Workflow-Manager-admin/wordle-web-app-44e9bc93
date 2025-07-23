"use client";

import { useState } from "react";
import Modal from "./Modal";

/**
 * Emoji squares for sharing results
 */
function buildEmojiBoard(guesses: string[], solution: string) {
  const rowFeedback = (guess: string) => {
    const result: string[] = [];
    const taken: boolean[] = Array(solution.length).fill(false);
    for (let i = 0; i < guess.length; i++) {
      if (guess[i] === solution[i]) {
        result[i] = "🟩";
        taken[i] = true;
      }
    }
    for (let i = 0; i < guess.length; i++) {
      if (result[i]) continue;
      const idx = solution.indexOf(guess[i]);
      if (idx !== -1 && !taken[idx]) {
        result[i] = "🟨";
        taken[idx] = true;
      } else {
        result[i] = "⬛";
      }
    }
    return result.join("");
  };
  return guesses.map((g) => rowFeedback(g)).join("\n");
}

type ShareModalProps = {
  guesses: string[];
  solution: string;
  status: "won" | "lost" | "playing";
  onDone: () => void;
  onPlayAgain?: () => void; // Optional callback for "Play Again"
  isOpen: boolean;
};

/**
 * PUBLIC_INTERFACE
 * Modal dialog for sharing results. Uses the standard Modal component, displays results, provides share/copy,
 * Play Again and Done buttons. Visually stacks in a column and responsive.
 */
export default function ShareModal({
  guesses,
  solution,
  status,
  onDone,
  onPlayAgain,
  isOpen,
}: ShareModalProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const shareText =
    `Wordle Clone ${status === "won" ? guesses.length : "X"}/6\n` +
    buildEmojiBoard(guesses, solution);

  const handleCopy = () => {
    navigator.clipboard.writeText(shareText);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  return (
    <Modal open={isOpen} onClose={onDone}>
      <div className="flex flex-col gap-4 items-center text-center py-2" style={{ minWidth: 0 }}>
        <h2 className="font-bold text-xl text-[#3a3a3c]">Share your result!</h2>

        <div className="w-full bg-[#f7f7f7] rounded p-2 border font-mono text-xs text-left mb-1" style={{ whiteSpace: "pre", minHeight: 80 }}>
          {shareText}
        </div>

        <div className="flex flex-col w-full gap-2">
          <button
            className="w-full bg-[#538d4e] hover:bg-[#3a3a3c] transition-colors duration-150 text-white rounded py-2 font-semibold text-base"
            onClick={handleCopy}
          >
            {copied ? "Copied!" : "Copy to clipboard"}
          </button>
          {(status === "won" || status === "lost") && typeof onPlayAgain === "function" && (
            <button
              onClick={onPlayAgain}
              className="w-full bg-[#b59f3b] hover:bg-[#3a3a3c] text-white px-4 py-2 rounded font-semibold text-base"
              data-testid="play-again-btn-share"
            >
              Play Again
            </button>
          )}
        </div>

        <button
          className="mt-2 text-[#b59f3b] hover:underline underline-offset-2 text-sm font-medium"
          style={{ marginTop: 8 }}
          onClick={onDone}
        >
          Done
        </button>
      </div>
    </Modal>
  );
}
