# Bullet Hell Game (PixiJS)

탄막 슈팅 게임 알고리즘을 PixiJS로 구현한 프로젝트입니다.

## 원작

이 프로젝트는 다음 책의 예제를 TypeScript + PixiJS로 포팅한 것입니다:

**[탄막, 슈팅게임 알고리즘 정리](https://jpub.tistory.com/491)** - Jpub 출판사

원작: DirectX C++ 기반

## 기술 스택

- TypeScript
- PixiJS 8.x
- Vite

## 설치 및 실행

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev

# 빌드
npm run build
```

## 조작법

| 키 | 동작 |
|---|---|
| Arrow / WASD | 이동 |
| Z / Shift | 저속 이동 |
| X | 색상 토글 |
| C / Space | 시작/정지 |
| V / Esc | 일시정지 |
| B | 히트박스 표시 |
| N | 색상 모드 |
| M | 슬로우 모드 |

### 스테이지 선택 (정지 상태)

- 좌/우: 스테이지 ±1
- 상/하: 스테이지 ±10

## 스테이지 구성

총 111개 스테이지:
- 0-29: Directional (방향성 탄막)
- 30-59: Polar (극좌표 탄막)
- 60-86: Ikebukuro (복합 패턴)
- 87-110: Tokyo (고급 패턴)

## 라이선스

이 프로젝트는 학습 목적으로 제작되었습니다.
원작의 저작권은 해당 저자에게 있습니다.
