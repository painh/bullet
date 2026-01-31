import { Container } from 'pixi.js';
import { Stage, StageContext, getMyShipAngle } from './Stage';
import { ShapeId } from '../data/Shapes';
import { Bullet, shootNWay } from '../entities/Bullet';
import { Enemy } from '../entities/Enemy';
import { rand } from '../Rand';

// N-Way 슈터
class NWayShooter extends Enemy {
  shotAngle: number;
  shotAngleRange: number;
  shotSpeed: number;
  shotCount: number;
  interval: number;
  time: number = 0;
  bulletAngleRate: number;
  bulletSpeedRate: number;
  ctx: StageContext | null = null;

  constructor(
    container: Container,
    angle: number,
    angleRange: number,
    speed: number,
    count: number,
    interval: number,
    bulletAngleRate: number,
    bulletSpeedRate: number
  ) {
    super(container, ShapeId.PsEnemy);
    this.shotAngle = angle;
    this.shotAngleRange = angleRange;
    this.shotSpeed = speed;
    this.shotCount = count;
    this.interval = interval;
    this.bulletAngleRate = bulletAngleRate;
    this.bulletSpeedRate = bulletSpeedRate;
  }

  shoot(bulletList: Bullet[]): void {
    if (this.time === 0) {
      shootNWay(
        this.container, bulletList,
        ShapeId.PsNeedle,
        this.x, this.y,
        this.shotAngle, this.shotAngleRange,
        this.shotSpeed, this.shotCount,
        this.bulletAngleRate, this.bulletSpeedRate
      );
    }
    this.time = (this.time + 1) % this.interval;
  }
}

// 서클 슈터 (N-Way의 특수 케이스)
class CircleShooter extends NWayShooter {
  constructor(
    container: Container,
    angle: number,
    speed: number,
    count: number,
    interval: number,
    bulletAngleRate: number,
    bulletSpeedRate: number
  ) {
    super(container, angle, 1.0 - 1.0 / count, speed, count, interval, bulletAngleRate, bulletSpeedRate);
  }
}

// 조준 N-Way 슈터
class AimingNWayShooter extends Enemy {
  shotAngleRange: number;
  shotSpeed: number;
  shotCount: number;
  interval: number;
  time: number = 0;
  ctx: StageContext | null = null;

  constructor(
    container: Container,
    angleRange: number,
    speed: number,
    count: number,
    interval: number
  ) {
    super(container, ShapeId.PsEnemy);
    this.shotAngleRange = angleRange;
    this.shotSpeed = speed;
    this.shotCount = count;
    this.interval = interval;
  }

  shoot(bulletList: Bullet[], ctx: StageContext): void {
    if (this.time === 0) {
      shootNWay(
        this.container, bulletList,
        ShapeId.PsNeedle,
        this.x, this.y,
        getMyShipAngle(ctx, this.x, this.y), this.shotAngleRange,
        this.shotSpeed, this.shotCount,
        0, 0
      );
    }
    this.time = (this.time + 1) % this.interval;
  }
}

// 간헐적 조준 N-Way 슈터
class IntermittentAimingNWayShooter extends Enemy {
  shotAngleRange: number;
  shotSpeed: number;
  shotCount: number;
  interval: number;
  shotTime: number;
  waitTime: number;
  time: number = 0;

  constructor(
    container: Container,
    angleRange: number,
    speed: number,
    count: number,
    interval: number,
    shotTime: number,
    waitTime: number
  ) {
    super(container, ShapeId.PsEnemy);
    this.shotAngleRange = angleRange;
    this.shotSpeed = speed;
    this.shotCount = count;
    this.interval = interval;
    this.shotTime = shotTime;
    this.waitTime = waitTime;
  }

  shoot(bulletList: Bullet[], ctx: StageContext): void {
    if (this.time < this.shotTime && this.time % this.interval === 0) {
      shootNWay(
        this.container, bulletList,
        ShapeId.PsNeedle,
        this.x, this.y,
        getMyShipAngle(ctx, this.x, this.y), this.shotAngleRange,
        this.shotSpeed, this.shotCount,
        0, 0
      );
    }
    this.time = (this.time + 1) % (this.shotTime + this.waitTime);
  }
}

