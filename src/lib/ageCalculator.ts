import { AgeInfo } from '../types';
import { STAGES, YEAR_THEMES } from '../data/atmospheres';

export function calculateAge(dayZero: string): AgeInfo {
  const birthDate = new Date(dayZero);
  const now = new Date();

  let years = now.getFullYear() - birthDate.getFullYear();
  let months = now.getMonth() - birthDate.getMonth();
  let days = now.getDate() - birthDate.getDate();

  if (days < 0) {
    months--;
    const prevMonth = new Date(now.getFullYear(), now.getMonth(), 0);
    days += prevMonth.getDate();
  }

  if (months < 0) {
    years--;
    months += 12;
  }

  const totalDays = Math.floor((now.getTime() - birthDate.getTime()) / (1000 * 60 * 60 * 24));

  const stage = STAGES.find(
    (s) => years >= s.ageRange[0] && years <= s.ageRange[1]
  ) || STAGES[STAGES.length - 1];

  const currentThemes = YEAR_THEMES.filter((theme) => theme.year === years);

  return {
    years,
    months,
    days,
    totalDays,
    stage,
    currentThemes,
    exactYear: years,
  };
}

export function formatLifeClock(ageInfo: AgeInfo): string {
  return `${ageInfo.years}Y ${ageInfo.months}M ${ageInfo.days}D`;
}

export function isMessageUnlocked(unlocksAt: string): boolean {
  return new Date(unlocksAt) <= new Date();
}

export function getDayOfYear(): number {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = now.getTime() - start.getTime();
  const oneDay = 1000 * 60 * 60 * 24;
  return Math.floor(diff / oneDay);
}
