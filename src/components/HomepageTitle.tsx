import { WaveVisualizer } from './WaveVisualizer';

/** Bedtime story homepage title with audio visualizer */
interface HomepageTitleProps {
  audioAnalyser: AnalyserNode | null;
  isPlayingAudio: boolean;
}

const TITLE_LINE_1 = 'Truyện Kể';
const TITLE_LINE_2 = 'Trong Đêm';

const TITLE_GLOW = [
  '0 0 30px rgba(255,255,255,0.4)',
  '0 0 60px rgba(200,220,255,0.3)',
  '0 0 100px rgba(244,208,63,0.15)',
].join(', ');

const TITLE_FONT_STACK = "'Georgia', 'Palatino Linotype', 'Book Antiqua', serif";

export function HomepageTitle({ audioAnalyser, isPlayingAudio }: HomepageTitleProps) {
  return (
    <div className="fixed z-30 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center select-none">
      <div className="bg-black/10 rounded-3xl px-10 py-8 border border-white/5">
        <h1
          className="text-4xl sm:text-5xl lg:text-7xl font-bold text-white uppercase tracking-widest"
          style={{
            textShadow: TITLE_GLOW,
            fontFamily: TITLE_FONT_STACK,
            lineHeight: 1.3,
          }}
        >
          {TITLE_LINE_1}
          <br />
          {TITLE_LINE_2}
        </h1>

        <WaveVisualizer analyser={audioAnalyser} isActive={isPlayingAudio} />
      </div>
    </div>
  );
}
