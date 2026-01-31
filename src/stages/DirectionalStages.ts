import { Container } from 'pixi.js';
import { Stage, StageContext } from './Stage';
import { ShapeId } from '../data/Shapes';
import { Bullet, shootNWay } from '../entities/Bullet';
import { Enemy } from '../entities/Enemy';

// 방향성 슈터 (매 프레임 일정 방향으로 발사)
class DirectionalShooter extends Enemy {
  shotAngle: number;
  shotSpeed: number;

  constructor(container: Container, angle: number, speed: number) {
    super(container, ShapeId.DpEnemy);
    this.shotAngle = angle;
    this.shotSpeed = speed;
  }

  shoot(bulletList: Bullet[]): void {
    const bullet = new Bullet(
      this.container,
      ShapeId.DpRedBullet,
      this.x, this.y,
      this.shotAngle, 0,
      this.shotSpeed, 0
    );
    bulletList.push(bullet);
  }
}

// 스파이럴 슈터
class SpiralShooter extends Enemy {
  shotAngle: number;
  shotAngleRate: number;
  shotSpeed: number;

  constructor(container: Container, angle: number, angleRate: number, speed: number) {
    super(container, ShapeId.DpEnemy);
    this.shotAngle = angle;
    this.shotAngleRate = angleRate;
    this.shotSpeed = speed;
  }

  shoot(bulletList: Bullet[]): void {
    const bullet = new Bullet(
      this.container,
      ShapeId.DpRedBullet,
      this.x, this.y,
      this.shotAngle, 0,
      this.shotSpeed, 0
    );
    bulletList.push(bullet);
    this.shotAngle += this.shotAngleRate;
    this.shotAngle -= Math.floor(this.shotAngle);
  }
}

// 멀티플 스파이럴 슈터
class MultipleSpiralShooter extends Enemy {
  shotAngle: number;
  shotAngleRate: number;
  shotSpeed: number;
  shotCount: number;

  constructor(container: Container, angle: number, angleRate: number, speed: number, count: number) {
    super(container, ShapeId.DpEnemy);
    this.shotAngle = angle;
    this.shotAngleRate = angleRate;
    this.shotSpeed = speed;
    this.shotCount = count;
  }

  shoot(bulletList: Bullet[]): void {
    for (let i = 0; i < this.shotCount; i++) {
      const bullet = new Bullet(
        this.container,
        ShapeId.DpRedBullet,
        this.x, this.y,
        this.shotAngle + i / this.shotCount, 0,
        this.shotSpeed, 0
      );
      bulletList.push(bullet);
    }
    this.shotAngle += this.shotAngleRate;
    this.shotAngle -= Math.floor(this.shotAngle);
  }
}

// 간격 멀티플 스파이럴 슈터
class IntervalMultipleSpiralShooter extends Enemy {
  shotAngle: number;
  shotAngleRate: number;
  shotSpeed: number;
  shotCount: number;
  interval: number;
  time: number = 0;

  constructor(container: Container, angle: number, angleRate: number, speed: number, count: number, interval: number) {
    super(container, ShapeId.DpEnemy);
    this.shotAngle = angle;
    this.shotAngleRate = angleRate;
    this.shotSpeed = speed;
    this.shotCount = count;
    this.interval = interval;
  }

  shoot(bulletList: Bullet[]): void {
    if (this.time === 0) {
      for (let i = 0; i < this.shotCount; i++) {
        const bullet = new Bullet(
          this.container,
          ShapeId.DpRedBullet,
          this.x, this.y,
          this.shotAngle + i / this.shotCount, 0,
          this.shotSpeed, 0
        );
        bulletList.push(bullet);
      }
      this.shotAngle += this.shotAngleRate;
      this.shotAngle -= Math.floor(this.shotAngle);
    }
    this.time = (this.time + 1) % this.interval;
  }
}

// 양방향 스파이럴 슈터
class BiDirectionalSpiralShooter extends Enemy {
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
    super(container, ShapeId.DpEnemy);
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
            ShapeId.DpRedBullet,
            this.x, this.y,
            this.shotAngle[j] + i / this.shotCount, 0,
            this.shotSpeed, 0
          );
          bulletList.push(bullet);
        }
        this.shotAngle[j] += this.shotAngleRate[j];
        this.shotAngle[j] -= Math.floor(this.shotAngle[j]);
      }
    }
    this.time = (this.time + 1) % this.interval;
  }
}

