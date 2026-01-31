import { Container } from 'pixi.js';
import { Stage, StageContext, getMyShipAngle } from './Stage';
import { ShapeId } from '../data/Shapes';
import { Bullet, shootNWay } from '../entities/Bullet';
import { Enemy } from '../entities/Enemy';
import { rand } from '../Rand';
import { CircleShooter, NWayShooter } from './PolarStages';

// 조준 슈터
class AimingShooter extends Enemy {
  shotSpeed: number;
  interval: number;
  time: number = 0;

  constructor(container: Container, x: number, y: number, speed: number, interval: number) {
    super(container, ShapeId.IkEnemy, x, y);
    this.shotSpeed = speed;
    this.interval = interval;
  }

  shoot(bulletList: Bullet[], ctx: StageContext): void {
    if (this.time === 0) {
      const bullet = new Bullet(
        this.container,
        ShapeId.PsBullet,
        this.x, this.y,
        getMyShipAngle(ctx, this.x, this.y), 0,
        this.shotSpeed, 0
      );
      bulletList.push(bullet);
    }
    this.time = (this.time + 1) % this.interval;
  }
}

// 라인 슈터
class LineShooter extends Enemy {
  shotAngle: number;
  shotSpeed: number;
  interval: number;
  shotTime: number;
  waitTime: number;
  time: number = 0;

  constructor(
    container: Container,
    x: number, y: number,
    angle: number, speed: number,
    interval: number, shotTime: number, waitTime: number
  ) {
    super(container, ShapeId.PsEnemy, x, y);
    this.shotAngle = angle;
    this.shotSpeed = speed;
    this.interval = interval;
    this.shotTime = shotTime;
    this.waitTime = waitTime;
  }

  shoot(bulletList: Bullet[]): void {
    if (this.time < this.shotTime && this.time % this.interval === 0) {
      const bullet = new Bullet(
        this.container,
        ShapeId.PsNeedle,
        this.x, this.y,
        this.shotAngle, 0,
        this.shotSpeed, 0
      );
      bulletList.push(bullet);
    }
    this.time = (this.time + 1) % (this.shotTime + this.waitTime);
  }
}

// 조준 라인 슈터
class AimingLineShooter extends Enemy {
  shotAngle: number = 0;
  shotSpeed: number;
  interval: number;
  shotTime: number;
  waitTime: number;
  time: number = 0;

  constructor(
    container: Container,
    x: number, y: number, speed: number,
    interval: number, shotTime: number, waitTime: number
  ) {
    super(container, ShapeId.PsEnemy, x, y);
    this.shotSpeed = speed;
    this.interval = interval;
    this.shotTime = shotTime;
    this.waitTime = waitTime;
  }

  shoot(bulletList: Bullet[], ctx: StageContext): void {
    if (this.time === 0) {
      this.shotAngle = getMyShipAngle(ctx, this.x, this.y);
    }
    if (this.time < this.shotTime && this.time % this.interval === 0) {
      const bullet = new Bullet(
        this.container,
        ShapeId.PsNeedle,
        this.x, this.y,
        this.shotAngle, 0,
        this.shotSpeed, 0
      );
      bulletList.push(bullet);
    }
    this.time = (this.time + 1) % (this.shotTime + this.waitTime);
  }
}

// N-Way 라인 슈터
class NWayLineShooter extends LineShooter {
  shotAngleRange: number;
  shotCount: number;

  constructor(
    container: Container,
    x: number, y: number,
    angle: number, speed: number,
    interval: number, shotTime: number, waitTime: number,
    angleRange: number, count: number
  ) {
    super(container, x, y, angle, speed, interval, shotTime, waitTime);
    this.shotAngleRange = angleRange;
    this.shotCount = count;
  }

  override shoot(bulletList: Bullet[]): void {
    if (this.time < this.shotTime && this.time % this.interval === 0) {
      shootNWay(
        this.container, bulletList,
        ShapeId.PsNeedle,
        this.x, this.y,
        this.shotAngle, this.shotAngleRange,
        this.shotSpeed, this.shotCount,
        0, 0
      );
    }
    this.time = (this.time + 1) % (this.shotTime + this.waitTime);
  }
}

