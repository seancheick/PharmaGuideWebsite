import { HERO_STORIES, type HeroStory } from "@/components/hero/stories";

export const DEMO_DURATION = 14000;
export const DEMO_PHASE_STARTS = [0, 2200, 5200] as const;
export const STACK_SCENARIOS = HERO_STORIES;

export type DemoPhase = 0 | 1 | 2;

export function demoPhaseAt(elapsed: number): DemoPhase {
  if (elapsed >= DEMO_PHASE_STARTS[2]) return 2;
  if (elapsed >= DEMO_PHASE_STARTS[1]) return 1;
  return 0;
}

export function scenarioItems(story: HeroStory) {
  return [...story.stack, story.added];
}
