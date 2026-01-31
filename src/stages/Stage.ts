import { Container } from 'pixi.js';
import { ShapeId } from '../data/Shapes';
import { Bullet } from '../entities/Bullet';
import { Enemy } from '../entities/Enemy';
import { MyShip } from '../entities/MyShip';

export interface StageContext {
  container: Container;
  bulletList: Bullet[];
  enemyList: Enemy[];
  myShip: MyShip | null;
}

export interface Stage {
  name: string;
  myShipShapeId: ShapeId;
  topTime: number;
  init: (ctx: StageContext) => void;
}

// 플레이어 방향 각도 계산
export function getMyShipAngle(ctx: StageContext, x: number, y: number): number {
  if (!ctx.myShip) return 0.25; // 기본값: 아래 방향
  return Math.atan2(ctx.myShip.y - y, ctx.myShip.x - x) / Math.PI / 2;
}

// 특정 위치로의 각도 계산
export function getAngle(x: number, y: number, toX: number, toY: number): number {
  return Math.atan2(toY - y, toX - x) / Math.PI / 2;
}
