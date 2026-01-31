import { Application, Container, Graphics, Text, TextStyle, FederatedPointerEvent } from 'pixi.js';
import { GAME_WIDTH, GAME_HEIGHT, MAX_X, MAX_Y, MAX_SLOW, STAGE_ORDER, Colors } from './constants';
import { input } from './Input';
import { textureManager } from './TextureManager';
import { MyShip, MyShipCrash } from './entities/MyShip';
import { Bullet } from './entities/Bullet';
import { Enemy } from './entities/Enemy';
import { allStages, StageContext } from './stages';

interface TouchButton {
  graphics: Graphics;
  label: Text;
  x: number;
  y: number;
  width: number;
  height: number;
  buttonIndex?: number;  // 버튼 인덱스 (버튼용)
  action?: () => void;   // 클릭 액션 (링크용)
  isToggle?: boolean;    // 토글 버튼 여부
  getState?: () => boolean;  // 토글 상태 getter
  isPressed?: () => boolean; // 현재 눌림 상태
}

export class Game {
  private app: Application;
  private gameContainer: Container;
  private uiContainer: Container;
  private touchContainer: Container;
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
  private showColor: boolean = true;  // 기본값: 컬러 모드

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
  private fpsLabel!: Text;
  private fpsValue!: Text;
  private bulletLabel!: Text;
  private bulletValue!: Text;

  // 터치 버튼들
  private touchButtons: TouchButton[] = [];
  private joystickContainer!: Container;
  private joystickBg!: Graphics;
  private joystickKnob!: Graphics;
  private joystickActive: boolean = false;
  private joystickStartX: number = 0;
  private joystickStartY: number = 0;

  // FPS 계산
  private frameCount: number = 0;
  private lastFpsTime: number = 0;
  private currentFps: number = 0;

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

    // 터치 컨테이너
    this.touchContainer = new Container();
    this.app.stage.addChild(this.touchContainer);

