import React, { useRef, useEffect, useState } from "react";

const canvasWidth = 600;
const canvasHeight = 400;
const paddleWidth = 10;
const paddleHeight = 60;
const ballSize = 10;
const playerSpeed = 7;
const baseSpeedX = 2;
const baseSpeedY = 1.5;

const PongGame = ({ isDark }) => {
  const canvasRef = useRef(null);
  const playerYRef = useRef(canvasHeight / 2 - paddleHeight / 2);
  const aiYRef = useRef(canvasHeight / 2 - paddleHeight / 2);
  const ballRef = useRef({ x: 0, y: 0, vx: 0, vy: 0 });
  const playerScoreRef = useRef(0);
  const aiScoreRef = useRef(0);
  const speedMultiplierRef = useRef(1);
  const lastTimeRef = useRef(0);
  const keysPressed = useRef({ up: false, down: false });

  const [difficulty, setDifficulty] = useState("easy");
  const difficultyRef = useRef("easy");

  const [paused, setPaused] = useState(false);
  const pausedRef = useRef(false);

  const [countdown, setCountdown] = useState(0);
  const countdownRef = useRef(0);

  const frameRate = 1000 / 60;

  const resetBall = () => {
    speedMultiplierRef.current = 1;
    const directionX = Math.random() > 0.5 ? 1 : -1;
    const directionY = Math.random() > 0.5 ? 1 : -1;
    ballRef.current = {
      x: canvasWidth / 2,
      y: canvasHeight / 2,
      vx: baseSpeedX * directionX,
      vy: baseSpeedY * directionY,
    };
  };

  const moveBall = () => {
    const ball = ballRef.current;
    ball.x += ball.vx;
    ball.y += ball.vy;

    if (ball.y <= 0 || ball.y + ballSize >= canvasHeight) {
      ball.vy *= -1;
    }

    if (ball.x + ballSize < 0) {
      aiScoreRef.current += 1;
      resetBall();
      return;
    }

    if (ball.x > canvasWidth) {
      playerScoreRef.current += 1;
      resetBall();
      return;
    }

    const playerY = playerYRef.current;
    const aiY = aiYRef.current;

    if (
      ball.x <= paddleWidth &&
      ball.y + ballSize >= playerY &&
      ball.y <= playerY + paddleHeight
    ) {
      speedMultiplierRef.current *= 1.1;
      ball.vx = baseSpeedX * speedMultiplierRef.current;
      ball.vy = Math.sign(ball.vy) * baseSpeedY * speedMultiplierRef.current;
      ball.x = paddleWidth;
    }

    if (
      ball.x + ballSize >= canvasWidth - paddleWidth &&
      ball.y + ballSize >= aiY &&
      ball.y <= aiY + paddleHeight
    ) {
      speedMultiplierRef.current *= 1.1;
      ball.vx = -baseSpeedX * speedMultiplierRef.current;
      ball.vy = Math.sign(ball.vy) * baseSpeedY * speedMultiplierRef.current;
      ball.x = canvasWidth - paddleWidth - ballSize;
    }
  };

  const moveAI = () => {
    const ball = ballRef.current;
    let targetY;

    if (difficultyRef.current === "easy") {
      const aiSpeed = 1.5;
      if (ball.vx > 0 && ball.x > canvasWidth * 0.66) {
        targetY = ball.y - paddleHeight / 2;
        aiYRef.current = aiYRef.current < targetY
          ? Math.min(aiYRef.current + aiSpeed, canvasHeight - paddleHeight)
          : Math.max(aiYRef.current - aiSpeed, 0);
      }
    }

    if (difficultyRef.current === "hard") {
      const aiSpeed = 3.8;
      const prediction = ball.y + ball.vy * 6;
      targetY = prediction - paddleHeight / 2;
      aiYRef.current = aiYRef.current < targetY
        ? Math.min(aiYRef.current + aiSpeed, canvasHeight - paddleHeight)
        : Math.max(aiYRef.current - aiSpeed, 0);
    }
  };

  const handleHeldKeys = () => {
    if (keysPressed.current.up) {
      playerYRef.current = Math.max(playerYRef.current - playerSpeed, 0);
    }
    if (keysPressed.current.down) {
      playerYRef.current = Math.min(playerYRef.current + playerSpeed, canvasHeight - paddleHeight);
    }
  };

  const draw = (ctx) => {
    const ball = ballRef.current;
    const speedMult = speedMultiplierRef.current;

    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    ctx.save();
    ctx.shadowBlur = speedMult > 2 ? Math.min((speedMult - 1) * 8, 30) : 0;
    ctx.shadowColor = speedMult > 2 ? "#38bdf8" : "transparent";
    ctx.fillStyle = speedMult > 2.5 ? "#38bdf8" : "white";
    ctx.fillRect(ball.x, ball.y, ballSize, ballSize);
    ctx.restore();

    ctx.fillStyle = "#10b981";
    ctx.fillRect(0, playerYRef.current, paddleWidth, paddleHeight);

    ctx.fillStyle = "#f43f5e";
    ctx.fillRect(canvasWidth - paddleWidth, aiYRef.current, paddleWidth, paddleHeight);

    ctx.fillStyle = "#fff";
    ctx.font = "12px monospace";
    ctx.fillText(`You: ${playerScoreRef.current}`, 20, 20);
    ctx.fillText(`AI: ${aiScoreRef.current}`, canvasWidth - 80, 20);
    ctx.fillText(`Speed x${speedMult.toFixed(2)}`, canvasWidth / 2 - 40, 40);
    ctx.fillText(`Mode: ${difficultyRef.current.toUpperCase()}`, canvasWidth / 2 - 40, 20);

    if (pausedRef.current && countdownRef.current === 0) {
      ctx.fillStyle = "#facc15";
      ctx.font = "bold 14px monospace";
      ctx.fillText("PAUSED", canvasWidth / 2 - 30, canvasHeight / 2);
    }

    if (countdownRef.current > 0) {
      ctx.fillStyle = "#facc15";
      ctx.font = "bold 28px monospace";
      ctx.fillText(`${countdownRef.current}`, canvasWidth / 2 - 10, canvasHeight / 2);
    }
  };

  useEffect(() => {
    resetBall();
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    const loop = (timestamp) => {
      if (countdownRef.current === 0 && !pausedRef.current && timestamp - lastTimeRef.current >= frameRate) {
        handleHeldKeys();
        moveBall();
        moveAI();
        draw(ctx);
        lastTimeRef.current = timestamp;
      } else {
        draw(ctx);
      }
      requestAnimationFrame(loop);
    };

    requestAnimationFrame(loop);

    const togglePauseWithCountdown = () => {
      const wasPaused = pausedRef.current;
      const newPaused = !wasPaused;
      pausedRef.current = newPaused;
      setPaused(newPaused);

      if (!newPaused) {
        let count = 3;
        setCountdown(count);
        countdownRef.current = count;

        const interval = setInterval(() => {
          count -= 1;
          setCountdown(count);
          countdownRef.current = count;
          if (count <= 0) clearInterval(interval);
        }, 500);
      }
    };

    const handleKeyDown = (e) => {
      const key = e.key.toLowerCase();
      if (key === "w" || key === "arrowup") keysPressed.current.up = true;
      if (key === "s" || key === "arrowdown") keysPressed.current.down = true;
      if (key === "p") togglePauseWithCountdown();
    };

    const handleKeyUp = (e) => {
      const key = e.key.toLowerCase();
      if (key === "w" || key === "arrowup") keysPressed.current.up = false;
      if (key === "s" || key === "arrowdown") keysPressed.current.down = false;
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  return (
    <div className="flex flex-col items-center w-full px-4 pb-10 gap-y-4">
      {/* Buttons */}
      <div className="flex gap-4 flex-wrap justify-center">
        <button
          onClick={() => {
            setDifficulty("easy");
            difficultyRef.current = "easy";
          }}
          className={`px-2 py-1 text-sm rounded-md border text-white ${difficulty === "easy" ? "bg-green-600" : "bg-slate-600"}`}
        >
          Easy Mode
        </button>
        <button
          onClick={() => {
            setDifficulty("hard");
            difficultyRef.current = "hard";
          }}
          className={`px-2 py-1 text-sm rounded-md border text-white ${difficulty === "hard" ? "bg-red-600" : "bg-slate-600"}`}
        >
          Hard Mode
        </button>
        <button
          onClick={() => {
            const newPaused = !pausedRef.current;
            pausedRef.current = newPaused;
            setPaused(newPaused);

            if (!newPaused) {
              let count = 3;
              setCountdown(count);
              countdownRef.current = count;

              const interval = setInterval(() => {
                count -= 1;
                setCountdown(count);
                countdownRef.current = count;
                if (count <= 0) clearInterval(interval);
              }, 500);
            }
          }}
          className={`px-2 py-1 text-sm rounded-md border text-white ${paused ? "bg-yellow-600" : "bg-blue-600"}`}
        >
          {paused ? "Resume" : "Pause"}
        </button>
      </div>

      {/* Game Canvas */}
      <canvas
        ref={canvasRef}
        width={canvasWidth}
        height={canvasHeight}
        className="border border-slate-700 bg-black"
        style={{ imageRendering: "pixelated" }}
      />

      {/* Info Box */}
      <div className={`max-w-md mt-4 p-4 rounded-md text-sm shadow transition-colors ${
        isDark ? "bg-slate-800 text-slate-200" : "bg-slate-100 text-slate-800"
      }`}>
        <p className={`${isDark ? "text-emerald-400" : "text-emerald-600"} font-semibold`}>About Pong</p>
        <p>
          Classic Pong-style game. Control the left paddle to hit the ball past the AI paddle on the right.
          Each rally makes the ball faster!
        </p>
        <p>
          <span className={`${isDark ? "text-white" : "text-black"} font-semibold`}>Controls:</span>{" "}
          Use <span className="font-mono">W</span>/<span className="font-mono">S</span> or{" "}
          <span className="font-mono">↑</span>/<span className="font-mono">↓</span> to move. Press{" "}
          <span className="font-mono">P</span> or use the button to pause/resume.
        </p>
        <p>
          <span className={`${isDark ? "text-white" : "text-black"} font-semibold`}>Modes:</span>{" "}
          Easy lets you win. Hard uses predictive AI. Switch anytime.
        </p>
        <p>
          <span className={`${isDark ? "text-white" : "text-black"} font-semibold`}>Goal:</span>{" "}
          Score as many points as you can!
        </p>
      </div>
    </div>
  );
};

export default PongGame;
