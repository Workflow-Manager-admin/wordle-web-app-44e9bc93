"use client";

import { useEffect, useState, useCallback } from "react";
import GameGrid from "@/components/GameGrid";
import VirtualKeyboard from "@/components/VirtualKeyboard";
import Modal from "@/components/Modal";
import StatsModal from "@/components/StatsModal";
import ShareModal from "@/components/ShareModal";
import { getTodaysWord, getLocalStats, updateLocalStats } from "@/lib/gameUtils";
import { GiSwordSlice } from "react-icons/gi";

/**
 * Colors defined in request details:
 *  - Accent: #3a3a3c (used for keyboard, absent)
 *  - Primary: #538d4e (correct letter)
 *  - Secondary: #b59f3b (present letter)
 *
 * Game config
 */
const MAX_GUESSES = 6;
const WORD_LENGTH = 5;

export default function Home() {
  // Game state
  const [todayWord, setTodayWord] = useState<string>("");
  const [guesses, setGuesses] = useState<string[]>([]);
  const [input, setInput] = useState<string>("");
  const [gameStatus, setGameStatus] = useState<"playing"|"won"|"lost">("playing");
  const [showStats, setShowStats] = useState<boolean>(false);
  const [showShare, setShowShare] = useState<boolean>(false);
  const [feedbackRowIdx, setFeedbackRowIdx] = useState<number | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [stats, setStats] = useState<{
    gamesPlayed: number;
    gamesWon: number;
    streak: number;
    maxStreak: number;
    guessDist: number[];
    lastPlayed: string;
  } | null>(null);

  // Initialize today's word and stats
  useEffect(() => {
    const word = getTodaysWord();
    setTodayWord(word);
    setStats(getLocalStats());
  }, []);

  // Handle submit guess
  const handleSubmit = useCallback(() => {
    if (input.length !== WORD_LENGTH) {
      setErrorMsg("Not enough letters");
      return;
    }
    if (!/^[A-Z]{5}$/.test(input)) {
      setErrorMsg("Invalid guess");
      return;
    }
    // Check for win
    if (input === todayWord) {
      const newGuesses = [...guesses, input];
      setGuesses(newGuesses);
      setGameStatus("won");
      updateLocalStats("won", newGuesses.length);
      setStats(getLocalStats());
      setFeedbackRowIdx(newGuesses.length - 1);
      setTimeout(() => {
        setShowShare(true);
      }, 1500);
      setInput("");
      return;
    }
    // Final guess (lose)
    if (guesses.length === MAX_GUESSES - 1) {
      const newGuesses = [...guesses, input];
      setGuesses(newGuesses);
      setGameStatus("lost");
      updateLocalStats("lost", 0);
      setStats(getLocalStats());
      setFeedbackRowIdx(newGuesses.length - 1);
      setTimeout(() => {
        setShowStats(true);
      }, 1500);
      setInput("");
      return;
    }
    // Valid guess, next
    setGuesses((g) => [...g, input]);
    setInput("");
    setFeedbackRowIdx(guesses.length);
  }, [input, guesses, todayWord]);

  // Handle keyboard input (onscreen and physical)
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (gameStatus !== "playing") return;
      const { key } = event;
      if (key === "Backspace") {
        setInput((inp) => inp.slice(0, -1));
      } else if (key === "Enter") {
        handleSubmit();
      } else if (/^[a-zA-Z]$/.test(key) && input.length < WORD_LENGTH) {
        setInput((inp) => (inp + key.toUpperCase()).slice(0, WORD_LENGTH));
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [input, gameStatus, todayWord, guesses, handleSubmit]);

  // Clear feedback highlight after anim
  useEffect(() => {
    if (feedbackRowIdx !== null) {
      const tm = setTimeout(() => {
        setFeedbackRowIdx(null);
      }, 1100);
      return () => clearTimeout(tm);
    }
  }, [feedbackRowIdx]);

  // Handle close modal
  const closeModal = () => {
    setShowStats(false);
    setShowShare(false);
  };

  // Handle letter (onscreen keyboard)
  const handleLetter = (letter: string) => {
    if (gameStatus !== "playing") return;
    if (input.length < WORD_LENGTH) {
      setInput((inp) => (inp + letter).slice(0, WORD_LENGTH));
    }
  };
  // Handle delete
  const handleDelete = () => {
    if (gameStatus !== "playing") return;
    setInput((inp) => inp.slice(0, -1));
  };

  // Submit
  const handleEnter = () => {
    if (gameStatus !== "playing") return;
    handleSubmit();
  };

  // Error message timing
  useEffect(() => {
    if (errorMsg) {
      const timer = setTimeout(() => setErrorMsg(null), 1400);
      return () => clearTimeout(timer);
    }
  }, [errorMsg]);

  // Handler to reset for a new game
  const handlePlayAgain = () => {
    // (1) Get a new word
    const newWord = getTodaysWord(true); // If getTodaysWord can be randomized, else implement a version in gameUtils
    setTodayWord(newWord);
    // (2) Reset all states
    setGuesses([]);
    setInput("");
    setGameStatus("playing");
    setFeedbackRowIdx(null);
    setErrorMsg(null);
    // Optionally do not reset stats
    // (3) Close all overlays
    setShowStats(false);
    setShowShare(false);
  };

  return (
    <div className="flex flex-col min-h-screen items-center py-2 bg-[#fafaff]">
      {/* Header */}
      <header className="w-full py-5 border-b border-gray-200 flex justify-center items-center relative">
        <span className="text-2xl font-bold tracking-widest text-[#3a3a3c] flex items-center gap-2 select-none">
          <GiSwordSlice className="inline-block text-[#3a3a3c] -mr-1" />
          WORDLE CLONE
        </span>
        <button
          aria-label="View stats"
          className="absolute right-8 text-[#b59f3b] hover:text-[#3a3a3c] text-xl font-bold"
          onClick={() => setShowStats(true)}
        >
          <svg height="28" width="28" fill="none" viewBox="0 0 24 24">
            <rect x="3" y="11" width="4" height="8" rx="1" fill="#b59f3b"/>
            <rect x="9" y="7" width="4" height="12" rx="1" fill="#3a3a3c"/>
            <rect x="15" y="4" width="4" height="15" rx="1" fill="#538d4e"/>
          </svg>
        </button>
      </header>

      {/* Game grid section */}
      <main className="flex flex-1 flex-col justify-start items-center w-full max-w-[390px] px-1 pt-2 pb-8 sm:pb-2">
        <GameGrid
          guesses={guesses}
          currentGuess={gameStatus === "playing" ? input : ""}
          maxGuesses={MAX_GUESSES}
        />
        <div className="min-h-7 mt-1 text-red-500 text-center">
          {errorMsg && <span className="animate-pulse">{errorMsg}</span>}
        </div>
      </main>

      {/* Keyboard */}
      <nav className="w-full flex flex-col items-center px-1">
        <VirtualKeyboard
          guesses={guesses}
          solution={todayWord}
          onLetter={handleLetter}
          onEnter={handleEnter}
          onDelete={handleDelete}
          inputDisabled={gameStatus !== "playing"}
          currentGuess={input}
        />
      </nav>

      {/* Modals */}
      <Modal open={showStats} onClose={closeModal}>
        <StatsModal
          stats={stats}
          lastGameStatus={gameStatus}
          lastWord={todayWord}
          guessCount={guesses.length}
          onShare={() => {
            setShowStats(false);
            setTimeout(() => setShowShare(true), 500);
          }}
          onPlayAgain={handlePlayAgain}
        />
      </Modal>
      <Modal open={showShare} onClose={closeModal}>
        <ShareModal
          guesses={guesses}
          solution={todayWord}
          status={gameStatus}
          onDone={closeModal}
          onPlayAgain={handlePlayAgain}
          isOpen={showShare}
        />
      </Modal>

      {/* Footer */}
      <footer className="w-full text-center text-xs text-[#3a3a3c]/80 pt-12 pb-1">
        Not affiliated with Wordle - For demo use only.
      </footer>
    </div>
  );
}
