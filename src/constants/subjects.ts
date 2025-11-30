/**
 * Subject Constants
 * Centralized constants for subjects/materials feature
 */

/**
 * Material difficulty levels
 * Values correspond to backend API expectations
 */
export const MaterialLevel = {
  EASY: 1,
  MEDIUM: 2,
  DIFFICULT: 3,
} as const;

export type MaterialLevelType = (typeof MaterialLevel)[keyof typeof MaterialLevel];

export const MATERIAL_LEVELS = [
  { value: '1', labelKey: 'subjects.levelEasy' },
  { value: '2', labelKey: 'subjects.levelMedium' },
  { value: '3', labelKey: 'subjects.levelDifficult' },
] as const;

export const getLevelLabelKey = (level: number): string => {
  const levelOption = MATERIAL_LEVELS.find((l) => l.value === String(level));
  return levelOption?.labelKey ?? '';
};
