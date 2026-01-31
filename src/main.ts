import { Application } from 'pixi.js';
import { Game } from './Game';
import { GAME_WIDTH, GAME_HEIGHT, TARGET_FPS } from './constants';

async function main() {
  // PixiJS 애플리케이션 생성
  const app = new Application();

  await app.init({
    width: GAME_WIDTH,
    height: GAME_HEIGHT,
    backgroundColor: 0x111111,
    resolution: window.devicePixelRatio || 1,
    autoDensity: true,
  });

  // 캔버스를 DOM에 추가
  const container = document.getElementById('game-container');
  if (container) {
    container.appendChild(app.canvas);
  } else {
    document.body.appendChild(app.canvas);
  }

  // 게임 초기화
  const game = new Game(app);
  await game.init();

  // 화면 크기에 맞게 스케일 조정
  function resize() {
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;

    // 게임 비율 유지하면서 화면에 맞춤
    const scale = Math.min(screenWidth / GAME_WIDTH, screenHeight / GAME_HEIGHT);

    // 캔버스 크기 조정
    app.renderer.resize(GAME_WIDTH * scale, GAME_HEIGHT * scale);

    // stage 스케일 (내부 좌표계는 유지)
    app.stage.scale.set(scale);

    // 캔버스 중앙 정렬 (CSS로)
    const canvas = app.canvas as HTMLCanvasElement;
    canvas.style.position = 'absolute';
    canvas.style.left = `${(screenWidth - GAME_WIDTH * scale) / 2}px`;
    canvas.style.top = `${(screenHeight - GAME_HEIGHT * scale) / 2}px`;
  }

  window.addEventListener('resize', resize);
  resize();

  // 게임 루프
  app.ticker.maxFPS = TARGET_FPS;
  app.ticker.add(() => {
    game.update();
  });
}

main().catch(console.error);
