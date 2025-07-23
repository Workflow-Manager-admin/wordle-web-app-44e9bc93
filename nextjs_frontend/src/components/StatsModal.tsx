"use client";

type StatsModalProps = {
  stats: {
    gamesPlayed: number;
    gamesWon: number;
    streak: number;
    maxStreak: number;
    guessDist: number[];
    lastPlayed: string;
  } | null;
  lastGameStatus: "playing"|"won"|"lost";
  lastWord: string;
  guessCount: number;
  onShare: () => void;
  onPlayAgain?: () => void; // Optional callback for "Play Again"
};

/**
 * PUBLIC_INTERFACE
 * Stats modal with histogram and streak info
 */
export default function StatsModal({
  stats,
  lastGameStatus,
  lastWord,
  guessCount,
  onShare,
  onPlayAgain
}: StatsModalProps) {
  return (
    <div>
      <h2 className="text-xl font-bold text-[#3a3a3c] mb-2 text-center">Statistics</h2>
      {stats ? (
        <div className="flex flex-col gap-2">
          <div className="flex flex-row justify-around text-[#3a3a3c] mb-3">
            <StatBlock label="Played" value={stats.gamesPlayed} />
            <StatBlock label="Win %" value={stats.gamesPlayed ? Math.round((stats.gamesWon/stats.gamesPlayed)*100) : 0} />
            <StatBlock label="Streak" value={stats.streak} />
            <StatBlock label="Max" value={stats.maxStreak} />
          </div>
          <section>
            <h3 className="mt-2 font-semibold text-sm text-[#3a3a3c]/80">Guess Distribution</h3>
            <div>
              {stats.guessDist.slice(1).map((n, i) => (
                <div key={i} className="flex items-center mb-1">
                  <div className="w-5 text-xs text-[#3a3a3c]">{i+1}</div>
                  <div className="bg-[#bdbdbd] h-5 rounded-l pl-1 pr-2 text-[#fff] text-sm"
                       style={{width: Math.max(24, n*28)}}>
                    {n}
                  </div>
                </div>
              ))}
            </div>
          </section>
          <hr className="my-2" />
          <div className="text-center">
            {lastGameStatus === "won" ? (
              <div className="text-[#538d4e] font-semibold">
                You solved it in {guessCount} {guessCount===1?"guess":"guesses"}!
              </div>
            ) : lastGameStatus === "lost" ? (
              <div className="text-[#c62828]">
                The word was <span className="font-bold uppercase">{lastWord}</span>
              </div>
            ) : (
              <></>
            )}
            {(lastGameStatus === "won" || lastGameStatus === "lost") && typeof onPlayAgain === "function" && (
              <button
                onClick={onPlayAgain}
                className="w-full mt-3 bg-[#538d4e] hover:bg-[#3a3a3c] text-[#fff] px-4 py-2 rounded font-semibold"
                data-testid="play-again-btn"
              >
                Play Again
              </button>
            )}
          </div>
          <button
            onClick={onShare}
            className="w-full mt-2 bg-[#3a3a3c] hover:bg-[#538d4e] text-[#fff] px-4 py-2 rounded font-semibold"
          >
            Share
          </button>
        </div>
      ) : (
        <div className="text-center text-[#3a3a3c]/80">No stats yet. Play a game!</div>
      )}
    </div>
  );
}

function StatBlock({ label, value }: { label: string, value: number }) {
  return (
    <div className="flex flex-col items-center">
      <span className="text-2xl font-bold">{value}</span>
      <span className="text-xs">{label}</span>
    </div>
  );
}

