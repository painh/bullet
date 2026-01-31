// 게임 영역 범위 (정규화된 좌표계: -1 ~ 1)
export const MAX_X = 1;
export const MAX_Y = 1;

// 플레이어 속도
export const MY_SHIP_HIGH_SPEED = 0.014;
export const MY_SHIP_LOW_SPEED = 0.007;

// 슬로우 모드 최대값
export const MAX_SLOW = 8;

// 스테이지 순서 (1 = 순방향)
export const STAGE_ORDER = 1;

// 게임 설정
export const TARGET_FPS = 60;
export const GAME_WIDTH = 640;
export const GAME_HEIGHT = 480;

// 게임 영역 비율 (화면 높이 기준)
export const GAME_AREA_RATIO = GAME_HEIGHT / MAX_Y;

// 색상 (PixiJS는 0xRRGGBB 형식 사용)
export const Colors = {
  WHITE: 0xffffff,
  LIGHT_GRAY: 0xc00cc0,  // 원본 LGray (오타로 보이지만 원본 유지)
  MID_GRAY: 0x808080,
  DARK_GRAY: 0x404040,
  BLACK: 0x000000,
} as const;
