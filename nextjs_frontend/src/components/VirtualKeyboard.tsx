"use client";

type VirtualKeyboardProps = {
  guesses: string[];
  solution: string;
  onLetter: (letter: string) => void;
  onDelete: () => void;
  onEnter: () => void;
  inputDisabled: boolean;
  currentGuess: string;
};

/** Determine key color ("correct", "present", "absent", undefined) */
function getKeyStatuses(guesses: string[], solution: string) {
  const status: Record<string, "correct" | "present" | "absent"> = {};
  guesses.forEach((guess) => {
    guess.split("").forEach((l, idx) => {
      if (solution[idx] === l) status[l] = "correct";
      else if (solution.includes(l) && status[l] !== "correct") status[l] = "present";
      else if (!solution.includes(l) && !status[l]) status[l] = "absent";
    });
  });
  return status;
}

const KEY_ROWS = [
  ["Q","W","E","R","T","Y","U","I","O","P"],
  ["A","S","D","F","G","H","J","K","L"],
  ["Z","X","C","V","B","N","M","Enter","Del"]
];

const colorForKey: Record<string, string> = {
  correct: "#538d4e",
  present: "#b59f3b",
  absent: "#3a3a3c"
};

export default function VirtualKeyboard({
  guesses,
  solution,
  onLetter,
  onDelete,
  onEnter,
  inputDisabled,
  currentGuess
}: VirtualKeyboardProps) {
  const statuses = getKeyStatuses(guesses, solution);

  return (
    <div className="w-full flex flex-col items-center gap-1 select-none">
      {KEY_ROWS.map((row, i) => (
        <div
          className="flex w-full justify-center gap-1"
          key={i}
        >
          {row.map((key) => {
            let keyType: "default"|"action" = "default";
            if (key === "Enter" || key === "Del") keyType = "action";

            const keyColor = statuses[key] ? colorForKey[statuses[key]] : "#d3d6da";
            let action = () => {};
            if (key === "Enter") action = onEnter;
            else if (key === "Del") action = onDelete;
            else action = () => onLetter(key);

            return (
              <button
                key={key}
                onClick={action}
                disabled={inputDisabled || (key.length === 1 && currentGuess.length >= 5 && keyType !== "action")}
                className={`flex-1 m-0.5 h-10 sm:h-12 rounded-md font-semibold text-lg transition-colors
                  ${keyType==="action"
                    ? "px-1 min-w-[48px] sm:min-w-[60px] text-[#fff]"
                    : ""}`}
                style={{
                  background: statuses[key] ? keyColor : "#d3d6da",
                  color: statuses[key] ? "#fff" : "#222"
                }}
                aria-label={key}
              >
                {key === "Del" ? (
                  <svg aria-hidden="true" height={22} width={26} viewBox="0 0 24 18">
                    <path fill="currentColor" d="M5.5 2a2 2 0 0 0-1.67.89l-3.2 4.8a2 2 0 0 0 0 2.44l3.2 4.8A2 2 0 0 0 5.5 16H19a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H5.5Zm4.65 4.53a.75.75 0 0 1 1.06 0L13 8.32l1.79-1.79a.75.75 0 1 1 1.06 1.06L14.06 9.38l1.79 1.79a.75.75 0 0 1-1.06 1.06L13 10.44l-1.79 1.79a.75.75 0 0 1-1.06-1.06l1.79-1.79-1.79-1.79a.75.75 0 0 1 0-1.06Z"/>
                  </svg>
                ) : key}
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
}
