import { Application, Container, Graphics, Text, TextStyle } from 'pixi.js';
import { GAME_WIDTH, GAME_HEIGHT, MAX_X, MAX_Y, MAX_SLOW, STAGE_ORDER, Colors } from './constants';
import { input } from './Input';
import { textureManager } from './TextureManager';
import { MyShip, MyShipCrash } from './entities/MyShip';
import { Bullet } from './entities/Bullet';
import { Enemy } from './entities/Enemy';
import { Mover } from './entities/Mover';
import { allStages, Stage, StageContext } from './stages';

export class Game {
  private app: Application;
  private gameContainer: Container;
  private uiContainer: Container;
  private background: Graphics;

  private myShip: MyShip | null = null;
  private myShipCrash: MyShipCrash | null = null;
  private bulletList: Bullet[] = [];
  private enemyList: Enemy[] = [];

  private stageIndex: number = 0;
  private stageActive: boolean = false;
  private paused: boolean = false;
  private slow: number = 1;
  private time: number = 0;
  private topTime: number = 0;
  private slowUsed: boolean = false;

  private showHit: boolean = false;
  private showColor: boolean = false;

  private prevInput: boolean = false;

  // UI 텍스트
  private stageNameText!: Text;
  private startText!: Text;
  private stageLabel!: Text;
  private stageValue!: Text;
  private timeLabel!: Text;
  private timeValue!: Text;
  private topTimeLabel!: Text;
  private topTimeValue!: Text;
  private pauseLabel!: Text;
  private pauseValue!: Text;
  private hitLabel!: Text;
  private hitValue!: Text;
  private colorLabel!: Text;
  private colorValue!: Text;
  private slowLabel!: Text;
  private slowValue!: Text;
  private controlsText!: Text;

  constructor(app: Application) {
    this.app = app;

    // 배경
    this.background = new Graphics();
    this.app.stage.addChild(this.background);

    // 게임 컨테이너 (게임 영역)
    this.gameContainer = new Container();
    this.app.stage.addChild(this.gameContainer);

    // UI 컨테이너
    this.uiContainer = new Container();
    this.app.stage.addChild(this.uiContainer);

    this.setupUI();
    this.drawBackground();
  }

  private setupUI(): void {
    const textStyle = new TextStyle({
      fontFamily: 'monospace',
      fontSize: 14,
      fill: 0x000000,
    });

    const gameAreaWidth = GAME_HEIGHT * MAX_X / MAX_Y;
    const uiX = gameAreaWidth + 10;

    // 스테이지 이름 (게임 영역 내)
    this.stageNameText = new Text({ text: '', style: { ...textStyle, fill: 0x000000 } });
    this.stageNameText.x = 10;
    this.stageNameText.y = 10;
    this.uiContainer.addChild(this.stageNameText);

    // 시작 안내
    this.startText = new Text({ text: 'PUSH BUTTON2 OR [C] TO START', style: { ...textStyle, fill: 0x000000 } });
    this.startText.x = 10;
    this.startText.y = 32;
    this.uiContainer.addChild(this.startText);

    // 우측 UI
    let y = 10;
    const createLabel = (label: string, yPos: number) => {
      const text = new Text({ text: label, style: textStyle });
      text.x = uiX;
      text.y = yPos;
      this.uiContainer.addChild(text);
      return text;
    };

    const createValue = (yPos: number) => {
      const text = new Text({ text: '', style: textStyle });
      text.x = uiX;
      text.y = yPos;
      this.uiContainer.addChild(text);
      return text;
    };

    this.stageLabel = createLabel('STAGE', y);
    this.stageValue = createValue(y + 16);
    y += 50;

    this.timeLabel = createLabel('TIME', y);
    this.timeValue = createValue(y + 16);
    y += 50;

    this.topTimeLabel = createLabel('TOP TIME', y);
    this.topTimeValue = createValue(y + 16);
    y += 50;

    this.pauseLabel = createLabel('PAUSE(B3,V)', y);
    this.pauseValue = createValue(y + 16);
    y += 50;

    this.hitLabel = createLabel('HIT(B4,B)', y);
    this.hitValue = createValue(y + 16);
    y += 50;

    this.colorLabel = createLabel('COLOR(B5,N)', y);
    this.colorValue = createValue(y + 16);
    y += 50;

    this.slowLabel = createLabel('SLOW(B6,M)', y);
    this.slowValue = createValue(y + 16);
    y += 60;

    // 조작키 안내
    const controlsStyle = new TextStyle({
      fontFamily: 'monospace',
      fontSize: 11,
      fill: 0xffffff,
      lineHeight: 14,
    });
    this.controlsText = new Text({
      text: '--- CONTROLS ---\n' +
            'Arrow/WASD: Move\n' +
            'Z/Shift: Slow Move\n' +
            'X: Color Toggle\n' +
            'C/Space: Start/Stop\n' +
            'V/Esc: Pause\n' +
            'B: Hitbox\n' +
            'N: Color Mode\n' +
            'M: Slow Mode',
      style: controlsStyle
    });
    this.controlsText.x = uiX;
    this.controlsText.y = y;
    this.uiContainer.addChild(this.controlsText);
  }

