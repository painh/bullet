import { Container } from 'pixi.js';
import { Mover } from './Mover';
import { Bullet } from './Bullet';
import { Enemy } from './Enemy';
import { ShapeId, ShapeList } from '../data/Shapes';
import { MAX_X, MAX_Y, MY_SHIP_HIGH_SPEED, MY_SHIP_LOW_SPEED } from '../constants';
import { input } from '../Input';

export class MyShip extends Mover {
  public prevButton: boolean = true;

  constructor(container: Container, shapeId: ShapeId) {
    const shape = ShapeList[shapeId];
    super(container, shapeId, 0, MAX_Y - shape.size, 0);
  }

  override move(): void {
    // 플레이어 이동은 Game에서 처리
  }

  moveWithInput(bulletList: Bullet[], enemyList: Enemy[]): boolean {
    const state = input.state;
    const speed = state.button[0] ? MY_SHIP_LOW_SPEED : MY_SHIP_HIGH_SPEED;

    let vx = 0, vy = 0;
    if (state.left) vx = -1;
    else if (state.right) vx = 1;
    if (state.up) vy = -1;
    else if (state.down) vy = 1;

    const mx = MAX_X - this.shape.size;
    const my = MAX_Y - this.shape.size;

    let newX = this.x + vx * speed;
    let newY = this.y + vy * speed;

    // 경계 체크
    if (newX < -mx) newX = -mx;
    else if (newX > mx) newX = mx;
    if (newY < -my) newY = -my;
    else if (newY > my) newY = my;

    // 대각선 이동 시 속도 정규화
    let dx = newX - this.x;
    let dy = newY - this.y;
    const d = Math.sqrt(dx * dx + dy * dy);
    if (d > speed) {
      dx *= speed / d;
      dy *= speed / d;
    }
    this.x += dx;
    this.y += dy;

    // 색상 모드가 아닌 경우
    if (this.color < 0) {
      // 총알 또는 적과 충돌 체크
      if (this.isHitList(bulletList) || this.isHitList(enemyList)) {
        return true; // 피격
      }
    } else {
      // 색상 모드 (이케부쿠로 스테이지)
      if (!this.prevButton && state.button[1]) {
        this.color = 1 - this.color;
      }
      this.prevButton = state.button[1];
      this.setShape(this.color === 0 ? ShapeId.IkBlackMyShip : ShapeId.IkWhiteMyShip);

      // 같은 색상의 총알은 흡수, 다른 색상은 피격
      for (const bullet of bulletList) {
        if (bullet.color === this.color) {
          const dx = bullet.x - this.x;
          const dy = bullet.y - this.y;
          const hit = bullet.shape.hit + this.shape.size;
          if (dx * dx + dy * dy < hit * hit) {
            bullet.alive = false;
          }
        } else {
          if (this.isHit(bullet)) {
            return true; // 피격
          }
        }
      }

      if (this.isHitList(enemyList)) {
        return true; // 피격
      }
    }

    return false; // 안전
  }
}

// 플레이어 사망 이펙트
export class MyShipCrash extends Mover {
  constructor(container: Container, myship: MyShip) {
    super(container, ShapeId.ShVoid, myship.x, myship.y, 0);
    this.shape = myship.shape;
  }

  override move(): void {
    this.angle += 0.08;
    this.scale -= 0.04;
    this.alpha -= 0.04;
    if (this.scale < 0) this.scale = 0;
    if (this.alpha < 0) this.alpha = 0;
  }
}
