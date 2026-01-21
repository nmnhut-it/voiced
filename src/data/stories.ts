import { Story } from '../types';

export const STORIES: Record<number, Story[]> = {
  0: [
    {
      id: 'year0_story1',
      year: 0,
      title: 'Welcome to the World',
      content: `# Welcome to the World

You arrived on a summer day, when the world was warm and bright. The sky was painted in soft blues, and gentle winds whispered through the trees.

In this moment, everything changed. A new story began—your story. And what a magnificent story it will be.

You are loved beyond measure. You are celebrated. You are the light that brightens every room you enter.

This is just the beginning of your incredible journey. Welcome, little one. Welcome to your beautiful life.`,
      paragraphs: [
        'You arrived on a summer day, when the world was warm and bright. The sky was painted in soft blues, and gentle winds whispered through the trees.',
        'In this moment, everything changed. A new story began—your story. And what a magnificent story it will be.',
        'You are loved beyond measure. You are celebrated. You are the light that brightens every room you enter.',
        'This is just the beginning of your incredible journey. Welcome, little one. Welcome to your beautiful life.',
      ],
    },
    {
      id: 'year0_story2',
      year: 0,
      title: 'The Stars Above',
      content: `# The Stars Above

Every night, millions of stars shine down from the sky. Each one has been burning for billions of years, waiting for this moment—waiting for you.

The moon watches over you as you sleep, casting gentle silver light through your window. It has seen countless generations, but none quite as special as yours.

You are part of something ancient and eternal. You are stardust, given life and breath and wonder.

Dream big dreams, little star. The universe is yours to explore.`,
      paragraphs: [
        'Every night, millions of stars shine down from the sky. Each one has been burning for billions of years, waiting for this moment—waiting for you.',
        'The moon watches over you as you sleep, casting gentle silver light through your window. It has seen countless generations, but none quite as special as yours.',
        'You are part of something ancient and eternal. You are stardust, given life and breath and wonder.',
        'Dream big dreams, little star. The universe is yours to explore.',
      ],
    },
    {
      id: 'year0_story3',
      year: 0,
      title: 'The Garden of Wonder',
      content: `# The Garden of Wonder

In a magical garden, flowers bloom in colors you have never seen. Butterflies dance on gentle breezes, and hummingbirds sing songs just for you.

This garden grows with you. Each day, something new appears—a bloom, a bird, a beam of sunlight breaking through the leaves.

You are the gardener of your own life. What you nurture will grow. What you love will flourish.

Tend your garden well, little one. It will give you beauty beyond imagination.`,
      paragraphs: [
        'In a magical garden, flowers bloom in colors you have never seen. Butterflies dance on gentle breezes, and hummingbirds sing songs just for you.',
        'This garden grows with you. Each day, something new appears—a bloom, a bird, a beam of sunlight breaking through the leaves.',
        'You are the gardener of your own life. What you nurture will grow. What you love will flourish.',
        'Tend your garden well, little one. It will give you beauty beyond imagination.',
      ],
    },
  ],
  1: [
    {
      id: 'year1_story1',
      year: 1,
      title: 'One Year of Magic',
      content: `# One Year of Magic

A whole year has passed, and look how much you have grown. You have discovered so much—sounds, colors, faces, laughter.

Every day with you has been an adventure. Every smile you share lights up the world a little more.

You are learning that you have a voice, that you can reach out and touch the world, that you belong here.

Keep growing, keep discovering. This is only the beginning of all you will become.`,
      paragraphs: [
        'A whole year has passed, and look how much you have grown. You have discovered so much—sounds, colors, faces, laughter.',
        'Every day with you has been an adventure. Every smile you share lights up the world a little more.',
        'You are learning that you have a voice, that you can reach out and touch the world, that you belong here.',
        'Keep growing, keep discovering. This is only the beginning of all you will become.',
      ],
    },
  ],
  2: [
    {
      id: 'year2_story1',
      year: 2,
      title: 'The World is Your Playground',
      content: `# The World is Your Playground

At two years old, you are unstoppable. Every corner holds a new adventure. Every day is filled with discovery.

You run, you jump, you laugh with your whole heart. The world bends to your curiosity.

You are brave. You are bold. You are becoming yourself, one joyful moment at a time.

Never lose this wonder. Never stop asking why. The world needs your curious spirit.`,
      paragraphs: [
        'At two years old, you are unstoppable. Every corner holds a new adventure. Every day is filled with discovery.',
        'You run, you jump, you laugh with your whole heart. The world bends to your curiosity.',
        'You are brave. You are bold. You are becoming yourself, one joyful moment at a time.',
        'Never lose this wonder. Never stop asking why. The world needs your curious spirit.',
      ],
    },
  ],
};

export function getStoriesForYear(year: number): Story[] {
  return STORIES[year] || [];
}

export function getAllStories(): Story[] {
  return Object.values(STORIES).flat();
}