  private drawBackground(): void {
    this.background.clear();

    const gameAreaWidth = GAME_HEIGHT * MAX_X / MAX_Y;

    // 게임 영역 배경
    this.background.rect(0, 0, gameAreaWidth, GAME_HEIGHT);
    this.background.fill(this.showColor ? Colors.BLACK : Colors.WHITE);

    // UI 영역 배경
    this.background.rect(gameAreaWidth, 0, GAME_WIDTH - gameAreaWidth, GAME_HEIGHT);
    this.background.fill(this.showColor ? Colors.MID_GRAY : Colors.BLACK);
  }

  private updateUIColors(): void {
    const textColor = this.showColor ? Colors.WHITE : Colors.BLACK;
    const uiTextColor = this.showColor ? Colors.BLACK : Colors.WHITE;

    this.stageNameText.style.fill = textColor;
    this.startText.style.fill = textColor;

    [
      this.stageLabel, this.stageValue,
      this.timeLabel, this.timeValue,
      this.topTimeLabel, this.topTimeValue,
      this.pauseLabel, this.pauseValue,
      this.hitLabel, this.hitValue,
      this.colorLabel, this.colorValue,
      this.slowLabel, this.slowValue,
      this.controlsText,
    ].forEach(text => {
      text.style.fill = uiTextColor;
    });
  }

  setStage(index: number): void {
    this.stageIndex = ((index % allStages.length) + allStages.length) % allStages.length;

    // 기존 엔티티 정리
    this.clearEntities();

    const stage = allStages[this.stageIndex];

    // 플레이어 생성
    this.myShip = new MyShip(this.gameContainer, stage.myShipShapeId);

    // 스테이지 초기화
    const ctx: StageContext = {
      container: this.gameContainer,
      bulletList: this.bulletList,
      enemyList: this.enemyList,
      myShip: this.myShip,
    };
    stage.init(ctx);

    this.slowUsed = false;
    this.topTime = 0;
  }

  private clearEntities(): void {
    // 플레이어 정리
    if (this.myShip) {
      this.myShip.destroy();
      this.myShip = null;
    }
    if (this.myShipCrash) {
      this.myShipCrash.destroy();
      this.myShipCrash = null;
    }

    // 총알 정리
    for (const bullet of this.bulletList) {
      bullet.destroy();
    }
    this.bulletList.length = 0;

    // 적 정리
    for (const enemy of this.enemyList) {
      enemy.destroy();
    }
    this.enemyList.length = 0;
  }

