import type { Stage } from './Stage';
import { directionalStages } from './DirectionalStages';
import { polarStages } from './PolarStages';
import { ikebukuroStages } from './IkebukuroStages';
import { tokyoStages } from './TokyoStages';

export const allStages: Stage[] = [
  ...directionalStages,   // 0-29
  ...polarStages,         // 30-59
  ...ikebukuroStages,     // 60-86
  ...tokyoStages,         // 87-119
];

export type { Stage, StageContext } from './Stage';
