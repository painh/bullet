import { Container, Sprite } from 'pixi.js';
import { Shape, ShapeList, ShapeId } from '../data/Shapes';
import { textureManager } from '../TextureManager';
import { MAX_X, MAX_Y, GAME_HEIGHT } from '../constants';

export class Mover {
  public shape: Shape;
  public x: number;
  public y: number;
  public angle: number;
  public scale: number = 1;
  public alpha: number = 1;
  public alive: boolean = true;
  public color: number = -1; // -1 = 없음, 0 = 검정, 1 = 흰색

  protected sprite: Sprite | null = null;
  protected hitSprite: Sprite | null = null;

  constructor(
    public readonly container: Container,
    shapeId: ShapeId,
    x: number,
    y: number,
    angle: number
  ) {
    this.shape = ShapeList[shapeId];
    this.x = x;
    this.y = y;
    this.angle = angle;
  }

  setShape(shapeId: ShapeId): void {
    this.shape = ShapeList[shapeId];
  }

  move(): void {
    // 서브클래스에서 오버라이드
  }

  draw(showHit: boolean, showColor: boolean): void {
    const texture = textureManager.get(this.shape.textureName, showColor);
    if (!texture || this.shape.size === 0) {
      if (this.sprite) {
        this.sprite.visible = false;
      }
      if (this.hitSprite) {
        this.hitSprite.visible = false;
      }
      return;
    }

    // 좌표 변환: 정규화 좌표 -> 화면 좌표
    // 게임 영역은 정사각형으로, 높이 기준
    const sw = (GAME_HEIGHT * MAX_X / MAX_Y) * 0.5;
    const sh = (GAME_HEIGHT / MAX_Y) * 0.5;
    const screenX = (this.x + 1) * sw;
    const screenY = (this.y + 1) * sh;
    const size = this.shape.size * this.scale * GAME_HEIGHT * 0.5;

    if (!this.sprite) {
      this.sprite = new Sprite(texture);
      this.sprite.anchor.set(0.5);
      this.container.addChild(this.sprite);
    }

    this.sprite.texture = texture;
    this.sprite.x = screenX;
    this.sprite.y = screenY;
    this.sprite.width = size * 2;
    this.sprite.height = size * 2;
    this.sprite.rotation = this.angle * Math.PI * 2;
    this.sprite.alpha = this.alpha * (showHit ? 0.25 : 1);
    this.sprite.visible = true;

    // 히트박스 표시
    if (showHit) {
      const hitTexture = textureManager.get('ShHit', showColor);
      if (hitTexture) {
        if (!this.hitSprite) {
          this.hitSprite = new Sprite(hitTexture);
          this.hitSprite.anchor.set(0.5);
          this.container.addChild(this.hitSprite);
        }
        const hitSize = this.shape.hit * this.scale * GAME_HEIGHT * 0.5;
        this.hitSprite.texture = hitTexture;
        this.hitSprite.x = screenX;
        this.hitSprite.y = screenY;
        this.hitSprite.width = hitSize * 2;
        this.hitSprite.height = hitSize * 2;
        this.hitSprite.alpha = this.alpha;
        this.hitSprite.visible = true;
      }
    } else if (this.hitSprite) {
      this.hitSprite.visible = false;
    }
  }

  isHit(other: Mover): boolean {
    const dx = other.x - this.x;
    const dy = other.y - this.y;
    const hit = other.shape.hit + this.shape.hit;
    return dx * dx + dy * dy < hit * hit;
  }

  isHitList(list: Mover[]): boolean {
    for (const mover of list) {
      if (this.isHit(mover)) return true;
    }
    return false;
  }

  destroy(): void {
    if (this.sprite) {
      this.container.removeChild(this.sprite);
      this.sprite.destroy();
      this.sprite = null;
    }
    if (this.hitSprite) {
      this.container.removeChild(this.hitSprite);
      this.hitSprite.destroy();
      this.hitSprite = null;
    }
  }
}

// 유틸리티 함수
export function getAngle(x: number, y: number, toX: number, toY: number): number {
  return Math.atan2(toY - y, toX - x) / Math.PI / 2;
}
