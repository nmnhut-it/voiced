export interface UserProfile {
  dayZero: string;
  childName: string;
  createdAt: string;
}

export interface Stage {
  id: number;
  name: string;
  ageRange: [number, number];
  label: string;
  description: string;
}

export interface YearTheme {
  year: number;
  theme: string;
  atmospheres: Atmosphere[];
}

export interface Atmosphere {
  id: string;
  name: string;
  description: string;
  cssBackground: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
  };
}

export interface AudioRecording {
  id: string;
  title: string;
  description?: string;
  recordedAt: string;
  unlocksAt?: string;
  audioBlob: Blob;
  duration: number;
  isLocked: boolean;
}

export interface AgeInfo {
  years: number;
  months: number;
  days: number;
  totalDays: number;
  stage: Stage;
  currentThemes: YearTheme[];
  exactYear: number;
}

export interface Story {
  id: string;
  year: number;
  title: string;
  content: string;
  paragraphs: string[];
}

export interface StoryRecording {
  id: string;
  storyId: string;
  paragraphIndex: number;
  audioBlob: Blob;
  duration: number;
  recordedAt: string;
}