    this.setupUI();
    this.setupTouchControls();
    this.drawBackground();
  }

  private setupUI(): void {
    const pixelFont = '"Press Start 2P", monospace';
    const textStyle = new TextStyle({
      fontFamily: pixelFont,
      fontSize: 8,
      fill: 0x000000,
    });

    const gameAreaWidth = GAME_HEIGHT * MAX_X / MAX_Y;
    const uiX = gameAreaWidth + 6;

    // 스테이지 이름 (게임 영역 내)
    this.stageNameText = new Text({ text: '', style: { ...textStyle, fill: 0x000000 } });
    this.stageNameText.x = 8;
    this.stageNameText.y = 8;
    this.uiContainer.addChild(this.stageNameText);

    // 시작 안내
    this.startText = new Text({ text: '[C] START', style: { ...textStyle, fill: 0x000000 } });
    this.startText.x = 8;
    this.startText.y = 22;
    this.uiContainer.addChild(this.startText);

    // 우측 UI
    let y = 6;
    const lineHeight = 12;
    const createLabel = (label: string, yPos: number) => {
      const text = new Text({ text: label, style: { ...textStyle, fontSize: 7 } });
      text.x = uiX;
      text.y = yPos;
      this.uiContainer.addChild(text);
      return text;
    };

    const createValue = (yPos: number) => {
      const text = new Text({ text: '', style: { ...textStyle, fontSize: 7 } });
      text.x = uiX + 55;
      text.y = yPos;
      this.uiContainer.addChild(text);
      return text;
    };

    this.stageLabel = createLabel('STG:', y);
    this.stageValue = createValue(y);
    y += lineHeight;

    this.timeLabel = createLabel('TIME:', y);
    this.timeValue = createValue(y);
    y += lineHeight;

    this.topTimeLabel = createLabel('TOP:', y);
    this.topTimeValue = createValue(y);
    y += lineHeight;

    this.fpsLabel = createLabel('FPS:', y);
    this.fpsValue = createValue(y);
    y += lineHeight;

    this.bulletLabel = createLabel('BLT:', y);
    this.bulletValue = createValue(y);
  }

  private setupTouchControls(): void {
    const gameAreaWidth = GAME_HEIGHT * MAX_X / MAX_Y;
    const uiX = gameAreaWidth + 8;
    const buttonWidth = 55;
    const buttonHeight = 28;
    const gap = 4;
    let y = 78;

    // 버튼 배치 (action 방식으로 직접 동작)
    let col = 0;
    let row = 0;

    // START 버튼 - 토글 (시작/정지)
    this.createTouchButton(uiX + col * (buttonWidth + gap), y + row * (buttonHeight + gap), buttonWidth, buttonHeight, 'START[C]', undefined, () => {
      if (this.stageActive) {
        this.stageActive = false;
      } else {
        this.stageActive = true;
        this.setStage(this.stageIndex);
      }
    }, () => this.stageActive);
    col++;

    // PAUSE 버튼 - 토글
    this.createTouchButton(uiX + col * (buttonWidth + gap), y + row * (buttonHeight + gap), buttonWidth, buttonHeight, 'PAUSE[V]', undefined, () => {
      this.paused = !this.paused;
    }, () => this.paused);
    col = 0; row++;

    // SLOW 버튼 - 홀드용 (저속이동)
    this.createTouchButton(uiX + col * (buttonWidth + gap), y + row * (buttonHeight + gap), buttonWidth, buttonHeight, 'SLOW[Z]', 0);
    col++;

    // HIT 버튼 - 토글
    this.createTouchButton(uiX + col * (buttonWidth + gap), y + row * (buttonHeight + gap), buttonWidth, buttonHeight, 'HIT[B]', undefined, () => {
      this.showHit = !this.showHit;
      this.saveSettings();
    }, () => this.showHit);
    col = 0; row++;

    // COLOR 버튼 - 토글
    this.createTouchButton(uiX + col * (buttonWidth + gap), y + row * (buttonHeight + gap), buttonWidth, buttonHeight, 'COLOR[N]', undefined, () => {
      this.showColor = !this.showColor;
      this.drawBackground();
      this.updateUIColors();
      this.saveSettings();
    }, () => this.showColor);
    col++;

    // x2 버튼 - 토글 (slow > 1이면 활성화)
    this.createTouchButton(uiX + col * (buttonWidth + gap), y + row * (buttonHeight + gap), buttonWidth, buttonHeight, 'x2[M]', undefined, () => {
      this.slow *= 2;
      if (this.slow > MAX_SLOW) this.slow = 1;
    }, () => this.slow > 1);
    row++;

    y += row * (buttonHeight + gap) + 10;

    // 스테이지 선택 버튼
    const stageButtonWidth = 27;
    this.createTouchButton(uiX, y, stageButtonWidth, buttonHeight, '◀', undefined, () => {
      if (!this.stageActive) this.setStage(this.stageIndex - STAGE_ORDER);
    });
    this.createTouchButton(uiX + stageButtonWidth + gap, y, stageButtonWidth, buttonHeight, '▶', undefined, () => {
      if (!this.stageActive) this.setStage(this.stageIndex + STAGE_ORDER);
    });
    this.createTouchButton(uiX + (stageButtonWidth + gap) * 2, y, stageButtonWidth, buttonHeight, '▲', undefined, () => {
      if (!this.stageActive) this.setStage(this.stageIndex - 10 * STAGE_ORDER);
    });
    this.createTouchButton(uiX + (stageButtonWidth + gap) * 3, y, stageButtonWidth, buttonHeight, '▼', undefined, () => {
      if (!this.stageActive) this.setStage(this.stageIndex + 10 * STAGE_ORDER);
    });

    y += buttonHeight + 10;

    // 재시작 버튼 [R]
    this.createTouchButton(uiX, y, buttonWidth * 2 + gap, buttonHeight, '🔄 RESTART[R]', undefined, () => {
      this.restartStage();
    });

    y += buttonHeight + 10;

    // 책 링크 버튼
    this.createTouchButton(uiX, y, buttonWidth * 2 + gap, buttonHeight, '📖 BOOK', undefined, () => {
      window.open('https://www.hanbit.co.kr/store/books/look.php?p_code=B7317098254', '_blank');
    });

    // 가상 조이패드 설정
    this.setupJoystick();
  }

  private createTouchButton(x: number, y: number, width: number, height: number, label: string, buttonIndex?: number, action?: () => void, getState?: () => boolean): TouchButton {
    const graphics = new Graphics();
    graphics.roundRect(0, 0, width, height, 4);
    graphics.fill({ color: 0x333333, alpha: 0.8 });
    graphics.stroke({ color: 0x666666, width: 1 });
    graphics.x = x;
    graphics.y = y;
    graphics.eventMode = 'static';
    graphics.cursor = 'pointer';
    // 명시적 hitArea 설정
    graphics.hitArea = { contains: (px: number, py: number) => px >= 0 && px <= width && py >= 0 && py <= height };

    const textStyle = new TextStyle({
      fontFamily: '"Press Start 2P", monospace',
      fontSize: 6,
      fill: 0xffffff,
    });
    const text = new Text({ text: label, style: textStyle });
    text.anchor.set(0.5);
    text.x = x + width / 2;
    text.y = y + height / 2 + 1;

    this.touchContainer.addChild(graphics);
    this.touchContainer.addChild(text);

    const button: TouchButton = { graphics, label: text, x, y, width, height, buttonIndex, action, isToggle: !!getState, getState };
    this.touchButtons.push(button);

    // 터치/마우스 이벤트
    let isPressed = false;

    const onPress = () => {
      isPressed = true;
      graphics.tint = 0x00ff00;
      if (buttonIndex !== undefined) {
        input.setVirtualButton(buttonIndex, true);
      }
      if (action) {
        action();
      }
    };

    const onRelease = () => {
      isPressed = false;
      // 토글 버튼이 아니거나, 토글 상태가 false면 기본색으로
      if (!getState || !getState()) {
        graphics.tint = 0xffffff;
      } else {
        graphics.tint = 0xffff00;  // 토글 활성 상태면 노란색
      }
      if (buttonIndex !== undefined) {
        input.setVirtualButton(buttonIndex, false);
      }
    };

    // 홀드 버튼(buttonIndex가 있는 버튼)의 pressed 상태 체크용
    button.isPressed = () => isPressed;

    // pointerdown/pointerup이 터치와 마우스 모두 처리함
    // touchstart/touchend를 함께 등록하면 모바일에서 이벤트가 두 번 발생
    graphics.on('pointerdown', onPress);
    graphics.on('pointerup', onRelease);
    graphics.on('pointerupoutside', onRelease);

    return button;
  }

  private setupJoystick(): void {
    const joystickSize = 100;
    const knobSize = 40;

    // 조이스틱 컨테이너 (처음엔 숨김)
    this.joystickContainer = new Container();
    this.joystickContainer.visible = false;
    this.touchContainer.addChild(this.joystickContainer);

    // 조이스틱 배경
    this.joystickBg = new Graphics();
    this.joystickBg.circle(0, 0, joystickSize / 2);
    this.joystickBg.fill({ color: 0x333333, alpha: 0.5 });
    this.joystickBg.stroke({ color: 0x666666, width: 2 });
    this.joystickContainer.addChild(this.joystickBg);

    // 조이스틱 노브
    this.joystickKnob = new Graphics();
    this.joystickKnob.circle(0, 0, knobSize / 2);
    this.joystickKnob.fill({ color: 0x666666, alpha: 0.8 });
    this.joystickContainer.addChild(this.joystickKnob);

    // 게임 영역에서 터치하면 조이스틱 생성
    const gameAreaWidth = GAME_HEIGHT * MAX_X / MAX_Y;

    // 터치 영역 (게임 영역 전체)
    const touchArea = new Graphics();
    touchArea.rect(0, 0, gameAreaWidth, GAME_HEIGHT);
    touchArea.fill({ color: 0x000000, alpha: 0.001 }); // 거의 투명
    touchArea.eventMode = 'static';
    this.touchContainer.addChildAt(touchArea, 0); // 맨 뒤에 배치

    touchArea.on('pointerdown', (e: FederatedPointerEvent) => {
      // 로컬 좌표로 변환 (스케일 적용됨)
      const local = this.touchContainer.toLocal(e.global);

      // 터치한 위치에 조이스틱 표시
      this.joystickContainer.x = local.x;
      this.joystickContainer.y = local.y;
      this.joystickContainer.visible = true;
      this.joystickActive = true;
      this.joystickStartX = local.x;
      this.joystickStartY = local.y;
      this.joystickKnob.x = 0;
      this.joystickKnob.y = 0;
    });

    this.app.stage.eventMode = 'static';
    this.app.stage.on('pointermove', (e: FederatedPointerEvent) => {
      if (this.joystickActive) {
        const local = this.touchContainer.toLocal(e.global);
        const dx = local.x - this.joystickStartX;
        const dy = local.y - this.joystickStartY;
        this.updateJoystick(dx, dy);
      }
    });

    this.app.stage.on('pointerup', () => {
      this.joystickActive = false;
      this.joystickContainer.visible = false;
      this.joystickKnob.x = 0;
      this.joystickKnob.y = 0;
      input.setVirtualDirection(false, false, false, false);
    });

    this.app.stage.on('pointerupoutside', () => {
      this.joystickActive = false;
      this.joystickContainer.visible = false;
      this.joystickKnob.x = 0;
      this.joystickKnob.y = 0;
      input.setVirtualDirection(false, false, false, false);
    });
  }

  private updateJoystick(x: number, y: number): void {
    const maxDist = 40;
    const dist = Math.sqrt(x * x + y * y);
    const clampedDist = Math.min(dist, maxDist);
    const angle = Math.atan2(y, x);

    this.joystickKnob.x = Math.cos(angle) * clampedDist;
    this.joystickKnob.y = Math.sin(angle) * clampedDist;

    // 방향 계산
    const threshold = 15;
    const up = y < -threshold;
    const down = y > threshold;
    const left = x < -threshold;
    const right = x > threshold;

    input.setVirtualDirection(up, down, left, right);
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
      this.fpsLabel, this.fpsValue,
      this.bulletLabel, this.bulletValue,
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

    // 스테이지 저장
    this.saveSettings();
  }

  // 현재 스테이지 재시작
  restartStage(): void {
    this.setStage(this.stageIndex);
    if (!this.stageActive) {
      this.stageActive = true;
    }
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
    // FPS 계산
    this.frameCount++;
    const now = performance.now();
    if (now - this.lastFpsTime >= 1000) {
      this.currentFps = this.frameCount;
      this.frameCount = 0;
      this.lastFpsTime = now;
    }

    input.update();
    const state = input.state;

    // 입력 처리 (토글)
    if (!this.prevInput) {
      if (state.button[3]) this.paused = !this.paused;
      if (state.button[4]) {
        this.showHit = !this.showHit;
        this.saveSettings();
      }
      if (state.button[5]) {
        this.showColor = !this.showColor;
        this.drawBackground();
        this.updateUIColors();
        this.saveSettings();
      }
      if (state.button[6]) {
        this.slow *= 2;
        if (this.slow > MAX_SLOW) this.slow = 1;
      }
      if (state.button[7]) {
        this.restartStage();
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
    this.updateToggleButtons();
  }

  private updateToggleButtons(): void {
    for (const button of this.touchButtons) {
      // 눌린 상태면 초록색 유지
      if (button.isPressed && button.isPressed()) {
        continue;
      }
      if (button.isToggle && button.getState) {
        // 토글 상태에 따라 색상 변경 (활성: 노란색, 비활성: 기본)
        button.graphics.tint = button.getState() ? 0xffff00 : 0xffffff;
      }
    }
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
    this.fpsValue.text = String(this.currentFps);
    this.bulletValue.text = String(this.bulletList.length);
  }

  async init(): Promise<void> {
    await textureManager.load();

    // localStorage에서 설정 로드
    this.loadSettings();

    this.setStage(this.stageIndex);
    this.drawBackground();
    this.updateUIColors();
  }

  private loadSettings(): void {
    try {
      const savedStage = localStorage.getItem('bullet_lastStage');
      if (savedStage !== null) {
        this.stageIndex = parseInt(savedStage, 10) || 0;
      }

      const savedColor = localStorage.getItem('bullet_showColor');
      if (savedColor !== null) {
        this.showColor = savedColor === 'true';
      }

      const savedHit = localStorage.getItem('bullet_showHit');
      if (savedHit !== null) {
        this.showHit = savedHit === 'true';
      }
    } catch (e) {
      // localStorage 접근 실패 시 무시
    }
  }

  private saveSettings(): void {
    try {
      localStorage.setItem('bullet_lastStage', String(this.stageIndex));
      localStorage.setItem('bullet_showColor', String(this.showColor));
      localStorage.setItem('bullet_showHit', String(this.showHit));
    } catch (e) {
      // localStorage 접근 실패 시 무시
    }
  }
}