// 확산 슈터
class SpreadingShooter extends Enemy {
  shotAngleRange: number;
  shotSpeed: number;
  shotCount: number;
  interval: number;
  groupSpeed: number;
  groupCount: number;
  time: number = 0;

  constructor(
    container: Container,
    angleRange: number, speed: number, count: number, interval: number,
    groupSpeed: number, groupCount: number
  ) {
    super(container, ShapeId.IkEnemy);
    this.shotAngleRange = angleRange;
    this.shotSpeed = speed;
    this.shotCount = count;
    this.interval = interval;
    this.groupSpeed = groupSpeed;
    this.groupCount = groupCount;
  }

  shoot(bulletList: Bullet[], ctx: StageContext): void {
    if (this.time === 0) {
      for (let i = 0; i < this.groupCount; i++) {
        shootNWay(
          this.container, bulletList,
          ShapeId.DpRedBullet,
          this.x, this.y,
          getMyShipAngle(ctx, this.x, this.y), this.shotAngleRange,
          this.shotSpeed + this.groupSpeed * i, this.shotCount,
          0, 0
        );
      }
    }
    this.time = (this.time + 1) % this.interval;
  }
}

// 랜덤 확산 슈터
class RandomSpreadingShooter extends Enemy {
  shotAngleRange: number;
  shotSpeed: number;
  shotSpeedRange: number;
  shotCount: number;
  interval: number;
  time: number = 0;

  constructor(
    container: Container,
    angleRange: number, speed: number, speedRange: number,
    count: number, interval: number
  ) {
    super(container, ShapeId.IkEnemy);
    this.shotAngleRange = angleRange;
    this.shotSpeed = speed;
    this.shotSpeedRange = speedRange;
    this.shotCount = count;
    this.interval = interval;
  }

  shoot(bulletList: Bullet[], ctx: StageContext): void {
    if (this.time === 0) {
      for (let i = 0; i < this.shotCount; i++) {
        const bullet = new Bullet(
          this.container,
          ShapeId.DpRedBullet,
          this.x, this.y,
          getMyShipAngle(ctx, this.x, this.y) + this.shotAngleRange * (rand.real1() - 0.5),
          0,
          this.shotSpeed + this.shotSpeedRange * (rand.real1() - 0.5),
          0
        );
        bulletList.push(bullet);
      }
    }
    this.time = (this.time + 1) % this.interval;
  }
}

// 추월 슈터
class OvertakingShooter extends Enemy {
  shotAngleRange: number;
  shotSpeed: number;
  shotCount: number;
  interval: number;
  groupSpeed: number;
  groupAngle: number;
  groupCount: number;
  groupInterval: number;
  shotAngle: number = 0;
  time: number = 0;

  constructor(
    container: Container,
    angleRange: number, speed: number, count: number, interval: number,
    groupSpeed: number, groupAngle: number,
    groupCount: number, groupInterval: number
  ) {
    super(container, ShapeId.IkEnemy);
    this.shotAngleRange = angleRange;
    this.shotSpeed = speed;
    this.shotCount = count;
    this.interval = interval;
    this.groupSpeed = groupSpeed;
    this.groupAngle = groupAngle;
    this.groupCount = groupCount;
    this.groupInterval = groupInterval;
  }

  shoot(bulletList: Bullet[], ctx: StageContext): void {
    if (this.time === 0) {
      this.shotAngle = getMyShipAngle(ctx, this.x, this.y);
    }
    const i = Math.floor(this.time / this.groupInterval);
    if (i < this.groupCount && this.time % this.groupInterval === 0) {
      shootNWay(
        this.container, bulletList,
        ShapeId.DpRedBullet,
        this.x, this.y,
        this.shotAngle + this.groupAngle * i, this.shotAngleRange,
        this.shotSpeed + this.groupSpeed * i, this.shotCount,
        0, 0
      );
    }
    this.time = (this.time + 1) % this.interval;
  }
}

// 와인더 슈터
class WinderShooter extends Enemy {
  circle: [CircleShooter, CircleShooter];
  shotAngle: number;
  winderAngleRange: number;
  cycle: number;
  time: number = 0;

