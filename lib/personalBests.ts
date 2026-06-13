import type {
  GameModeId,
  RoundResult,
} from "@/features/game/types";

const PERSONAL_BESTS_STORAGE_KEY =
  "aim-trainer:personal-bests:v2";

const SETTINGS_STORAGE_KEY =
  "aim-trainer:settings:v1";

export type PersonalBest = {
  plays: number;
  bestScore: number;
  bestTimeMs: number;
  bestCombo: number;
  highestLevel: number;
};

export type PersonalBestMap = Record<
  GameModeId,
  PersonalBest
>;

export type AppSettings = {
  saveProgress: boolean;
};

export const DEFAULT_APP_SETTINGS: AppSettings = {
  saveProgress: true,
};

const EMPTY_BEST: PersonalBest = {
  plays: 0,
  bestScore: 0,
  bestTimeMs: 0,
  bestCombo: 0,
  highestLevel: 1,
};

export function createEmptyPersonalBests(): PersonalBestMap {
  return {
    quick: { ...EMPTY_BEST },
    survival: { ...EMPTY_BEST },
    chaos: { ...EMPTY_BEST },
  };
}

export function loadPersonalBests(): PersonalBestMap {
  if (typeof window === "undefined") {
    return createEmptyPersonalBests();
  }

  try {
    const stored = window.localStorage.getItem(
      PERSONAL_BESTS_STORAGE_KEY
    );

    if (!stored) {
      return createEmptyPersonalBests();
    }

    const parsed =
      JSON.parse(stored) as Partial<PersonalBestMap>;

    const empty = createEmptyPersonalBests();

    return {
      quick: {
        ...empty.quick,
        ...parsed.quick,
      },

      survival: {
        ...empty.survival,
        ...parsed.survival,
      },

      chaos: {
        ...empty.chaos,
        ...parsed.chaos,
      },
    };
  } catch {
    return createEmptyPersonalBests();
  }
}

export function loadAppSettings(): AppSettings {
  if (typeof window === "undefined") {
    return DEFAULT_APP_SETTINGS;
  }

  try {
    const stored = window.localStorage.getItem(
      SETTINGS_STORAGE_KEY
    );

    if (!stored) {
      return DEFAULT_APP_SETTINGS;
    }

    const parsed =
      JSON.parse(stored) as Partial<AppSettings>;

    return {
      ...DEFAULT_APP_SETTINGS,
      ...parsed,
    };
  } catch {
    return DEFAULT_APP_SETTINGS;
  }
}

export function saveAppSettings(
  settings: AppSettings
): void {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(
      SETTINGS_STORAGE_KEY,
      JSON.stringify(settings)
    );
  } catch {
    // The game still works when storage is unavailable or full.
  }
}

export function clearSavedProgress(): void {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.removeItem(
      PERSONAL_BESTS_STORAGE_KEY
    );
  } catch {
    // The game still works when storage is unavailable.
  }
}

export function recordPersonalBest(
  result: RoundResult,
  persist = true,
  currentPersonalBests: PersonalBestMap =
    loadPersonalBests()
): {
  personalBests: PersonalBestMap;
  isNewScoreBest: boolean;
} {
  const personalBests: PersonalBestMap = {
    quick: {
      ...currentPersonalBests.quick,
    },

    survival: {
      ...currentPersonalBests.survival,
    },

    chaos: {
      ...currentPersonalBests.chaos,
    },
  };

  const previous = personalBests[result.mode];

  const isNewScoreBest =
    result.score > previous.bestScore;

  personalBests[result.mode] = {
    plays: previous.plays + 1,
    bestScore: Math.max(
      previous.bestScore,
      result.score
    ),
    bestTimeMs: Math.max(
      previous.bestTimeMs,
      result.elapsedMs
    ),
    bestCombo: Math.max(
      previous.bestCombo,
      result.bestCombo
    ),
    highestLevel: Math.max(
      previous.highestLevel,
      result.highestLevel
    ),
  };

  if (persist && typeof window !== "undefined") {
    try {
      window.localStorage.setItem(
        PERSONAL_BESTS_STORAGE_KEY,
        JSON.stringify(personalBests)
      );
    } catch {
      // The game still works when storage is unavailable or full.
    }
  }

  return {
    personalBests,
    isNewScoreBest,
  };
}