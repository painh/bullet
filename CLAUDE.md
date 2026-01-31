# Project

## Overview
탄막 슈팅 게임 - 책 "탄막, 슈팅게임 알고리즘 정리"의 샘플 프로그램을 PixiJS로 포팅한 프로젝트입니다.
110개 이상의 탄막 패턴 스테이지를 포함합니다.

## Tech Stack
- Vite
- TypeScript
- PixiJS 8.x

## Structure
```
src/
├── main.ts              # 엔트리 포인트
├── Game.ts              # 메인 게임 루프
├── constants.ts         # 게임 상수
├── Input.ts             # 키보드/게임패드 입력
├── TextureManager.ts    # 텍스처 로딩
├── Rand.ts              # 난수 생성기
├── data/
│   └── Shapes.ts        # 도형 정의 (19개)
├── entities/
│   ├── Mover.ts         # 베이스 클래스
│   ├── MyShip.ts        # 플레이어
│   ├── Bullet.ts        # 총알
│   └── Enemy.ts         # 적
└── stages/
    ├── Stage.ts         # 스테이지 인터페이스
    ├── DirectionalStages.ts  # 0-29 (스파이럴 등)
    ├── PolarStages.ts        # 30-59 (N-Way 등)
    ├── IkebukuroStages.ts    # 60-86 (조준 등)
    ├── TokyoStages.ts        # 87-119 (호밍 등)
    └── index.ts              # 스테이지 통합

public/
├── textures/            # 36개 PNG 텍스처
└── font/                # 비트맵 폰트
```

## Development

### Setup
```bash
npm install
```

### Run
```bash
npm run dev
```

### Build
```bash
npm run build
```

## Controls
- 방향키/WASD: 이동
- Z/Shift: 저속 이동
- X: 색상 전환 (이케부쿠로 스테이지)
- C/Space: 시작/정지
- V/Esc: 일시정지
- B: 히트박스 표시
- N: 컬러 모드 전환
- M: 슬로우 모드 (1x/2x/4x/8x)

## Notes
- 작업 후 커밋할 것
- 푸쉬는 시킬때만 할 것
- 커밋 메시지는 한글로 작성할 것
- 원본 DirectX 좌표계와 동일 (Y축 아래로 증가)