// 랜덤 N-Way 슈터
class RandomNWayShooter extends Enemy {
  shotAngle: number;
  shotAngleRange: number;
  shotSpeed: number;
  shotCount: number;
  interval: number;
  time: number = 0;

  constructor(
    container: Container,
    angle: number,
    angleRange: number,
    speed: number,
    count: number,
    interval: number
  ) {
    super(container, ShapeId.PsEnemy);
    this.shotAngle = angle;
    this.shotAngleRange = angleRange;
    this.shotSpeed = speed;
    this.shotCount = count;
    this.interval = interval;
  }

  shoot(bulletList: Bullet[]): void {
    if (this.time === 0) {
      for (let i = 0; i < this.shotCount; i++) {
        const bullet = new Bullet(
          this.container,
          ShapeId.PsNeedle,
          this.x, this.y,
          this.shotAngle + this.shotAngleRange * (rand.real1() - 0.5),
          0, this.shotSpeed, 0
        );
        bulletList.push(bullet);
      }
    }
    this.time = (this.time + 1) % this.interval;
  }
}

// 랜덤 서클 슈터
class RandomCircleShooter extends Enemy {
  shotSpeed: number;
  shotCount: number;
  interval: number;
  time: number = 0;

  constructor(container: Container, speed: number, count: number, interval: number) {
    super(container, ShapeId.PsEnemy);
    this.shotSpeed = speed;
    this.shotCount = count;
    this.interval = interval;
  }

  shoot(bulletList: Bullet[]): void {
    if (this.time === 0) {
      for (let i = 0; i < this.shotCount; i++) {
        const bullet = new Bullet(
          this.container,
          ShapeId.PsNeedle,
          this.x, this.y,
          rand.real2(), 0,
          this.shotSpeed, 0
        );
        bulletList.push(bullet);
      }
    }
    this.time = (this.time + 1) % this.interval;
  }
}

// 롤링 N-Way 슈터
class RollingNWayShooter extends Enemy {
  shotAngle: number;
  shotAngleRange: number;
  shotAngleRate: number;
  shotSpeed: number;
  shotCount: number;
  nwayCount: number;
  interval: number;
  time: number = 0;

  constructor(
    container: Container,
    angle: number,
    angleRange: number,
    angleRate: number,
    speed: number,
    count: number,
    nwayCount: number,
    interval: number
  ) {
    super(container, ShapeId.PsEnemy);
    this.shotAngle = angle;
    this.shotAngleRange = angleRange;
    this.shotAngleRate = angleRate;
    this.shotSpeed = speed;
    this.shotCount = count;
    this.nwayCount = nwayCount;
    this.interval = interval;
  }

  shoot(bulletList: Bullet[]): void {
    if (this.time === 0) {
      for (let i = 0; i < this.nwayCount; i++) {
        shootNWay(
          this.container, bulletList,
          ShapeId.PsNeedle,
          this.x, this.y,
          this.shotAngle + i / this.nwayCount, this.shotAngleRange,
          this.shotSpeed, this.shotCount,
          0, 0
        );
      }
      this.shotAngle += this.shotAngleRate;
      this.shotAngle -= Math.floor(this.shotAngle);
    }
    this.time = (this.time + 1) % this.interval;
  }
}

// 웨이빙 N-Way 슈터
class WavingNWayShooter extends Enemy {
  shotAngle: number;
  shotAngleRange: number;
  wavingAngleRange: number;
  shotSpeed: number;
  shotCount: number;
  interval: number;
  cycle: number;
  time: number = 0;

  constructor(
    container: Container,
    angle: number,
    angleRange: number,
    wavingAngleRange: number,
    speed: number,
    count: number,
    interval: number,
    cycle: number
  ) {
    super(container, ShapeId.PsEnemy);
    this.shotAngle = angle;
    this.shotAngleRange = angleRange;
    this.wavingAngleRange = wavingAngleRange;
    this.shotSpeed = speed;
    this.shotCount = count;
    this.interval = interval;
    this.cycle = cycle;
  }

