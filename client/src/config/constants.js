// Credit calculation formula: BASE + (duration × RATE_PER_SECOND)
export const CREDIT_BASE = 1000;
export const CREDIT_RATE_PER_SECOND = 35;

export const VIDEO_MIN_DURATION = 15;
export const VIDEO_MAX_DURATION = 100;
export const VIDEO_DEFAULT_DURATION = 60;

export const PLAN_LIMITS = {
  free: {
    credits: 5000,
    maxVoices: 4,
    hasWatermark: true,
    hasVoiceCloning: false,
    hasPriorityRendering: false,
  },
  starter: {
    credits: 50000,
    maxVoices: 4,
    hasWatermark: false,
    hasVoiceCloning: false,
    hasPriorityRendering: false,
  },
  premium: {
    credits: 150000,
    maxVoices: 10,
    hasWatermark: false,
    hasVoiceCloning: true,
    hasPriorityRendering: true,
  },
};

export const PROMPT_MAX_LENGTH = 1000;

export const SUPPORTED_LANGUAGES = [
  { value: "en", label: "English" },
  { value: "fr", label: "Français" },
];

export function calculateCredits(durationSeconds) {
  return CREDIT_BASE + durationSeconds * CREDIT_RATE_PER_SECOND;
}