  constructor(
    container: Container,
    angle: number, speed: number, count: number, interval: number,
    winderAngleRange: number, cycle: number
  ) {
    super(container, ShapeId.ShVoid);
    this.shotAngle = angle;
    this.winderAngleRange = winderAngleRange;
    this.cycle = cycle;

    this.circle = [
      new CircleShooter(container, angle, speed, count, interval, 0, 0),
      new CircleShooter(container, angle, speed, count, interval, 0, 0)
    ];
    this.circle[0].x = -0.6;
    this.circle[0].y = -0.2;
    this.circle[1].x = 0.6;
    this.circle[1].y = -0.2;
  }

  shoot(bulletList: Bullet[]): void {
    this.circle[0].shotAngle = this.shotAngle - this.winderAngleRange * Math.sin(Math.PI * 2 * this.time / this.cycle);
    this.circle[1].shotAngle = this.shotAngle + this.winderAngleRange * Math.sin(Math.PI * 2 * this.time / this.cycle);
    this.time = (this.time + 1) % this.cycle;

    this.circle[0].shoot(bulletList);
    this.circle[1].shoot(bulletList);
  }
}

// 색상 스파이럴 슈터
class ColoredSpiralShooter extends Enemy {
  shotAngle: [number, number];
  shotAngleRate: [number, number];
  shotSpeed: number;
  shotCount: number;
  interval: number;
  time: number = 0;

  constructor(
    container: Container,
    angle: number,
    angleRate0: number,
    angleRate1: number,
    speed: number,
    count: number,
    interval: number
  ) {
    super(container, ShapeId.IkEnemy);
    this.shotAngle = [angle, angle];
    this.shotAngleRate = [angleRate0, angleRate1];
    this.shotSpeed = speed;
    this.shotCount = count;
    this.interval = interval;
  }

  shoot(bulletList: Bullet[]): void {
    if (this.time === 0) {
      for (let j = 0; j < 2; j++) {
        for (let i = 0; i < this.shotCount; i++) {
          const bullet = new Bullet(
            this.container,
            j === 0 ? ShapeId.ThBlackBullet : ShapeId.ThWhiteBullet,
            this.x, this.y,
            this.shotAngle[j] + i / this.shotCount, 0,
            this.shotSpeed, 0
          );
          bullet.color = j;
          bulletList.push(bullet);
        }
        this.shotAngle[j] += this.shotAngleRate[j];
        this.shotAngle[j] -= Math.floor(this.shotAngle[j]);
      }
    }
    this.time = (this.time + 1) % this.interval;
  }
}

// 색상 랜덤 N-Way 슈터
class ColoredRandomNWayShooter extends Enemy {
  shotAngleRange: number;
  shotSpeed: number;
  interval: number;
  time: number = 0;

  constructor(
    container: Container,
    x: number, y: number,
    angleRange: number, speed: number, interval: number, color: number
  ) {
    super(container, ShapeId.IkEnemy, x, y);
    this.shotAngleRange = angleRange;
    this.shotSpeed = speed;
    this.interval = interval;
    this.color = color;
  }

  shoot(bulletList: Bullet[], ctx: StageContext): void {
    if (this.time === 0) {
      const bullet = new Bullet(
        this.container,
        this.color === 0 ? ShapeId.IkBlackBullet : ShapeId.IkWhiteBullet,
        this.x, this.y,
        getMyShipAngle(ctx, this.x, this.y) + this.shotAngleRange * (rand.real1() - 0.5),
        0, this.shotSpeed, 0
      );
      bullet.color = this.color;
      bulletList.push(bullet);
    }
    this.time = (this.time + 1) % this.interval;
  }
}

// 색상 조합 슈터
class ColoredCombinationShooter extends Enemy {
  spiral: ColoredSpiralShooter | null = null;
  nway: ColoredRandomNWayShooter | null = null;
  time: number = 0;

  constructor(container: Container) {
    super(container, ShapeId.IkEnemy);
  }

