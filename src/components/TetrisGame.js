import React, { useRef, useEffect, useState } from "react";

const DEFAULT_MODE = { COLS: 10, ROWS: 20, DROP_INTERVAL: 500 };
const EASY_MODE = { COLS: 14, ROWS: 20, DROP_INTERVAL: 800 };
const HARD_MODE = DEFAULT_MODE;
const BLOCK_SIZE = 30;
// canvasWidth and canvasHeight will be defined inside the component

const TETROMINOES = {
  I: { shape: [[0,0,0,0],[1,1,1,1],[0,0,0,0],[0,0,0,0]], color: "#06b6d4" },
  J: { shape: [[1,0,0],[1,1,1],[0,0,0]], color: "#3b82f6" },
  L: { shape: [[0,0,1],[1,1,1],[0,0,0]], color: "#f97316" },
  O: { shape: [[1,1],[1,1]], color: "#facc15" },
  S: { shape: [[0,1,1],[1,1,0],[0,0,0]], color: "#22c55e" },
  T: { shape: [[0,1,0],[1,1,1],[0,0,0]], color: "#a855f7" },
  Z: { shape: [[1,1,0],[0,1,1],[0,0,0]], color: "#ef4444" },
};

const randomTetromino = () => {
  const keys = Object.keys(TETROMINOES);
  const rand = keys[Math.floor(Math.random() * keys.length)];
  return { ...TETROMINOES[rand], x: 3, y: 0 };
};

const rotateMatrix = (matrix) => matrix[0].map((_, i) => matrix.map(row => row[i]).reverse());

const isValidMove = (shape, grid, offsetX, offsetY, ROWS, COLS) => {
  for (let y = 0; y < shape.length; y++) {
    for (let x = 0; x < shape[y].length; x++) {
      if (shape[y][x]) {
        const newY = y + offsetY;
        const newX = x + offsetX;
        if (
          newY >= ROWS ||
          newX < 0 ||
          newX >= COLS ||
          (grid[newY] && grid[newY][newX])
        ) {
          return false;
        }
      }
    }
  }
  return true;
};

const mergeTetromino = (grid, tetromino, ROWS) => {
  const newGrid = grid.map(row => [...row]);
  const { shape, x, y } = tetromino;
  shape.forEach((row, dy) => {
    row.forEach((val, dx) => {
      if (val && y + dy < ROWS && x + dx >= 0) {
        newGrid[y + dy][x + dx] = tetromino.color;
      }
    });
  });
  return newGrid;
};

const clearLines = (grid, ROWS, COLS) => {
  const newGrid = grid.filter(row => row.some(cell => cell === 0));
  const linesCleared = ROWS - newGrid.length;
  while (newGrid.length < ROWS) newGrid.unshift(Array(COLS).fill(0));
  return { grid: newGrid, linesCleared };
};

