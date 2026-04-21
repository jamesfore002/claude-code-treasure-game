import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Button } from './components/ui/button';
import { AuthModal } from './components/AuthModal';
import { useAuth } from './context/AuthContext';
import closedChest from './assets/treasure_closed.png';
import treasureChest from './assets/treasure_opened.png';
import skeletonChest from './assets/treasure_opened_skeleton.png';
import chestOpenSound from './audios/chest_open.mp3';
import evilLaughSound from './audios/chest_open_with_evil_laugh.mp3';
import keyIcon from './assets/key.png';

interface Box {
  id: number;
  isOpen: boolean;
  hasTreasure: boolean;
}

interface ScoreEntry {
  id: number;
  score: number;
  created_at: string;
}

export default function App() {
  const { user, loading, logout } = useAuth();
  const [boxes, setBoxes] = useState<Box[]>([]);
  const [score, setScore] = useState(0);
  const [gameEnded, setGameEnded] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [scoreHistory, setScoreHistory] = useState<ScoreEntry[]>([]);

  const initializeGame = () => {
    const treasureBoxIndex = Math.floor(Math.random() * 3);
    const newBoxes: Box[] = Array.from({ length: 3 }, (_, index) => ({
      id: index,
      isOpen: false,
      hasTreasure: index === treasureBoxIndex,
    }));
    setBoxes(newBoxes);
    setScore(0);
    setGameEnded(false);
  };

  useEffect(() => {
    initializeGame();
  }, []);

  const fetchScoreHistory = () => {
    fetch('/api/scores', { credentials: 'include' })
      .then((res) => (res.ok ? res.json() : []))
      .then(setScoreHistory)
      .catch(() => {});
  };

  // Fetch score history when user signs in
  useEffect(() => {
    if (user) {
      fetchScoreHistory();
    } else {
      setScoreHistory([]);
    }
  }, [user]);

  // Save score and refresh history when game ends (signed-in users only)
  useEffect(() => {
    if (gameEnded && user) {
      fetch('/api/scores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ score }),
      }).then(() => fetchScoreHistory());
    }
  }, [gameEnded]);

  const openBox = (boxId: number) => {
    if (gameEnded) return;

    setBoxes((prevBoxes) => {
      const updatedBoxes = prevBoxes.map((box) => {
        if (box.id === boxId && !box.isOpen) {
          const newScore = box.hasTreasure ? score + 200 : score - 50;
          setScore(newScore);
          new Audio(box.hasTreasure ? chestOpenSound : evilLaughSound).play();
          return { ...box, isOpen: true };
        }
        return box;
      });

      const treasureFound = updatedBoxes.some((box) => box.isOpen && box.hasTreasure);
      const allOpened = updatedBoxes.every((box) => box.isOpen);
      if (treasureFound || allOpened) {
        setGameEnded(true);
      }

      return updatedBoxes;
    });
  };

  const resetGame = () => {
    initializeGame();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-amber-50 to-amber-100 flex items-center justify-center">
        <p className="text-amber-800 text-lg">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-amber-100 flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-3 bg-amber-800/10 border-b border-amber-300">
        <span className="text-amber-900 font-semibold text-sm">Treasure Hunt</span>
        {user ? (
          <div className="flex items-center gap-3">
            <span className="text-amber-800 text-sm">
              Playing as <strong>{user.username}</strong>
            </span>
            <Button
              variant="outline"
              size="sm"
              className="border-amber-600 text-amber-700 hover:bg-amber-100"
              onClick={logout}
            >
              Sign Out
            </Button>
          </div>
        ) : (
          <Button
            size="sm"
            className="bg-amber-600 hover:bg-amber-700 text-white"
            onClick={() => setAuthModalOpen(true)}
          >
            Sign In / Sign Up
          </Button>
        )}
      </header>

      <AuthModal open={authModalOpen} onClose={() => setAuthModalOpen(false)} />

      {/* Game area */}
      <div className="flex-1 flex flex-col items-center justify-center p-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl mb-4 text-amber-900">🏴‍☠️ Treasure Hunt Game 🏴‍☠️</h1>
          <p className="text-amber-800 mb-4">
            Click on the treasure chests to discover what's inside!
          </p>
          <p className="text-amber-700 text-sm">
            💰 Treasure: +$200 | 💀 Skeleton: -$50
          </p>
          {!user && (
            <p className="text-amber-600 text-xs mt-2">
              Playing as guest — scores won't be saved.{' '}
              <button
                className="underline hover:text-amber-800"
                onClick={() => setAuthModalOpen(true)}
              >
                Sign in to save your scores!
              </button>
            </p>
          )}
        </div>

        <div className="mb-8 flex items-center gap-4">
          <div className="text-2xl text-center p-4 bg-amber-200/80 backdrop-blur-sm rounded-lg shadow-lg border-2 border-amber-400">
            <span className="text-amber-900">Current Score: </span>
            <span className={`${score >= 0 ? 'text-green-600' : 'text-red-600'}`}>${score}</span>
          </div>
          {gameEnded && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
              className={`text-2xl font-bold px-4 py-2 rounded-lg border-2 ${
                score > 0
                  ? 'bg-green-100 text-green-700 border-green-400'
                  : score < 0
                  ? 'bg-red-100 text-red-700 border-red-400'
                  : 'bg-yellow-100 text-yellow-700 border-yellow-400'
              }`}
            >
              {score > 0 ? 'Win' : score < 0 ? 'Loss' : 'Tie'}
            </motion.div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {boxes.map((box) => (
            <motion.div
              key={box.id}
              className="flex flex-col items-center"
              style={{ cursor: box.isOpen ? 'default' : `url(${keyIcon}) 16 16, pointer` }}
              whileHover={{ scale: box.isOpen ? 1 : 1.05 }}
              whileTap={{ scale: box.isOpen ? 1 : 0.95 }}
              onClick={() => openBox(box.id)}
            >
              <motion.div
                initial={{ rotateY: 0 }}
                animate={{
                  rotateY: box.isOpen ? 180 : 0,
                  scale: box.isOpen ? 1.1 : 1,
                }}
                transition={{ duration: 0.6, ease: 'easeInOut' }}
                className="relative"
              >
                <img
                  src={
                    box.isOpen
                      ? box.hasTreasure
                        ? treasureChest
                        : skeletonChest
                      : closedChest
                  }
                  alt={
                    box.isOpen
                      ? box.hasTreasure
                        ? 'Treasure!'
                        : 'Skeleton!'
                      : 'Treasure Chest'
                  }
                  className="w-48 h-48 object-contain drop-shadow-lg"
                />

                {box.isOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                    className="absolute -top-8 left-1/2 transform -translate-x-1/2"
                  >
                    {box.hasTreasure ? (
                      <div className="text-2xl animate-bounce">✨💰✨</div>
                    ) : (
                      <div className="text-2xl animate-pulse">💀👻💀</div>
                    )}
                  </motion.div>
                )}
              </motion.div>

              <div className="mt-4 text-center">
                {box.isOpen ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4, duration: 0.3 }}
                    className={`text-lg p-2 rounded-lg ${
                      box.hasTreasure
                        ? 'bg-green-100 text-green-800 border border-green-300'
                        : 'bg-red-100 text-red-800 border border-red-300'
                    }`}
                  >
                    {box.hasTreasure ? '+$200' : '-$50'}
                  </motion.div>
                ) : (
                  <div className="text-amber-700 p-2">Click to open!</div>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {gameEnded && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <div className="mb-4 p-6 bg-amber-200/80 backdrop-blur-sm rounded-xl shadow-lg border-2 border-amber-400">
              <h2 className="text-2xl mb-2 text-amber-900">Game Over!</h2>
              <p className="text-lg text-amber-800">
                Final Score:{' '}
                <span className={`${score >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  ${score}
                </span>
              </p>
              <p className="text-sm text-amber-600 mt-2">
                {boxes.some((box) => box.isOpen && box.hasTreasure)
                  ? 'Treasure found! Well done, treasure hunter! 🎉'
                  : 'No treasure found this time! Better luck next time! 💀'}
              </p>
              {user && (
                <p className="text-xs text-amber-500 mt-1">Score saved to your account!</p>
              )}
            </div>

            <Button
              onClick={resetGame}
              className="text-lg px-8 py-4 bg-amber-600 hover:bg-amber-700 text-white"
            >
              Play Again
            </Button>
          </motion.div>
        )}

        {/* Score history for signed-in users */}
        {user && scoreHistory.length > 0 && (
          <div className="mt-10 w-full max-w-sm">
            <h3 className="text-amber-900 font-semibold mb-3 text-center">Your Recent Scores</h3>
            <div className="bg-amber-200/60 rounded-xl border border-amber-300 overflow-hidden">
              {scoreHistory.map((entry, i) => (
                <div
                  key={entry.id}
                  className={`flex justify-between items-center px-4 py-2 text-sm ${
                    i % 2 === 0 ? 'bg-amber-100/50' : ''
                  }`}
                >
                  <span className="text-amber-700">
                    {new Date(entry.created_at).toLocaleDateString()}
                  </span>
                  <span
                    className={`font-semibold ${
                      entry.score >= 0 ? 'text-green-700' : 'text-red-700'
                    }`}
                  >
                    ${entry.score}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
