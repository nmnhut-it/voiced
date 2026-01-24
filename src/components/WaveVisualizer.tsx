import { useEffect, useRef } from 'react';

interface WaveVisualizerProps {
  analyser: AnalyserNode | null;
  isActive: boolean;
}

const WAVE_COLOR = '#FFD700';
const WAVE_GLOW_COLOR = 'rgba(255, 215, 0, 0.6)';
const LINE_WIDTH = 2.5;
const BAR_COUNT = 32;
const AMPLIFICATION = 2.5;
const SMOOTHING = 0.85;

export function WaveVisualizer({ analyser, isActive }: WaveVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const prevDataRef = useRef<number[]>([]);

  useEffect(() => {
    if (!isActive || !analyser || !canvasRef.current) {
      return;
    }

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Configure analyser for better frequency response
    analyser.smoothingTimeConstant = SMOOTHING;

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    // Initialize previous data for smoothing
    if (prevDataRef.current.length === 0) {
      prevDataRef.current = new Array(BAR_COUNT).fill(0);
    }

    const draw = () => {
      animationRef.current = requestAnimationFrame(draw);

      // Use frequency data for more visual impact
      analyser.getByteFrequencyData(dataArray);

      const width = canvas.width;
      const height = canvas.height;

      ctx.clearRect(0, 0, width, height);

      const barWidth = width / BAR_COUNT;
      const step = Math.floor(bufferLength / BAR_COUNT);

      // Create gradient for bars
      const gradient = ctx.createLinearGradient(0, height, 0, 0);
      gradient.addColorStop(0, 'rgba(255, 165, 0, 0.8)');
      gradient.addColorStop(0.5, 'rgba(255, 215, 0, 0.9)');
      gradient.addColorStop(1, 'rgba(255, 255, 200, 1)');

      ctx.fillStyle = gradient;
      ctx.shadowBlur = 8;
      ctx.shadowColor = WAVE_GLOW_COLOR;

      for (let i = 0; i < BAR_COUNT; i++) {
        // Average several frequency bins for each bar
        let sum = 0;
        for (let j = 0; j < step; j++) {
          sum += dataArray[i * step + j];
        }
        const avg = sum / step;

        // Amplify and normalize
        let barHeight = (avg / 255) * height * AMPLIFICATION;
        barHeight = Math.min(barHeight, height);

        // Smooth with previous values
        barHeight = barHeight * 0.4 + prevDataRef.current[i] * 0.6;
        prevDataRef.current[i] = barHeight;

        // Ensure minimum bar height for visual feedback
        barHeight = Math.max(barHeight, 2);

        const x = i * barWidth + barWidth * 0.15;
        const y = (height - barHeight) / 2;
        const rectWidth = barWidth * 0.7;

        // Draw rounded bars
        ctx.beginPath();
        ctx.roundRect(x, y, rectWidth, barHeight, 2);
        ctx.fill();
      }

      // Draw center line wave overlay
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.lineWidth = LINE_WIDTH;
      ctx.shadowBlur = 4;
      ctx.shadowColor = 'rgba(255, 255, 255, 0.3)';
      ctx.beginPath();

      for (let i = 0; i < BAR_COUNT; i++) {
        const x = i * barWidth + barWidth / 2;
        const y = height / 2 + (prevDataRef.current[i] / height) * 8 * Math.sin(i * 0.5);

        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.stroke();
    };

    draw();

    return () => {
      cancelAnimationFrame(animationRef.current);
    };
  }, [analyser, isActive]);

  if (!isActive) return null;

  return (
    <div className="flex justify-center mt-4">
      <canvas
        ref={canvasRef}
        width={240}
        height={50}
        className="opacity-90"
        style={{
          filter: 'drop-shadow(0 0 12px rgba(255, 215, 0, 0.5))',
        }}
      />
    </div>
  );
}
