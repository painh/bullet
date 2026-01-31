import { Application } from 'pixi.js';
import { Game } from './Game';
import { GAME_WIDTH, GAME_HEIGHT, TARGET_FPS } from './constants';

async function main() {
  // PixiJS 애플리케이션 생성
  const app = new Application();

  await app.init({
    width: GAME_WIDTH,
    height: GAME_HEIGHT,
    backgroundColor: 0x000000,
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

  // 게임 루프
  app.ticker.maxFPS = TARGET_FPS;
  app.ticker.add(() => {
    game.update();
  });
}

main().catch(console.error);
