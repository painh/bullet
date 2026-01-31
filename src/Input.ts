export interface InputState {
  up: boolean;
  down: boolean;
  left: boolean;
  right: boolean;
  button: boolean[];
}

export class Input {
  private keys: Set<string> = new Set();
  private gamepad: Gamepad | null = null;

  public state: InputState = {
    up: false,
    down: false,
    left: false,
    right: false,
    button: new Array(32).fill(false),
  };

  constructor() {
    window.addEventListener('keydown', (e) => this.onKeyDown(e));
    window.addEventListener('keyup', (e) => this.onKeyUp(e));
    window.addEventListener('gamepadconnected', (e) => this.onGamepadConnected(e));
    window.addEventListener('gamepaddisconnected', () => this.onGamepadDisconnected());
  }

  private onKeyDown(e: KeyboardEvent): void {
    this.keys.add(e.code);
    e.preventDefault();
  }

  private onKeyUp(e: KeyboardEvent): void {
    this.keys.delete(e.code);
    e.preventDefault();
  }

  private onGamepadConnected(e: GamepadEvent): void {
    this.gamepad = e.gamepad;
  }

  private onGamepadDisconnected(): void {
    this.gamepad = null;
  }

  public update(): void {
    // 키보드 입력
    this.state.up = this.keys.has('ArrowUp') || this.keys.has('KeyW');
    this.state.down = this.keys.has('ArrowDown') || this.keys.has('KeyS');
    this.state.left = this.keys.has('ArrowLeft') || this.keys.has('KeyA');
    this.state.right = this.keys.has('ArrowRight') || this.keys.has('KeyD');

    // 버튼 매핑
    // Button 0: Z키 (저속 이동)
    // Button 1: X키 (색상 전환)
    // Button 2: C키 (시작/정지)
    // Button 3: V키 (일시정지)
    // Button 4: B키 (히트박스 표시)
    // Button 5: N키 (컬러 모드)
    // Button 6: M키 (슬로우)
    this.state.button[0] = this.keys.has('KeyZ') || this.keys.has('ShiftLeft') || this.keys.has('ShiftRight');
    this.state.button[1] = this.keys.has('KeyX');
    this.state.button[2] = this.keys.has('KeyC') || this.keys.has('Space');
    this.state.button[3] = this.keys.has('KeyV') || this.keys.has('Escape');
    this.state.button[4] = this.keys.has('KeyB');
    this.state.button[5] = this.keys.has('KeyN');
    this.state.button[6] = this.keys.has('KeyM');

    // 게임패드 입력
    const gamepads = navigator.getGamepads();
    const gp = gamepads[0];
    if (gp) {
      // 방향키 (디지털 패드 또는 아날로그 스틱)
      const deadzone = 0.3;
      const axisX = gp.axes[0] || 0;
      const axisY = gp.axes[1] || 0;

      if (axisX < -deadzone) this.state.left = true;
      if (axisX > deadzone) this.state.right = true;
      if (axisY < -deadzone) this.state.up = true;
      if (axisY > deadzone) this.state.down = true;

      // 버튼
      for (let i = 0; i < Math.min(gp.buttons.length, 32); i++) {
        if (gp.buttons[i].pressed) {
          this.state.button[i] = true;
        }
      }
    }
  }
}

export const input = new Input();