  shoot(bulletList: Bullet[]): void {
    if (this.time % this.interval === 0) {
      shootNWay(
        this.container, bulletList,
        ShapeId.PsNeedle,
        this.x, this.y,
        this.shotAngle + this.wavingAngleRange * Math.sin(Math.PI * 2 * this.time / this.cycle),
        this.shotAngleRange,
        this.shotSpeed, this.shotCount,
        0, 0
      );
    }
    this.time = (this.time + 1) % this.cycle;
  }
}

// 웨이빙 서클 슈터
class WavingCircleShooter extends WavingNWayShooter {
  constructor(
    container: Container,
    angle: number,
    wavingAngleRange: number,
    speed: number,
    count: number,
    interval: number,
    cycle: number
  ) {
    super(container, angle, 1.0 - 1.0 / count, wavingAngleRange, speed, count, interval, cycle);
  }
}

// 스테이지 정의
export const polarStages: Stage[] = [
  {
    name: 'N-WAY',
    myShipShapeId: ShapeId.PsMyShip,
    topTime: 0,
    init: (ctx: StageContext) => {
      const shooter = new NWayShooter(ctx.container, 0.25, 0.2, 0.02, 7, 5, 0, 0);
      ctx.enemyList.push(shooter);
    }
  },
  {
    name: 'N-WAY 2',
    myShipShapeId: ShapeId.PsMyShip,
    topTime: 0,
    init: (ctx: StageContext) => {
      const shooter = new NWayShooter(ctx.container, 0.25, 0.2, 0.02, 8, 5, 0, 0);
      ctx.enemyList.push(shooter);
    }
  },
  {
    name: 'N-WAY 3',
    myShipShapeId: ShapeId.PsMyShip,
    topTime: 0,
    init: (ctx: StageContext) => {
      const shooter = new NWayShooter(ctx.container, 0.25, 1, 0.02, 8, 5, 0, 0);
      ctx.enemyList.push(shooter);
    }
  },
  {
    name: 'CIRCLE',
    myShipShapeId: ShapeId.PsMyShip,
    topTime: 0,
    init: (ctx: StageContext) => {
      const shooter = new CircleShooter(ctx.container, 0.25, 0.02, 8, 5, 0, 0);
      ctx.enemyList.push(shooter);
    }
  },
  {
    name: 'CIRCLE 2',
    myShipShapeId: ShapeId.PsMyShip,
    topTime: 0,
    init: (ctx: StageContext) => {
      const shooter = new CircleShooter(ctx.container, 0.25, 0.02, 32, 5, 0, 0);
      ctx.enemyList.push(shooter);
    }
  },
  {
    name: 'CIRCLE 3',
    myShipShapeId: ShapeId.PsMyShip,
    topTime: 0,
    init: (ctx: StageContext) => {
      const shooter = new CircleShooter(ctx.container, 0.234375, 0.02, 32, 5, 0, 0);
      ctx.enemyList.push(shooter);
    }
  },
  {
    name: 'BENT CIRCLE',
    myShipShapeId: ShapeId.PsMyShip,
    topTime: 0,
    init: (ctx: StageContext) => {
      const shooter = new CircleShooter(ctx.container, 0.25, 0.02, 32, 5, 0.002, 0);
      ctx.enemyList.push(shooter);
    }
  },
  {
    name: 'BENT CIRCLE 2',
    myShipShapeId: ShapeId.PsMyShip,
    topTime: 0,
    init: (ctx: StageContext) => {
      const shooter = new CircleShooter(ctx.container, 0.25, 0, 32, 5, 0, 0.0005);
      ctx.enemyList.push(shooter);
    }
  },
  {
    name: 'BENT CIRCLE 3',
    myShipShapeId: ShapeId.PsMyShip,
    topTime: 0,
    init: (ctx: StageContext) => {
      const shooter = new CircleShooter(ctx.container, 0.25, 0, 32, 5, 0.002, 0.0005);
      ctx.enemyList.push(shooter);
    }
  },
  {
    name: 'DENSE N-WAY',
    myShipShapeId: ShapeId.PsMyShip,
    topTime: 0,
    init: (ctx: StageContext) => {
      const shooter = new NWayShooter(ctx.container, 0.25, 0.5, 0.02, 16, 5, 0, 0);
      ctx.enemyList.push(shooter);
    }
  },
  {
    name: 'DENSE N-WAY 2',
    myShipShapeId: ShapeId.PsMyShip,
    topTime: 0,
    init: (ctx: StageContext) => {
      const shooter = new NWayShooter(ctx.container, 0.25, 0.5, 0.02, 32, 5, 0, 0);
      ctx.enemyList.push(shooter);
    }
  },
  {
    name: 'DENSE N-WAY 3',
    myShipShapeId: ShapeId.PsMyShip,
    topTime: 0,
    init: (ctx: StageContext) => {
      const shooter = new NWayShooter(ctx.container, 0.25, 0.5, 0.02, 64, 5, 0, 0);
      ctx.enemyList.push(shooter);
    }
  },
  {
    name: 'DENSE N-WAY 4',
    myShipShapeId: ShapeId.PsMyShip,
    topTime: 0,
    init: (ctx: StageContext) => {
      const shooter = new NWayShooter(ctx.container, 0.25, 0.5, 0.02, 128, 5, 0, 0);
      ctx.enemyList.push(shooter);
    }
  },
  {
    name: 'DENSE N-WAY 5',
    myShipShapeId: ShapeId.PsMyShip,
    topTime: 0,
    init: (ctx: StageContext) => {
      const shooter = new NWayShooter(ctx.container, 0.25, 0.5, 0.02, 256, 5, 0, 0);
      ctx.enemyList.push(shooter);
    }
  },
  {
    name: 'AIMING N-WAY',
    myShipShapeId: ShapeId.PsMyShip,
    topTime: 0,
    init: (ctx: StageContext) => {
      const shooter = new AimingNWayShooter(ctx.container, 0.25, 0.02, 9, 10);
      shooter.ctx = ctx;
      ctx.enemyList.push(shooter);
    }
  },
  {
    name: 'AIMING N-WAY 2',
    myShipShapeId: ShapeId.PsMyShip,
    topTime: 0,
    init: (ctx: StageContext) => {
      const shooter = new AimingNWayShooter(ctx.container, 0.25, 0.02, 10, 10);
      shooter.ctx = ctx;
      ctx.enemyList.push(shooter);
    }
  },
  {
    name: 'AIMING N-WAY 3',
    myShipShapeId: ShapeId.PsMyShip,
    topTime: 0,
    init: (ctx: StageContext) => {
      const shooter = new AimingNWayShooter(ctx.container, 0.25, 0.04, 9, 2);
      shooter.y = -0.2;
      shooter.ctx = ctx;
      ctx.enemyList.push(shooter);
    }
  },
  {
    name: 'INTERMITTENT AIMING N-WAY',
    myShipShapeId: ShapeId.PsMyShip,
    topTime: 0,
    init: (ctx: StageContext) => {
      const shooter = new IntermittentAimingNWayShooter(ctx.container, 0.25, 0.04, 9, 2, 60, 20);
      ctx.enemyList.push(shooter);
    }
  },
  {
    name: 'RANDOM N-WAY',
    myShipShapeId: ShapeId.PsMyShip,
    topTime: 0,
    init: (ctx: StageContext) => {
      const shooter = new RandomNWayShooter(ctx.container, 0.25, 0.2, 0.02, 1, 1);
      ctx.enemyList.push(shooter);
    }
  },
  {
    name: 'RANDOM N-WAY 2',
    myShipShapeId: ShapeId.PsMyShip,
    topTime: 0,
    init: (ctx: StageContext) => {
      const shooter = new RandomNWayShooter(ctx.container, 0.25, 0.2, 0.02, 10, 10);
      ctx.enemyList.push(shooter);
    }
  },
  {
    name: 'RANDOM N-WAY 3',
    myShipShapeId: ShapeId.PsMyShip,
    topTime: 0,
    init: (ctx: StageContext) => {
      const shooter = new RandomNWayShooter(ctx.container, 0.25, 0.2, 0.02, 3, 1);
      ctx.enemyList.push(shooter);
    }
  },
  {
    name: 'RANDOM N-WAY 4',
    myShipShapeId: ShapeId.PsMyShip,
    topTime: 0,
    init: (ctx: StageContext) => {
      const shooter = new RandomNWayShooter(ctx.container, 0.25, 0.2, 0.02, 1, 3);
      ctx.enemyList.push(shooter);
    }
  },
  {
    name: 'RANDOM CIRCLE',
    myShipShapeId: ShapeId.PsMyShip,
    topTime: 0,
    init: (ctx: StageContext) => {
      const shooter = new RandomCircleShooter(ctx.container, 0.02, 3, 1);
      ctx.enemyList.push(shooter);
    }
  },
  {
    name: 'ROLLING N-WAY',
    myShipShapeId: ShapeId.PsMyShip,
    topTime: 0,
    init: (ctx: StageContext) => {
      const shooter = new RollingNWayShooter(ctx.container, 0.25, 0.2, 0.01, 0.02, 5, 1, 5);
      ctx.enemyList.push(shooter);
    }
  },
  {
    name: 'ROLLING N-WAY2',
    myShipShapeId: ShapeId.PsMyShip,
    topTime: 0,
    init: (ctx: StageContext) => {
      const shooter = new RollingNWayShooter(ctx.container, 0.25, 0.2, 0.01, 0.02, 5, 3, 5);
      ctx.enemyList.push(shooter);
    }
  },
  {
    name: 'ROLLING N-WAY3',
    myShipShapeId: ShapeId.PsMyShip,
    topTime: 0,
    init: (ctx: StageContext) => {
      const shooter = new RollingNWayShooter(ctx.container, 0.25, 0.9375, 0.01, 0.02, 16, 1, 5);
      ctx.enemyList.push(shooter);
    }
  },
  {
    name: 'ROLLING N-WAY4',
    myShipShapeId: ShapeId.PsMyShip,
    topTime: 0,
    init: (ctx: StageContext) => {
      const shooter = new RollingNWayShooter(ctx.container, 0.125, 0.2, 0.01, 0.02, 10, 4, 5);
      shooter.y = -0.3;
      ctx.enemyList.push(shooter);
    }
  },
  {
    name: 'WAVING N-WAY',
    myShipShapeId: ShapeId.PsMyShip,
    topTime: 0,
    init: (ctx: StageContext) => {
      const shooter = new WavingNWayShooter(ctx.container, 0.25, 0.2, 0.05, 0.02, 5, 5, 120);
      ctx.enemyList.push(shooter);
    }
  },
  {
    name: 'WAVING N-WAY 2',
    myShipShapeId: ShapeId.PsMyShip,
    topTime: 0,
    init: (ctx: StageContext) => {
      const shooter = new WavingNWayShooter(ctx.container, 0.25, 0.2, 0.05, 0.02, 5, 1, 120);
      ctx.enemyList.push(shooter);
    }
  },
  {
    name: 'WAVING CIRCLE',
    myShipShapeId: ShapeId.PsMyShip,
    topTime: 0,
    init: (ctx: StageContext) => {
      const shooter = new WavingCircleShooter(ctx.container, 0.25, 0.1, 0.02, 8, 1, 120);
      ctx.enemyList.push(shooter);
    }
  },
];

// Export shooter classes
export { NWayShooter, CircleShooter, AimingNWayShooter, IntermittentAimingNWayShooter, RandomNWayShooter, RandomCircleShooter, RollingNWayShooter, WavingNWayShooter, WavingCircleShooter };
