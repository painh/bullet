import { Container } from 'pixi.js';
import { Mover } from './Mover';
import { ShapeId } from '../data/Shapes';
import { MAX_X, MAX_Y } from '../constants';

export class Bullet extends Mover {
  public angleRate: number;
  public speed: number;
  public speedRate: number;

  constructor(
    container: Container,
    shapeId: ShapeId,
    x: number,
    y: number,
    angle: number,
    angleRate: number,
    speed: number,
    speedRate: number
  ) {
    super(container, shapeId, x, y, angle);
    this.angleRate = angleRate;
    this.speed = speed;
    this.speedRate = speedRate;
  }

  override move(): void {
    const rad = this.angle * Math.PI * 2;
    this.x += this.speed * Math.cos(rad);
    this.y += this.speed * Math.sin(rad);
    this.angle += this.angleRate;
    this.speed += this.speedRate;

    // 화면 밖으로 나가면 제거
    if (Math.abs(this.x) >= MAX_X + this.shape.size ||
        Math.abs(this.y) >= MAX_Y + this.shape.size) {
      this.alive = false;
    }
  }
}

// N-Way 발사 함수
export function shootNWay(
  container: Container,
  bulletList: Bullet[],
  shapeId: ShapeId,
  x: number,
  y: number,
  angle: number,
  angleRange: number,
  speed: number,
  count: number,
  angleRate: number,
  speedRate: number
): void {
  if (count > 1) {
    for (let i = 0; i < count; i++) {
      const bullet = new Bullet(
        container,
        shapeId,
        x,
        y,
        angle + angleRange * (i / (count - 1) - 0.5),
        angleRate,
        speed,
        speedRate
      );
      bulletList.push(bullet);
    }
  } else if (count === 1) {
    const bullet = new Bullet(
      container,
      shapeId,
      x,
      y,
      angle,
      angleRate,
      speed,
      speedRate
    );
    bulletList.push(bullet);
  }
}