const TetrisGame = ({ isDark }) => {
  const [mode, setMode] = useState(HARD_MODE);
  const COLS = mode.COLS;
  const ROWS = mode.ROWS;
  const canvasWidth = COLS * BLOCK_SIZE;
  const canvasHeight = ROWS * BLOCK_SIZE;
  const canvasRef = useRef(null);
  const [grid, setGrid] = useState(Array.from({ length: ROWS }, () => Array(COLS).fill(0)));
  const gridRef = useRef(grid);
  const [activeBlock, setActiveBlock] = useState(randomTetromino());
  const activeBlockRef = useRef(activeBlock);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);

  const dropCounterRef = useRef(0);
  const lastTimeRef = useRef(0);
  const requestRef = useRef();

  useEffect(() => {
    activeBlockRef.current = activeBlock;
  }, [activeBlock]);

  useEffect(() => {
    gridRef.current = grid;
  }, [grid]);

  const draw = (ctx) => {
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    for (let y = 0; y < ROWS; y++) {
      for (let x = 0; x < COLS; x++) {
        if (gridRef.current[y][x]) {
        ctx.fillStyle = gridRef.current[y][x];
        ctx.fillRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
          ctx.strokeStyle = "#1e3a8a";
          ctx.strokeRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
        }
      }
    }
    const { shape, x, y, color } = activeBlockRef.current;
    shape.forEach((row, dy) => {
      row.forEach((val, dx) => {
        if (val) {
          ctx.fillStyle = color;
          ctx.fillRect((x + dx) * BLOCK_SIZE, (y + dy) * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
          ctx.strokeStyle = "#1e3a8a";
          ctx.strokeRect((x + dx) * BLOCK_SIZE, (y + dy) * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
        }
      });
    });
  };

  const gameLoop = (time) => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    const deltaTime = time - lastTimeRef.current;
    lastTimeRef.current = time;
    dropCounterRef.current += deltaTime;

    const dropInterval = mode.DROP_INTERVAL;

    if (isRunning && !isPaused && dropCounterRef.current > dropInterval) {
      dropCounterRef.current = 0;
      const moved = { ...activeBlockRef.current, y: activeBlockRef.current.y + 1 };
      if (isValidMove(moved.shape, gridRef.current, moved.x, moved.y, ROWS, COLS)) {
        setActiveBlock(moved);
      } else {
        const merged = mergeTetromino(gridRef.current, activeBlockRef.current, ROWS);
        const { grid: cleared, linesCleared } = clearLines(merged, ROWS, COLS);
        if (linesCleared > 0) {
          const points = [0, 100, 300, 500, 800][linesCleared] || 0;
          setScore(prev => prev + points);
        }
        setGrid(cleared);
        const nextBlock = randomTetromino();
        // Check for game over: if the next block collides immediately
        if (!isValidMove(nextBlock.shape, gridRef.current, nextBlock.x, nextBlock.y, ROWS, COLS)) {
          setIsRunning(false);
          setIsGameOver(true);
          return;
        }
        setActiveBlock(nextBlock);
        activeBlockRef.current = nextBlock;
      }
    }

    draw(ctx);
    requestRef.current = requestAnimationFrame(gameLoop);
  };

  

  useEffect(() => {
    if (isRunning) {
      handleStart();
    }
  }, [mode]);

  useEffect(() => {
    if (isRunning && !isPaused) {
      lastTimeRef.current = performance.now();
      requestRef.current = requestAnimationFrame(gameLoop);
    }
    return () => cancelAnimationFrame(requestRef.current);
  }, [isRunning, isPaused]);

  useEffect(() => {
    if (isRunning && !isPaused) {
      const ctx = canvasRef.current.getContext("2d");
      draw(ctx);
    }
  }, [grid, activeBlock]);

  useEffect(() => {
    const handleKey = (e) => {
      if (!isRunning || isPaused) return;
      let moved = { ...activeBlockRef.current };
      if (e.key === "ArrowLeft" || e.key.toLowerCase() === "a") moved.x--;
      else if (e.key === "ArrowRight" || e.key.toLowerCase() === "d") moved.x++;
      else if (e.key === "ArrowDown" || e.key.toLowerCase() === "s") moved.y++;
      else if (e.key === "ArrowUp" || e.key.toLowerCase() === "w") {
        const rotated = rotateMatrix(activeBlockRef.current.shape);
        if (isValidMove(rotated, gridRef.current, activeBlockRef.current.x, activeBlockRef.current.y, ROWS, COLS)) {
          setActiveBlock({ ...activeBlockRef.current, shape: rotated });
          return;
        }
      }
      if (isValidMove(moved.shape, gridRef.current, moved.x, moved.y, ROWS, COLS)) setActiveBlock(moved);
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isRunning, isPaused, grid]);

  const handleStart = () => {
    setGrid(Array.from({ length: ROWS }, () => Array(COLS).fill(0)));
    setScore(0);
    setHighScore(prev => Math.max(prev, score));
    setIsGameOver(false);
    const newBlock = randomTetromino();
    setActiveBlock(newBlock);
    activeBlockRef.current = newBlock;
    setIsRunning(true);
    setIsPaused(false);

    // Delay drawing slightly until canvas is mounted
    setTimeout(() => {
      if (canvasRef.current) {
        const ctx = canvasRef.current.getContext("2d");
        draw(ctx);
      }
    }, 0);
  };

  const handlePause = () => {
    if (isRunning) setIsPaused((prev) => !prev);
  };

  return (
    <div className="flex flex-col items-center w-full px-4 pb-10 gap-y-4">
      <div className="flex gap-4 flex-wrap justify-center">
        <button
          onClick={() => {
            setIsRunning(false);
            setIsPaused(false);
            setIsGameOver(false);
            setGrid(Array.from({ length: ROWS }, () => Array(COLS).fill(0)));
            setScore(0);
            cancelAnimationFrame(requestRef.current);
          }}
          disabled={!isRunning}
          className="px-2 py-1 rounded-md border text-white bg-gray-700"
        >
          Exit
        </button>
        <button
          onClick={() => setMode(EASY_MODE)}
          disabled={isRunning}
          className="px-2 py-1 rounded-md border text-white bg-green-500"
        >
          Easy
        </button>
        <button
          onClick={() => setMode(HARD_MODE)}
          disabled={isRunning}
          className="px-2 py-1 rounded-md border text-white bg-red-500"
        >
          Hard
        </button>
        <button
          onClick={handleStart}
          className={`px-2 py-1 rounded-md border text-white ${isRunning ? "bg-slate-600" : "bg-green-600"}`}
        >
          Start
        </button>
        <button
          onClick={handlePause}
          disabled={!isRunning}
          className={`px-2 py-1 rounded-md border text-white ${isPaused ? "bg-yellow-600" : isDark ? "bg-blue-600" : "bg-slate-600"}`}
        >
          {isPaused ? "Resume" : "Pause"}
        </button>
      </div>

      <canvas
        ref={canvasRef}
        width={canvasWidth}
        height={canvasHeight}
        className="border border-slate-700 bg-black"
        style={{ imageRendering: "pixelated" }}
      />

      <div className={`${isDark ? "text-white" : "text-black"} font-semibold text-lg`}>
        Score: {score}
      </div>
      <div className={`${isDark ? "text-white" : "text-black"} font-medium`}>
        High Score: {highScore}
      </div>


      {isGameOver && (
        <div className="mt-4 p-4 text-center text-red-500 font-bold bg-white bg-opacity-10 rounded">
          Game Over
        </div>
      )}

      {/* Info Box */}
<div
  className={`${isDark ? "bg-slate-800 text-slate-200" : "bg-slate-100 text-slate-800"} max-w-md mt-4 p-4 rounded-md text-sm shadow transition-colors`}
>
  <p className={`${isDark ? "text-emerald-400" : "text-emerald-600"} font-semibold`}>
    About Tetris
  </p>
  <p>
    Tetris is a puzzle game where blocks (tetrominoes) fall from the top. Your goal is to move and rotate them to create full rows, which clear and score points!
  </p>
  <p>
    <span className={`${isDark ? "text-white" : "text-black"} font-semibold`}>Controls:</span>{" "}
    Use <span className="font-mono">W</span>/<span className="font-mono">A</span>/<span className="font-mono">S</span>/<span className="font-mono">D</span> or arrow keys to move. Down or S to drop faster. W or up to rotate. A and D or left/right arrows to move left/right.
    </p>
  <p>
    <span className={`${isDark ? "text-white" : "text-black"} font-semibold`}>Goal:</span>{" "}
    Clear as many lines as possible!
  </p>
  <p>
    <span className={`${isDark ? "text-white" : "text-black"} font-semibold`}>Modes:</span>{" "}
    Easy gives you more time and space. Hard is faster and narrower. Choose your challenge!
  </p>
</div>

    </div>

    
  );

  
};

export default TetrisGame;