  shoot(bulletList: Bullet[], ctx: StageContext, enemyList: Enemy[]): void {
    switch (this.time) {
      case 0:
        if (this.spiral) this.spiral.alive = false;
        this.nway = new ColoredRandomNWayShooter(this.container, this.x, this.y, 1, 0.02, 1, 0);
        this.nway.setShape(ShapeId.ShVoid);
        enemyList.push(this.nway);
        break;
      case 100:
        this.spiral = new ColoredSpiralShooter(this.container, 0, -0.003, 0.002, 0.02, 8, 3);
        this.spiral.setShape(ShapeId.ShVoid);
        enemyList.push(this.spiral);
        break;
      case 200:
        if (this.nway) this.nway.alive = false;
        break;
      case 300:
        if (this.spiral) this.spiral.alive = false;
        this.nway = new ColoredRandomNWayShooter(this.container, this.x, this.y, 1, 0.02, 1, 1);
        this.nway.setShape(ShapeId.ShVoid);
        enemyList.push(this.nway);
        break;
      case 400:
        this.spiral = new ColoredSpiralShooter(this.container, 0, 0.002, -0.003, 0.02, 8, 3);
        this.spiral.setShape(ShapeId.ShVoid);
        enemyList.push(this.spiral);
        break;
      case 500:
        if (this.nway) this.nway.alive = false;
        break;
    }
    this.time = (this.time + 1) % 600;
  }
}