// 구부러진 스파이럴 슈터
class BentSpiralShooter extends Enemy {
  shotAngle: number;
  shotAngleRate: number;
  shotSpeed: number;
  shotCount: number;
  interval: number;
  time: number = 0;
  bulletAngleRate: number;
  bulletSpeedRate: number;

  constructor(
    container: Container,
    angle: number,
    angleRate: number,
    speed: number,
    count: number,
    interval: number,
    bulletAngleRate: number,
    bulletSpeedRate: number
  ) {
    super(container, ShapeId.DpEnemy);
    this.shotAngle = angle;
    this.shotAngleRate = angleRate;
    this.shotSpeed = speed;
    this.shotCount = count;
    this.interval = interval;
    this.bulletAngleRate = bulletAngleRate;
    this.bulletSpeedRate = bulletSpeedRate;
  }

  shoot(bulletList: Bullet[]): void {
    if (this.time === 0) {
      for (let i = 0; i < this.shotCount; i++) {
        const bullet = new Bullet(
          this.container,
          ShapeId.DpBlueBullet,
          this.x, this.y,
          this.shotAngle + i / this.shotCount,
          this.bulletAngleRate,
          this.shotSpeed,
          this.bulletSpeedRate
        );
        bulletList.push(bullet);
      }
      this.shotAngle += this.shotAngleRate;
      this.shotAngle -= Math.floor(this.shotAngle);
    }
    this.time = (this.time + 1) % this.interval;
  }
}

// 와셔 스파이럴 슈터 (조합)
class WasherSpiralShooter extends Enemy {
  biDirectional: BiDirectionalSpiralShooter;
  bent: BentSpiralShooter;
  maxShotAngleRate: number;
  maxBulletAngleRate: number;
  time: number = 0;

  constructor(container: Container) {
    super(container, ShapeId.DpEnemy);
    this.maxShotAngleRate = 0.02;
    this.maxBulletAngleRate = 0.003;

    this.biDirectional = new BiDirectionalSpiralShooter(container, 0, 0.015, -0.01, 0.02, 4, 5);
    this.biDirectional.setShape(ShapeId.ShVoid);

    this.bent = new BentSpiralShooter(container, 0, 0, 0, 10, 10, 0, 0.0002);
    this.bent.setShape(ShapeId.ShVoid);
  }

  shoot(bulletList: Bullet[]): void {
    if (this.time < 250) {
      this.bent.shotAngleRate = this.maxShotAngleRate;
      this.bent.bulletAngleRate = -this.maxBulletAngleRate;
    } else if (this.time < 300) {
      this.bent.shotAngleRate = this.maxShotAngleRate * (275 - this.time) / 25;
      this.bent.bulletAngleRate = -this.maxBulletAngleRate * (275 - this.time) / 25;
    } else if (this.time < 550) {
      this.bent.shotAngleRate = -this.maxShotAngleRate;
      this.bent.bulletAngleRate = this.maxBulletAngleRate;
    } else {
      this.bent.shotAngleRate = -this.maxShotAngleRate * (575 - this.time) / 25;
      this.bent.bulletAngleRate = this.maxBulletAngleRate * (575 - this.time) / 25;
    }
    this.time = (this.time + 1) % 600;

    this.biDirectional.shoot(bulletList);
    this.bent.shoot(bulletList);
  }
}

