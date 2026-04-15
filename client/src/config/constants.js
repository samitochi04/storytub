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

export const DEFAULT_VOICES = [
  {
    id: "af_heart",
    name: "Heart (EN Female)",
    language: "en",
    is_cloned: false,
  },
  { id: "am_adam", name: "Adam (EN Male)", language: "en", is_cloned: false },
  {
    id: "ff_siwis",
    name: "Siwis (FR Female)",
    language: "fr",
    is_cloned: false,
  },
  {
    id: "fm_marcus",
    name: "Marcus (FR Male)",
    language: "fr",
    is_cloned: false,
  },
];

export const CONTENT_STYLES = [
  "poetic",
  "scientific",
  "artistic",
  "mathematical",
  "political",
  "humorous",
  "dramatic",
  "educational",
];

export const SUPPORTED_LANGUAGES = [
  { value: "en", label: "English" },
  { value: "fr", label: "Français" },
];

export function calculateCredits(durationSeconds) {
  return CREDIT_BASE + durationSeconds * CREDIT_RATE_PER_SECOND;
}
