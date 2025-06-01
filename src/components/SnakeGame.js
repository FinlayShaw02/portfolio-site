import React, { useEffect, useRef, useState } from "react";

const canvasSize = { width: 400, height: 400 };
const scale = 20;
const rows = canvasSize.height / scale;
const columns = canvasSize.width / scale;

const SnakeGame = ({ isDark }) => {
  const canvasRef = useRef(null);
  const ctxRef = useRef(null);
  const snakeRef = useRef([
    { x: 10, y: 10 },
    { x: 9, y: 10 },
    { x: 8, y: 10 },
  ]);
  const dirRef = useRef({ x: 1, y: 0 });
  const foodRef = useRef(randomFood());
  const intervalRef = useRef(null);

  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  function randomFood() {
  const snake = snakeRef.current;
  let newFood;

  do {
    newFood = {
      x: Math.floor(Math.random() * columns),
      y: Math.floor(Math.random() * rows),
    };
  } while (snake.some(segment => segment.x === newFood.x && segment.y === newFood.y));

  return newFood;
}

  const resetGame = () => {
    snakeRef.current = [
      { x: 10, y: 10 },
      { x: 9, y: 10 },
      { x: 8, y: 10 },
    ];
    dirRef.current = { x: 1, y: 0 };
    foodRef.current = randomFood();
    setScore(0);
    setGameOver(false);
    setIsPaused(false);
  };

  const getSpeed = () => {
    const length = snakeRef.current.length;
    if (length < 8) return 200;
    if (length < 12) return 180;
    if (length < 16) return 160;
    if (length < 20) return 140;
    if (length < 25) return 120;
    return 100;
  };

  const moveSnake = () => {
    if (isPaused || gameOver) return;

    const snake = [...snakeRef.current];
    const head = { ...snake[0] };
    head.x += dirRef.current.x;
    head.y += dirRef.current.y;

    const hitWall = head.x < 0 || head.x >= columns || head.y < 0 || head.y >= rows;
    const hitSelf = snake.some(segment => segment.x === head.x && segment.y === head.y);

    if (hitWall || hitSelf) {
      setGameOver(true);
      clearInterval(intervalRef.current);
      return;
    }

    snake.unshift(head);

    if (head.x === foodRef.current.x && head.y === foodRef.current.y) {
      foodRef.current = randomFood();
      const newScore = snake.length - 3;
      setScore(newScore);
      if (newScore > highScore) {
        setHighScore(newScore);
        localStorage.setItem("snakeHighScore", newScore.toString());
      }
    } else {
      snake.pop();
    }

    snakeRef.current = snake;
    drawGame(ctxRef.current);

    clearInterval(intervalRef.current);
    intervalRef.current = setInterval(moveSnake, getSpeed());
  };

  const drawGame = (ctx) => {
    ctx.clearRect(0, 0, columns, rows);
    ctx.fillStyle = "#f43f5e"; // food
    ctx.fillRect(foodRef.current.x, foodRef.current.y, 1, 1);
    ctx.fillStyle = "#10b981"; // snake
    snakeRef.current.forEach(segment => {
      ctx.fillRect(segment.x, segment.y, 1, 1);
    });
  };

  useEffect(() => {
  const ctx = canvasRef.current.getContext("2d");
  ctx.setTransform(scale, 0, 0, scale, 0, 0);
  ctxRef.current = ctx;
  drawGame(ctx);

  // Load high score from localStorage
  const stored = localStorage.getItem("snakeHighScore");
  if (stored) {
    setHighScore(parseInt(stored));
  }

  // Manage game loop interval
  if (!gameOver && !isPaused) {
    intervalRef.current = setInterval(moveSnake, getSpeed());
  }

  // Clear interval on cleanup
  return () => clearInterval(intervalRef.current);
}, [gameOver, isPaused]);


  useEffect(() => {
    const handleKey = (e) => {
      const key = e.key.toLowerCase();
      const { x, y } = dirRef.current;

      if (key === "p") {
        setIsPaused(prev => !prev);
        return;
      }

      switch (key) {
        case "arrowup":
        case "w":
          if (y !== 1) dirRef.current = { x: 0, y: -1 };
          break;
        case "arrowdown":
        case "s":
          if (y !== -1) dirRef.current = { x: 0, y: 1 };
          break;
        case "arrowleft":
        case "a":
          if (x !== 1) dirRef.current = { x: -1, y: 0 };
          break;
        case "arrowright":
        case "d":
          if (x !== -1) dirRef.current = { x: 1, y: 0 };
          break;
        default:
          break;
      }
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  return (
    <div className="flex flex-col items-center w-full px-4 pb-10 gap-y-6">

      {/* GAME BOX */}
      <div className={`w-full max-w-md rounded-lg border p-4 shadow-lg transition-colors duration-300 ${
        isDark ? "bg-slate-800 text-white border-slate-700" : "bg-white text-black border-gray-300"
    }`}>


        {/* Score & High Score */}
        <div className="flex justify-between text-sm mb-2">
          <span>Score: {score}</span>
          <span>High Score: {highScore}</span>
        </div>

        {/* Pause / Game Over */}
        {isPaused && (
          <p className="text-yellow-500 text-center text-sm mb-2">⏸️ Paused — press 'P' or click resume</p>
        )}
        {gameOver && (
          <p className="text-red-500 text-center font-bold text-sm mb-2">💀 Game Over — Final Score: {score}</p>
        )}

        {/* Canvas */}
        <div className="flex justify-center">
          <canvas
            ref={canvasRef}
            width={canvasSize.width}
            height={canvasSize.height}
            style={{ width: canvasSize.width, height: canvasSize.height, imageRendering: "pixelated" }}
            className={isDark ? "border border-slate-700 bg-black" : "border border-gray-400 bg-black"}
          />
        </div>

        {/* Buttons */}
<div className="flex justify-center gap-3 mt-4">
  {gameOver ? (
    <button
      onClick={resetGame}
      className="bg-slate-700 text-white px-4 py-1 rounded hover:bg-slate-600"
    >
      Restart
    </button>
  ) : (
    <button
      onClick={() => setIsPaused(prev => !prev)}
      className="bg-slate-700 text-white px-4 py-1 rounded hover:bg-slate-600"
    >
      {isPaused ? "Resume" : "Pause"}
    </button>
  )}
</div>

      </div>

      {/* ABOUT BOX */}
      <div className={`w-full max-w-md rounded-lg border p-4 text-sm transition-colors duration-300 ${
         isDark ? "bg-slate-800 text-white border-slate-700" : "bg-white text-black border-gray-300"
      }`}>
        <p className="font-semibold text-base mb-1 text-green-600 dark:text-green-400">About Snake</p>
        <p>
          Navigate the snake to eat food and grow longer. Avoid running into the walls or yourself.
        </p>
        <p className="mt-2">
          <span className="font-semibold">Controls:</span> Arrow keys or WASD to move, <kbd>P</kbd> to pause/resume.
        </p>
        <p>
          <span className="font-semibold">Objective:</span> Grow the longest snake you can!
        </p>
      </div>
    </div>
  );
};

export default SnakeGame;
