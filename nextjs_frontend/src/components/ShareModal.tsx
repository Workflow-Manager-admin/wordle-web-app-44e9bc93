"use client";

import { useRef, useState } from "react";

// Emoji squares for results
function buildEmojiBoard(guesses: string[], solution: string) {
  // green, yellow, gray
  const rowFeedback = (guess: string) => {
    const result: string[] = [];
    const taken: boolean[] = Array(solution.length).fill(false);
    for (let i = 0; i < guess.length; i++) {
      if (guess[i] === solution[i]) {
        result[i] = "🟩"; taken[i] = true;
      }
    }
    for (let i = 0; i < guess.length; i++) {
      if (result[i]) continue;
      const idx = solution.indexOf(guess[i]);
      if (idx !== -1 && !taken[idx]) {
        result[i] = "🟨"; taken[idx] = true;
      } else {
        result[i] = "⬛";
      }
    }
    return result.join("");
  };
  return guesses.map(g => rowFeedback(g)).join("\n");
}

type ShareModalProps = {
  guesses: string[];
  solution: string;
  status: "won"|"lost"|"playing";
  onDone: () => void;
  onPlayAgain?: () => void; // Optional callback for "Play Again"
  isOpen: boolean;
};

/**
 * PUBLIC_INTERFACE
 * Modal for sharing results copy to clipboard.
 * Always appears centered, overlays the entire app, dims background.
 */
export default function ShareModal({
  guesses,
  solution,
  status,
  onDone,
  onPlayAgain,
  isOpen,
}: ShareModalProps
) {
  const [copied, setCopied] = useState(false);
  const textRef = useRef<HTMLTextAreaElement>(null);

  if (!isOpen) return null;

  const shareText = `Wordle Clone ${status === "won" ? guesses.length : "X"}/6\n` +
    buildEmojiBoard(guesses, solution);

  const handleCopy = () => {
    navigator.clipboard.writeText(shareText);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  // Modal overlay (always centered)
  return (
    <div
      className="modal-overlay"
      onClick={onDone}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: 'rgba(0,0,0,0.5)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div
        className="modal-content"
        onClick={e => e.stopPropagation()}
        style={{
          background: '#fff',
          borderRadius: '8px',
          padding: '24px',
          maxWidth: '90vw',
          boxShadow: '0 2px 12px rgba(0,0,0,0.2)',
          position: 'relative',
        }}
      >
        <div className="flex flex-col gap-3 items-center">
          <h2 className="font-bold text-lg text-[#3a3a3c]">Share your result!</h2>
          <textarea
            readOnly
            value={shareText}
            ref={textRef}
            className="w-full font-mono text-xs resize-none bg-[#f7f7f7] rounded p-2 border"
            rows={5}
          />
          <button
            className="w-full bg-[#538d4e] hover:bg-[#3a3a3c] text-white rounded py-2 font-semibold"
            onClick={handleCopy}
          >
            {copied ? "Copied!" : "Copy to clipboard"}
          </button>
          {(status === "won" || status === "lost") && typeof onPlayAgain === "function" && (
            <button
              onClick={onPlayAgain}
              className="w-full bg-[#538d4e] hover:bg-[#3a3a3c] text-white px-4 py-2 rounded font-semibold"
              data-testid="play-again-btn-share"
            >
              Play Again
            </button>
          )}
          <button
            className="mt-1 text-[#b59f3b] hover:underline"
            onClick={onDone}
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