// 스테이지 정의
export const directionalStages: Stage[] = [
  {
    name: 'DIRECTIONAL',
    myShipShapeId: ShapeId.DpMyShip,
    topTime: 0,
    init: (ctx: StageContext) => {
      const shooter = new DirectionalShooter(ctx.container, 0.25, 0.1);
      ctx.enemyList.push(shooter);
    }
  },
  {
    name: 'DIRECTIONAL 2',
    myShipShapeId: ShapeId.DpMyShip,
    topTime: 0,
    init: (ctx: StageContext) => {
      const shooter = new DirectionalShooter(ctx.container, 0.5, 0.1);
      ctx.enemyList.push(shooter);
    }
  },
  {
    name: 'DIRECTIONAL 3',
    myShipShapeId: ShapeId.DpMyShip,
    topTime: 0,
    init: (ctx: StageContext) => {
      const shooter = new DirectionalShooter(ctx.container, 0.375, 0.1);
      ctx.enemyList.push(shooter);
    }
  },
  {
    name: 'SPIRAL',
    myShipShapeId: ShapeId.DpMyShip,
    topTime: 0,
    init: (ctx: StageContext) => {
      const shooter = new SpiralShooter(ctx.container, 0, 0.02, 0.01);
      ctx.enemyList.push(shooter);
    }
  },
  {
    name: 'SPIRAL 2',
    myShipShapeId: ShapeId.DpMyShip,
    topTime: 0,
    init: (ctx: StageContext) => {
      const shooter = new SpiralShooter(ctx.container, 0, 0.01, 0.01);
      ctx.enemyList.push(shooter);
    }
  },
  {
    name: 'SPIRAL 3',
    myShipShapeId: ShapeId.DpMyShip,
    topTime: 0,
    init: (ctx: StageContext) => {
      const shooter = new SpiralShooter(ctx.container, 0, 0.03, 0.01);
      ctx.enemyList.push(shooter);
    }
  },
  {
    name: 'SPIRAL 4',
    myShipShapeId: ShapeId.DpMyShip,
    topTime: 0,
    init: (ctx: StageContext) => {
      const shooter = new SpiralShooter(ctx.container, 0, 0.02, 0.005);
      ctx.enemyList.push(shooter);
    }
  },
  {
    name: 'SPIRAL 5',
    myShipShapeId: ShapeId.DpMyShip,
    topTime: 0,
    init: (ctx: StageContext) => {
      const shooter = new SpiralShooter(ctx.container, 0, 0.02, 0.02);
      ctx.enemyList.push(shooter);
    }
  },
  {
    name: 'MULTIPLE SPIRAL',
    myShipShapeId: ShapeId.DpMyShip,
    topTime: 0,
    init: (ctx: StageContext) => {
      const shooter = new MultipleSpiralShooter(ctx.container, 0, 0.02, 0.01, 4);
      ctx.enemyList.push(shooter);
    }
  },
  {
    name: 'INTERVAL MULTIPLE SPIRAL',
    myShipShapeId: ShapeId.DpMyShip,
    topTime: 0,
    init: (ctx: StageContext) => {
      const shooter = new IntervalMultipleSpiralShooter(ctx.container, 0, 0.02, 0.01, 4, 5);
      ctx.enemyList.push(shooter);
    }
  },
  {
    name: 'INTERVAL MULTIPLE SPIRAL 2',
    myShipShapeId: ShapeId.DpMyShip,
    topTime: 0,
    init: (ctx: StageContext) => {
      const shooter = new IntervalMultipleSpiralShooter(ctx.container, 0, -0.02, 0.01, 4, 5);
      ctx.enemyList.push(shooter);
    }
  },
  {
    name: 'BI-DIRECTIONAL SPIRAL',
    myShipShapeId: ShapeId.DpMyShip,
    topTime: 0,
    init: (ctx: StageContext) => {
      const shooter = new BiDirectionalSpiralShooter(ctx.container, 0, 0.02, -0.02, 0.01, 4, 5);
      ctx.enemyList.push(shooter);
    }
  },
  {
    name: 'BI-DIRECTIONAL SPIRAL 2',
    myShipShapeId: ShapeId.DpMyShip,
    topTime: 0,
    init: (ctx: StageContext) => {
      const shooter = new BiDirectionalSpiralShooter(ctx.container, 0, 0.03, -0.02, 0.01, 4, 5);
      ctx.enemyList.push(shooter);
    }
  },
  {
    name: 'BI-DIRECTIONAL SPIRAL 3',
    myShipShapeId: ShapeId.DpMyShip,
    topTime: 0,
    init: (ctx: StageContext) => {
      const shooter = new BiDirectionalSpiralShooter(ctx.container, 0, 0.03, -0.02, 0.02, 4, 5);
      ctx.enemyList.push(shooter);
    }
  },
  {
    name: 'BI-DIRECTIONAL SPIRAL 4',
    myShipShapeId: ShapeId.DpMyShip,
    topTime: 0,
    init: (ctx: StageContext) => {
      const shooter = new BiDirectionalSpiralShooter(ctx.container, 0, 0.015, -0.01, 0.02, 4, 5);
      ctx.enemyList.push(shooter);
    }
  },
  {
    name: 'BENT SPIRAL',
    myShipShapeId: ShapeId.DpMyShip,
    topTime: 0,
    init: (ctx: StageContext) => {
      const shooter = new BentSpiralShooter(ctx.container, 0, 0.02, 0.005, 1, 10, 0, 0);
      ctx.enemyList.push(shooter);
    }
  },
  {
    name: 'BENT SPIRAL 2',
    myShipShapeId: ShapeId.DpMyShip,
    topTime: 0,
    init: (ctx: StageContext) => {
      const shooter = new BentSpiralShooter(ctx.container, 0, 0.02, 0.005, 1, 10, -0.003, 0);
      ctx.enemyList.push(shooter);
    }
  },
  {
    name: 'BENT SPIRAL 3',
    myShipShapeId: ShapeId.DpMyShip,
    topTime: 0,
    init: (ctx: StageContext) => {
      const shooter = new BentSpiralShooter(ctx.container, 0, 0.02, 0.005, 1, 10, 0, 0.0002);
      ctx.enemyList.push(shooter);
    }
  },
  {
    name: 'BENT SPIRAL 4',
    myShipShapeId: ShapeId.DpMyShip,
    topTime: 0,
    init: (ctx: StageContext) => {
      const shooter = new BentSpiralShooter(ctx.container, 0, 0.02, 0.005, 1, 10, -0.003, 0.0002);
      ctx.enemyList.push(shooter);
    }
  },
  {
    name: 'COMBINED SPIRAL',
    myShipShapeId: ShapeId.DpMyShip,
    topTime: 0,
    init: (ctx: StageContext) => {
      const biDir = new BiDirectionalSpiralShooter(ctx.container, 0, 0.015, -0.01, 0.02, 4, 5);
      biDir.setShape(ShapeId.ShVoid);
      ctx.enemyList.push(biDir);

      const bent = new BentSpiralShooter(ctx.container, 0, 0.02, 0, 10, 10, -0.003, 0.0002);
      bent.setShape(ShapeId.ShVoid);
      ctx.enemyList.push(bent);

      // 메인 적 표시용
      const main = new Enemy(ctx.container, ShapeId.DpEnemy);
      ctx.enemyList.push(main);
    }
  },
  {
    name: 'WASHER SPIRAL',
    myShipShapeId: ShapeId.DpMyShip,
    topTime: 0,
    init: (ctx: StageContext) => {
      const shooter = new WasherSpiralShooter(ctx.container);
      ctx.enemyList.push(shooter);
      ctx.enemyList.push(shooter.biDirectional);
      ctx.enemyList.push(shooter.bent);
    }
  },
  {
    name: 'EASY WASHER SPIRAL',
    myShipShapeId: ShapeId.DpMyShip,
    topTime: 0,
    init: (ctx: StageContext) => {
      const shooter = new WasherSpiralShooter(ctx.container);
      shooter.biDirectional.shotSpeed = 0.01;
      shooter.bent.bulletSpeedRate = 0.0001;
      ctx.enemyList.push(shooter);
      ctx.enemyList.push(shooter.biDirectional);
      ctx.enemyList.push(shooter.bent);
    }
  },
  {
    name: 'EASY WASHER SPIRAL 2',
    myShipShapeId: ShapeId.DpMyShip,
    topTime: 0,
    init: (ctx: StageContext) => {
      const shooter = new WasherSpiralShooter(ctx.container);
      shooter.biDirectional.shotSpeed = 0.01;
      shooter.bent.bulletSpeedRate = 0.0001;
      shooter.biDirectional.interval = 10;
      shooter.bent.interval = 20;
      ctx.enemyList.push(shooter);
      ctx.enemyList.push(shooter.biDirectional);
      ctx.enemyList.push(shooter.bent);
    }
  },
  {
    name: 'EASY WASHER SPIRAL 3',
    myShipShapeId: ShapeId.DpMyShip,
    topTime: 0,
    init: (ctx: StageContext) => {
      const shooter = new WasherSpiralShooter(ctx.container);
      shooter.biDirectional.shotSpeed = 0.01;
      shooter.bent.bulletSpeedRate = 0.0001;
      shooter.biDirectional.interval = 10;
      shooter.bent.interval = 20;
      shooter.maxShotAngleRate = 0.01;
      shooter.maxBulletAngleRate = 0.0015;
      ctx.enemyList.push(shooter);
      ctx.enemyList.push(shooter.biDirectional);
      ctx.enemyList.push(shooter.bent);
    }
  },
  {
    name: 'EASY WASHER SPIRAL 4',
    myShipShapeId: ShapeId.DpMyShip,
    topTime: 0,
    init: (ctx: StageContext) => {
      const shooter = new WasherSpiralShooter(ctx.container);
      shooter.biDirectional.shotSpeed = 0.01;
      shooter.bent.bulletSpeedRate = 0.0001;
      shooter.biDirectional.interval = 10;
      shooter.bent.interval = 20;
      shooter.maxShotAngleRate = 0.0014;
      shooter.maxBulletAngleRate = 0.0021;
      ctx.enemyList.push(shooter);
      ctx.enemyList.push(shooter.biDirectional);
      ctx.enemyList.push(shooter.bent);
    }
  },
  {
    name: 'HARD WASHER SPIRAL',
    myShipShapeId: ShapeId.DpMyShip,
    topTime: 0,
    init: (ctx: StageContext) => {
      const shooter = new WasherSpiralShooter(ctx.container);
      shooter.biDirectional.shotSpeed = 0.04;
      shooter.bent.bulletSpeedRate = 0.0004;
      shooter.biDirectional.interval = 3;
      shooter.bent.interval = 5;
      shooter.maxShotAngleRate = 0.028;
      shooter.maxBulletAngleRate = 0.0042;
      ctx.enemyList.push(shooter);
      ctx.enemyList.push(shooter.biDirectional);
      ctx.enemyList.push(shooter.bent);
    }
  },
  {
    name: 'RANKED WASHER SPIRAL',
    myShipShapeId: ShapeId.DpMyShip,
    topTime: 0,
    init: (ctx: StageContext) => {
      const rank = 1;
      const shooter = new WasherSpiralShooter(ctx.container);
      shooter.biDirectional.shotSpeed *= rank;
      shooter.bent.bulletSpeedRate *= rank;
      shooter.biDirectional.interval = Math.max(1, Math.round(shooter.biDirectional.interval / rank));
      shooter.bent.interval = Math.max(1, Math.round(shooter.bent.interval / rank));
      shooter.maxShotAngleRate *= Math.sqrt(rank);
      shooter.maxBulletAngleRate *= Math.sqrt(rank);
      ctx.enemyList.push(shooter);
      ctx.enemyList.push(shooter.biDirectional);
      ctx.enemyList.push(shooter.bent);
    }
  },
  {
    name: 'RANKED WASHER SPIRAL 2',
    myShipShapeId: ShapeId.DpMyShip,
    topTime: 0,
    init: (ctx: StageContext) => {
      const rank = 0.5;
      const shooter = new WasherSpiralShooter(ctx.container);
      shooter.biDirectional.shotSpeed *= rank;
      shooter.bent.bulletSpeedRate *= rank;
      shooter.biDirectional.interval = Math.max(1, Math.round(shooter.biDirectional.interval / rank));
      shooter.bent.interval = Math.max(1, Math.round(shooter.bent.interval / rank));
      shooter.maxShotAngleRate *= Math.sqrt(rank);
      shooter.maxBulletAngleRate *= Math.sqrt(rank);
      ctx.enemyList.push(shooter);
      ctx.enemyList.push(shooter.biDirectional);
      ctx.enemyList.push(shooter.bent);
    }
  },
  {
    name: 'RANKED WASHER SPIRAL 3',
    myShipShapeId: ShapeId.DpMyShip,
    topTime: 0,
    init: (ctx: StageContext) => {
      const rank = 2;
      const shooter = new WasherSpiralShooter(ctx.container);
      shooter.biDirectional.shotSpeed *= rank;
      shooter.bent.bulletSpeedRate *= rank;
      shooter.biDirectional.interval = Math.max(1, Math.round(shooter.biDirectional.interval / rank));
      shooter.bent.interval = Math.max(1, Math.round(shooter.bent.interval / rank));
      shooter.maxShotAngleRate *= Math.sqrt(rank);
      shooter.maxBulletAngleRate *= Math.sqrt(rank);
      ctx.enemyList.push(shooter);
      ctx.enemyList.push(shooter.biDirectional);
      ctx.enemyList.push(shooter.bent);
    }
  },
  {
    name: 'RANKED WASHER SPIRAL 4',
    myShipShapeId: ShapeId.DpMyShip,
    topTime: 0,
    init: (ctx: StageContext) => {
      const rank = 3;
      const shooter = new WasherSpiralShooter(ctx.container);
      shooter.biDirectional.shotSpeed *= rank;
      shooter.bent.bulletSpeedRate *= rank;
      shooter.biDirectional.interval = Math.max(1, Math.round(shooter.biDirectional.interval / rank));
      shooter.bent.interval = Math.max(1, Math.round(shooter.bent.interval / rank));
      shooter.maxShotAngleRate *= Math.sqrt(rank);
      shooter.maxBulletAngleRate *= Math.sqrt(rank);
      ctx.enemyList.push(shooter);
      ctx.enemyList.push(shooter.biDirectional);
      ctx.enemyList.push(shooter.bent);
    }
  },
];

// Export shooter classes for use in other stages
export { DirectionalShooter, SpiralShooter, MultipleSpiralShooter, IntervalMultipleSpiralShooter, BiDirectionalSpiralShooter, BentSpiralShooter, WasherSpiralShooter };
