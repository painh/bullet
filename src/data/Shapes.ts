export interface Shape {
  textureName: string;
  size: number;
  hit: number;
}

// Shape ID enum
export enum ShapeId {
  ShVoid = 0,
  ShHit = 1,
  DpMyShip = 2,
  DpEnemy = 3,
  DpRedBullet = 4,
  DpBlueBullet = 5,
  PsMyShip = 6,
  PsEnemy = 7,
  PsNeedle = 8,
  PsBullet = 9,
  IkBlackMyShip = 10,
  IkWhiteMyShip = 11,
  IkEnemy = 12,
  IkBlackBullet = 13,
  IkWhiteBullet = 14,
  ThMyShip = 15,
  ThEnemy = 16,
  ThBlackBullet = 17,
  ThWhiteBullet = 18,
}

export const ShapeList: Shape[] = [
  { textureName: 'ShVoid', size: 0, hit: 0 },      // ShVoid
  { textureName: 'ShHit', size: 0, hit: 0 },       // ShHit
  { textureName: 'DpMyShip', size: 0.08, hit: 0.01 },
  { textureName: 'DpEnemy', size: 0.2, hit: 0.01 },
  { textureName: 'DpRedBullet', size: 0.04, hit: 0.01 },
  { textureName: 'DpBlueBullet', size: 0.05, hit: 0.01 },
  { textureName: 'PsMyShip', size: 0.08, hit: 0.01 },
  { textureName: 'PsEnemy', size: 0.08, hit: 0.01 },
  { textureName: 'PsNeedle', size: 0.04, hit: 0.01 },
  { textureName: 'PsBullet', size: 0.03, hit: 0.01 },
  { textureName: 'IkBlackMyShip', size: 0.08, hit: 0.01 },
  { textureName: 'IkWhiteMyShip', size: 0.08, hit: 0.01 },
  { textureName: 'IkEnemy', size: 0.08, hit: 0.01 },
  { textureName: 'IkBlackBullet', size: 0.03, hit: 0.01 },
  { textureName: 'IkWhiteBullet', size: 0.03, hit: 0.01 },
  { textureName: 'ThMyShip', size: 0.08, hit: 0.01 },
  { textureName: 'ThEnemy', size: 0.08, hit: 0.01 },
  { textureName: 'ThBlackBullet', size: 0.04, hit: 0.01 },
  { textureName: 'ThWhiteBullet', size: 0.04, hit: 0.01 },
];

export function getShape(id: ShapeId): Shape {
  return ShapeList[id];
}