  update(): void {
    input.update();
    const state = input.state;

    // 입력 처리 (토글)
    if (!this.prevInput) {
      if (state.button[3]) this.paused = !this.paused;
      if (state.button[4]) {
        this.showHit = !this.showHit;
      }
      if (state.button[5]) {
        this.showColor = !this.showColor;
        this.drawBackground();
        this.updateUIColors();
      }
      if (state.button[6]) {
        this.slow *= 2;
        if (this.slow > MAX_SLOW) this.slow = 1;
      }
    }

    // 스테이지 동작
    if (!this.paused) {
      if (this.stageActive) {
        if (this.slow > 1) this.slowUsed = true;

        // 최고 기록 업데이트
        const stage = allStages[this.stageIndex];
        if (!this.slowUsed && this.topTime > stage.topTime) {
          stage.topTime = this.topTime;
        }

        // 시간 증가 (플레이어가 완전히 나타난 경우에만)
        if (this.myShip && this.myShip.alpha === 1) {
          this.topTime++;
        }

        // 슬로우 모드 처리
        if (this.time === 0) {
          this.moveEntities();
        }
        this.time = (this.time + 1) % this.slow;

        // 스테이지 종료
        if (!this.prevInput && state.button[2]) {
          this.stageActive = false;
        }
      } else {
        // 스테이지 선택 모드
        if (!this.prevInput) {
          if (state.button[2]) {
            this.stageActive = true;
            this.setStage(this.stageIndex);
          } else if (state.left) {
            this.setStage(this.stageIndex - STAGE_ORDER);
          } else if (state.right) {
            this.setStage(this.stageIndex + STAGE_ORDER);
          } else if (state.up) {
            this.setStage(this.stageIndex - 10 * STAGE_ORDER);
          } else if (state.down) {
            this.setStage(this.stageIndex + 10 * STAGE_ORDER);
          }
        }
      }
    }

    // 이전 입력 상태 저장
    this.prevInput = false;
    for (let i = 2; i < 32; i++) {
      this.prevInput = this.prevInput || state.button[i];
    }
    if (!this.stageActive) {
      this.prevInput = this.prevInput || state.left || state.right || state.up || state.down;
    }

    this.draw();
  }

  private moveEntities(): void {
    // 플레이어 이동
    if (this.myShip && this.myShip.alive) {
      const hit = this.myShip.moveWithInput(this.bulletList, this.enemyList);
      if (hit) {
        this.myShip.alive = false;
        this.myShipCrash = new MyShipCrash(this.gameContainer, this.myShip);
      }
    }

    // 크래시 애니메이션
    if (this.myShipCrash) {
      this.myShipCrash.move();
    }

    // 총알 이동
    for (let i = this.bulletList.length - 1; i >= 0; i--) {
      const bullet = this.bulletList[i];
      bullet.move();
      if (!bullet.alive) {
        bullet.destroy();
        this.bulletList.splice(i, 1);
      }
    }

    // 적 이동 및 발사
    const ctx: StageContext = {
      container: this.gameContainer,
      bulletList: this.bulletList,
      enemyList: this.enemyList,
      myShip: this.myShip,
    };

    for (let i = this.enemyList.length - 1; i >= 0; i--) {
      const enemy = this.enemyList[i];
      enemy.move();

      // 적 슈터 발사 (shoot 메서드가 있는 경우)
      if ('shoot' in enemy && typeof (enemy as any).shoot === 'function') {
        (enemy as any).shoot(this.bulletList, ctx, this.enemyList);
      }

      if (!enemy.alive) {
        enemy.destroy();
        this.enemyList.splice(i, 1);
      }
    }
  }

  private draw(): void {
    // 엔티티 그리기
    if (this.myShip) {
      this.myShip.draw(this.showHit, this.showColor);
    }
    if (this.myShipCrash) {
      this.myShipCrash.draw(this.showHit, this.showColor);
    }

    for (const bullet of this.bulletList) {
      bullet.draw(this.showHit, this.showColor);
    }

    for (const enemy of this.enemyList) {
      enemy.draw(this.showHit, this.showColor);
    }

    // UI 업데이트
    const stage = allStages[this.stageIndex];

    if (!this.stageActive) {
      this.stageNameText.text = `"${stage.name}"`;
      this.stageNameText.visible = true;
      this.startText.visible = true;
    } else {
      this.stageNameText.visible = false;
      this.startText.visible = false;
    }

    this.stageValue.text = String(this.stageIndex);
    this.timeValue.text = String(this.topTime);
    this.topTimeValue.text = String(stage.topTime);
    this.pauseValue.text = this.paused ? 'ON' : 'OFF';
    this.hitValue.text = this.showHit ? 'ON' : 'OFF';
    this.colorValue.text = this.showColor ? 'ON' : 'OFF';
    this.slowValue.text = String(this.slow);
  }

  async init(): Promise<void> {
    await textureManager.load();
    this.setStage(0);
    this.updateUIColors();
  }
}