// 스테이지 정의
export const ikebukuroStages: Stage[] = [
  {
    name: 'AIMING',
    myShipShapeId: ShapeId.IkBlackMyShip,
    topTime: 0,
    init: (ctx: StageContext) => {
      const shooter = new AimingShooter(ctx.container, 0, -0.7, 0.02, 10);
      ctx.enemyList.push(shooter);
    }
  },
  {
    name: 'AIMING 2',
    myShipShapeId: ShapeId.IkBlackMyShip,
    topTime: 0,
    init: (ctx: StageContext) => {
      ctx.enemyList.push(new AimingShooter(ctx.container, -0.4, -0.7, 0.02, 10));
      ctx.enemyList.push(new AimingShooter(ctx.container, 0.4, -0.7, 0.02, 10));
    }
  },
  {
    name: 'AIMING 3',
    myShipShapeId: ShapeId.IkBlackMyShip,
    topTime: 0,
    init: (ctx: StageContext) => {
      ctx.enemyList.push(new AimingShooter(ctx.container, -0.4, -0.7, 0.02, 10));
      ctx.enemyList.push(new AimingShooter(ctx.container, 0.4, -0.7, 0.03, 11));
    }
  },
  {
    name: 'AIMING 4',
    myShipShapeId: ShapeId.IkBlackMyShip,
    topTime: 0,
    init: (ctx: StageContext) => {
      ctx.enemyList.push(new AimingShooter(ctx.container, -0.6, -0.6, 0.02, 10));
      ctx.enemyList.push(new AimingShooter(ctx.container, -0.3, -0.7, 0.03, 11));
      ctx.enemyList.push(new AimingShooter(ctx.container, 0, -0.8, 0.04, 12));
      ctx.enemyList.push(new AimingShooter(ctx.container, 0.3, -0.7, 0.03, 11));
      ctx.enemyList.push(new AimingShooter(ctx.container, 0.6, -0.6, 0.02, 10));
    }
  },
  {
    name: 'CIRCLE + AIMING',
    myShipShapeId: ShapeId.IkBlackMyShip,
    topTime: 0,
    init: (ctx: StageContext) => {
      ctx.enemyList.push(new CircleShooter(ctx.container, 0.25, 0.02, 32, 11, 0, 0));
    }
  },
  {
    name: 'CIRCLE + AIMING 2',
    myShipShapeId: ShapeId.IkBlackMyShip,
    topTime: 0,
    init: (ctx: StageContext) => {
      ctx.enemyList.push(new CircleShooter(ctx.container, 0.25, 0.02, 32, 11, 0, 0));
      ctx.enemyList.push(new AimingShooter(ctx.container, -0.4, -0.7, 0.02, 10));
      ctx.enemyList.push(new AimingShooter(ctx.container, 0.4, -0.7, 0.02, 10));
    }
  },
  {
    name: 'CIRCLE + AIMING 3',
    myShipShapeId: ShapeId.IkBlackMyShip,
    topTime: 0,
    init: (ctx: StageContext) => {
      const circle = new CircleShooter(ctx.container, 0.25, 0.02, 32, 11, 0, 0);
      circle.setShape(ShapeId.ShVoid);
      ctx.enemyList.push(circle);
      const aiming = new AimingShooter(ctx.container, 0, -0.7, 0.03, 11);
      aiming.setShape(ShapeId.ShVoid);
      ctx.enemyList.push(aiming);
      ctx.enemyList.push(new Enemy(ctx.container, ShapeId.PsEnemy));
    }
  },
  {
    name: 'AREA',
    myShipShapeId: ShapeId.IkBlackMyShip,
    topTime: 0,
    init: (ctx: StageContext) => {
      const c1 = new CircleShooter(ctx.container, 0.25, 0.01, 11, 15, 0, 0);
      c1.x = -0.6; c1.y = -0.2;
      ctx.enemyList.push(c1);
      const c2 = new CircleShooter(ctx.container, 0.25, 0.01, 11, 15, 0, 0);
      c2.x = 0.6; c2.y = -0.2;
      ctx.enemyList.push(c2);
    }
  },
  {
    name: 'AREA 2',
    myShipShapeId: ShapeId.IkBlackMyShip,
    topTime: 0,
    init: (ctx: StageContext) => {
      const c1 = new CircleShooter(ctx.container, 0.25, 0.04, 11, 1, 0, 0);
      c1.x = -0.6; c1.y = -0.2;
      ctx.enemyList.push(c1);
      const c2 = new CircleShooter(ctx.container, 0.25, 0.04, 11, 1, 0, 0);
      c2.x = 0.6; c2.y = -0.2;
      ctx.enemyList.push(c2);
    }
  },
  {
    name: 'WINDER',
    myShipShapeId: ShapeId.IkBlackMyShip,
    topTime: 0,
    init: (ctx: StageContext) => {
      const shooter = new WinderShooter(ctx.container, 0.25, 0.04, 11, 1, 0.05, 300);
      ctx.enemyList.push(shooter);
      ctx.enemyList.push(shooter.circle[0]);
      ctx.enemyList.push(shooter.circle[1]);
    }
  },
  {
    name: 'WINDER 2',
    myShipShapeId: ShapeId.IkBlackMyShip,
    topTime: 0,
    init: (ctx: StageContext) => {
      const shooter = new WinderShooter(ctx.container, 0.25, 0.04, 6, 1, 0.1, 300);
      ctx.enemyList.push(shooter);
      ctx.enemyList.push(shooter.circle[0]);
      ctx.enemyList.push(shooter.circle[1]);
    }
  },
  {
    name: 'LINE',
    myShipShapeId: ShapeId.IkBlackMyShip,
    topTime: 0,
    init: (ctx: StageContext) => {
      ctx.enemyList.push(new LineShooter(ctx.container, -0.8, -0.4, 0.25, 0.03, 2, 30, 10));
      ctx.enemyList.push(new LineShooter(ctx.container, -0.4, -0.6, 0.25, 0.025, 2, 25, 10));
      ctx.enemyList.push(new LineShooter(ctx.container, 0, -0.7, 0.25, 0.02, 2, 20, 10));
      ctx.enemyList.push(new LineShooter(ctx.container, 0.4, -0.6, 0.25, 0.025, 2, 25, 10));
      ctx.enemyList.push(new LineShooter(ctx.container, 0.8, -0.4, 0.25, 0.03, 2, 30, 10));
    }
  },
  {
    name: 'LINE 2',
    myShipShapeId: ShapeId.IkBlackMyShip,
    topTime: 0,
    init: (ctx: StageContext) => {
      ctx.enemyList.push(new LineShooter(ctx.container, -0.8, -0.4, 0.1, 0.03, 2, 30, 10));
      ctx.enemyList.push(new LineShooter(ctx.container, -0.4, -0.6, 0.3, 0.025, 2, 25, 10));
      ctx.enemyList.push(new LineShooter(ctx.container, 0, -0.7, 0.25, 0.02, 2, 20, 10));
      ctx.enemyList.push(new LineShooter(ctx.container, 0.4, -0.6, 0.2, 0.025, 2, 25, 10));
      ctx.enemyList.push(new LineShooter(ctx.container, 0.8, -0.4, 0.4, 0.03, 2, 30, 10));
    }
  },
  {
    name: 'N-WAY LINE',
    myShipShapeId: ShapeId.IkBlackMyShip,
    topTime: 0,
    init: (ctx: StageContext) => {
      ctx.enemyList.push(new NWayLineShooter(ctx.container, -0.8, -0.4, 0.1, 0.03, 2, 30, 10, 0.25, 3));
      ctx.enemyList.push(new NWayLineShooter(ctx.container, -0.4, -0.6, 0.3, 0.025, 2, 25, 10, 0.25, 3));
      ctx.enemyList.push(new NWayLineShooter(ctx.container, 0, -0.7, 0.25, 0.02, 2, 20, 10, 0.25, 3));
      ctx.enemyList.push(new NWayLineShooter(ctx.container, 0.4, -0.6, 0.2, 0.025, 2, 25, 10, 0.25, 3));
      ctx.enemyList.push(new NWayLineShooter(ctx.container, 0.8, -0.4, 0.4, 0.03, 2, 30, 10, 0.25, 3));
    }
  },
  {
    name: 'AIMING LINE',
    myShipShapeId: ShapeId.IkBlackMyShip,
    topTime: 0,
    init: (ctx: StageContext) => {
      ctx.enemyList.push(new AimingShooter(ctx.container, 0, -0.7, 0.02, 2));
    }
  },
  {
    name: 'AIMING LINE 2',
    myShipShapeId: ShapeId.IkBlackMyShip,
    topTime: 0,
    init: (ctx: StageContext) => {
      ctx.enemyList.push(new AimingLineShooter(ctx.container, 0, -0.7, 0.02, 2, 20, 10));
    }
  },
  {
    name: 'AIMING LINE 3',
    myShipShapeId: ShapeId.IkBlackMyShip,
    topTime: 0,
    init: (ctx: StageContext) => {
      ctx.enemyList.push(new AimingLineShooter(ctx.container, -0.8, -0.4, 0.03, 2, 30, 10));
      ctx.enemyList.push(new AimingLineShooter(ctx.container, -0.4, -0.6, 0.025, 2, 25, 10));
      ctx.enemyList.push(new AimingLineShooter(ctx.container, 0, -0.7, 0.02, 2, 20, 10));
      ctx.enemyList.push(new AimingLineShooter(ctx.container, 0.4, -0.6, 0.025, 2, 20, 10));
      ctx.enemyList.push(new AimingLineShooter(ctx.container, 0.8, -0.4, 0.03, 2, 30, 10));
    }
  },
  {
    name: 'AIMING LINE 4',
    myShipShapeId: ShapeId.IkBlackMyShip,
    topTime: 0,
    init: (ctx: StageContext) => {
      ctx.enemyList.push(new LineShooter(ctx.container, -0.8, -0.4, 0.1, 0.03, 2, 30, 10));
      ctx.enemyList.push(new AimingLineShooter(ctx.container, -0.4, -0.6, 0.025, 2, 25, 10));
      ctx.enemyList.push(new LineShooter(ctx.container, 0, -0.7, 0.25, 0.02, 2, 20, 10));
      ctx.enemyList.push(new AimingLineShooter(ctx.container, 0.4, -0.6, 0.025, 2, 25, 10));
      ctx.enemyList.push(new LineShooter(ctx.container, 0.8, -0.4, 0.4, 0.03, 2, 30, 10));
    }
  },
  {
    name: 'SPREADING',
    myShipShapeId: ShapeId.IkBlackMyShip,
    topTime: 0,
    init: (ctx: StageContext) => {
      ctx.enemyList.push(new SpreadingShooter(ctx.container, 0.2, 0.01, 9, 240, 0.005, 4));
    }
  },
  {
    name: 'SPREADING 2',
    myShipShapeId: ShapeId.IkBlackMyShip,
    topTime: 0,
    init: (ctx: StageContext) => {
      const s1 = new SpreadingShooter(ctx.container, 0.2, 0.0125, 9, 240, 0.005, 4);
      s1.setShape(ShapeId.ShVoid);
      ctx.enemyList.push(s1);
      ctx.enemyList.push(new SpreadingShooter(ctx.container, 0.175, 0.01, 8, 240, 0.005, 4));
    }
  },
  {
    name: 'RANDOM SPREADING',
    myShipShapeId: ShapeId.IkBlackMyShip,
    topTime: 0,
    init: (ctx: StageContext) => {
      ctx.enemyList.push(new RandomSpreadingShooter(ctx.container, 0.2, 0.02, 0.02, 30, 240));
    }
  },
  {
    name: 'RANDOM SPREADING 2',
    myShipShapeId: ShapeId.IkBlackMyShip,
    topTime: 0,
    init: (ctx: StageContext) => {
      ctx.enemyList.push(new RandomSpreadingShooter(ctx.container, 0.2, 0.02, 0.02, 60, 240));
    }
  },
  {
    name: 'RANDOM SPREADING 3',
    myShipShapeId: ShapeId.IkBlackMyShip,
    topTime: 0,
    init: (ctx: StageContext) => {
      const s1 = new RandomSpreadingShooter(ctx.container, 0.2, 0.02, 0.02, 30, 240);
      s1.x = -0.6;
      ctx.enemyList.push(s1);
      const s2 = new RandomSpreadingShooter(ctx.container, 0.2, 0.02, 0.02, 30, 240);
      s2.x = 0.6;
      ctx.enemyList.push(s2);
    }
  },
  {
    name: 'OVERTAKING',
    myShipShapeId: ShapeId.IkBlackMyShip,
    topTime: 0,
    init: (ctx: StageContext) => {
      ctx.enemyList.push(new OvertakingShooter(ctx.container, 0.2, 0.01, 7, 240, 0.002, 0, 10, 4));
    }
  },
  {
    name: 'OVERTAKING 2',
    myShipShapeId: ShapeId.IkBlackMyShip,
    topTime: 0,
    init: (ctx: StageContext) => {
      ctx.enemyList.push(new OvertakingShooter(ctx.container, 0.2, 0.01, 7, 240, 0.002, 0.003, 10, 4));
    }
  },
  {
    name: 'OVERTAKING 3',
    myShipShapeId: ShapeId.IkBlackMyShip,
    topTime: 0,
    init: (ctx: StageContext) => {
      ctx.enemyList.push(new OvertakingShooter(ctx.container, 0.2, 0.03, 7, 240, -0.002, 0, 10, 4));
    }
  },
  {
    name: 'COLORED SPIRAL',
    myShipShapeId: ShapeId.IkBlackMyShip,
    topTime: 0,
    init: (ctx: StageContext) => {
      if (ctx.myShip) ctx.myShip.color = 0;
      ctx.enemyList.push(new ColoredSpiralShooter(ctx.container, 0, -0.003, 0.002, 0.02, 8, 3));
    }
  },
  {
    name: 'COLORED RANDOM N-WAY',
    myShipShapeId: ShapeId.IkBlackMyShip,
    topTime: 0,
    init: (ctx: StageContext) => {
      if (ctx.myShip) ctx.myShip.color = 0;
      ctx.enemyList.push(new ColoredRandomNWayShooter(ctx.container, -0.7, -0.6, 0.2, 0.02, 2, 0));
      ctx.enemyList.push(new ColoredRandomNWayShooter(ctx.container, 0.7, -0.6, 0.2, 0.02, 2, 1));
    }
  },
  {
    name: 'COLORED COMBINATION',
    myShipShapeId: ShapeId.IkBlackMyShip,
    topTime: 0,
    init: (ctx: StageContext) => {
      if (ctx.myShip) ctx.myShip.color = 0;
      ctx.enemyList.push(new ColoredCombinationShooter(ctx.container));
    }
  },
];

// Export shooter classes
export { AimingShooter, LineShooter, AimingLineShooter, NWayLineShooter, SpreadingShooter, RandomSpreadingShooter, OvertakingShooter, WinderShooter, ColoredSpiralShooter, ColoredRandomNWayShooter, ColoredCombinationShooter };
