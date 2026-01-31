import { Container } from 'pixi.js';
import { Stage, StageContext, getMyShipAngle, getAngle } from './Stage';
import { ShapeId } from '../data/Shapes';
import { Bullet, shootNWay } from '../entities/Bullet';
import { Enemy } from '../entities/Enemy';
import { rand } from '../Rand';
import { OvertakingShooter } from './IkebukuroStages';
import { NWayShooter } from './PolarStages';

// 심플 호밍 불릿
class SimpleHomingBullet extends Bullet {
  constructor(container: Container, shapeId: ShapeId, x: number, y: number, angle: number, speed: number) {
    super(container, shapeId, x, y, angle, 0, speed, 0);
  }

  moveWithHoming(ctx: StageContext): void {
    this.angle = getMyShipAngle(ctx, this.x, this.y);
    this.move();
  }
}

// 심플 호밍 슈터
class SimpleHomingShooter extends Enemy {
  shotSpeed: number;
  interval: number;
  time: number = 0;

  constructor(container: Container, x: number, y: number, speed: number, interval: number) {
    super(container, ShapeId.ThEnemy, x, y);
    this.shotSpeed = speed;
    this.interval = interval;
  }

  shoot(bulletList: Bullet[], ctx: StageContext): void {
    if (this.time === 0) {
      const bullet = new SimpleHomingBullet(
        this.container,
        ShapeId.ThWhiteBullet,
        this.x, this.y,
        getMyShipAngle(ctx, this.x, this.y),
        this.shotSpeed
      );
      bulletList.push(bullet);
    }
    this.time = (this.time + 1) % this.interval;
  }
}

// 제한된 호밍 불릿
class ConstrainedHomingBullet extends Bullet {
  maxAngleRate: number;

  constructor(container: Container, shapeId: ShapeId, x: number, y: number, angle: number, speed: number, maxAngleRate: number) {
    super(container, shapeId, x, y, angle, 0, speed, 0);
    this.maxAngleRate = maxAngleRate;
  }

  moveWithHoming(ctx: StageContext): void {
    let angleRate = getMyShipAngle(ctx, this.x, this.y) - this.angle;
    angleRate -= Math.floor(angleRate);
    if (angleRate <= this.maxAngleRate || 1 - angleRate <= this.maxAngleRate) {
      this.angle += angleRate;
    } else {
      this.angle += (angleRate < 0.5) ? this.maxAngleRate : -this.maxAngleRate;
    }
    this.angle -= Math.floor(this.angle);
    this.move();
  }
}

// 제한된 호밍 슈터
class ConstrainedHomingShooter extends Enemy {
  shotSpeed: number;
  interval: number;
  maxAngleRate: number;
  time: number = 0;

  constructor(container: Container, x: number, y: number, speed: number, interval: number, maxAngleRate: number) {
    super(container, ShapeId.ThEnemy, x, y);
    this.shotSpeed = speed;
    this.interval = interval;
    this.maxAngleRate = maxAngleRate;
  }

  shoot(bulletList: Bullet[], ctx: StageContext): void {
    if (this.time === 0) {
      const bullet = new ConstrainedHomingBullet(
        this.container,
        ShapeId.ThBlackBullet,
        this.x, this.y,
        getMyShipAngle(ctx, this.x, this.y),
        this.shotSpeed,
        this.maxAngleRate
      );
      bulletList.push(bullet);
    }
    this.time = (this.time + 1) % this.interval;
  }
}

// 불릿 트레일러
class BulletTrailer extends Enemy {
  speed: number;
  maxAngleRate: number;
  interval: number;
  time: number = 0;

  constructor(container: Container, x: number, y: number, speed: number, maxAngleRate: number, interval: number, color: number) {
    super(container, ShapeId.ThEnemy, x, y);
    this.speed = speed;
    this.maxAngleRate = maxAngleRate;
    this.interval = interval;
    this.color = color;
  }

  shoot(bulletList: Bullet[], ctx: StageContext): void {
    if (this.time === 0) {
      const bullet = new Bullet(
        this.container,
        this.color === 0 ? ShapeId.ThBlackBullet : ShapeId.ThWhiteBullet,
        this.x, this.y,
        this.angle, 0, 0, 0
      );
      bullet.color = this.color;
      bulletList.push(bullet);
    }
    this.time = (this.time + 1) % this.interval;

    // 호밍 이동
    let angleRate = getMyShipAngle(ctx, this.x, this.y) - this.angle;
    angleRate -= Math.floor(angleRate);
    if (angleRate <= this.maxAngleRate || 1 - angleRate <= this.maxAngleRate) {
      this.angle += angleRate;
    } else {
      this.angle += (angleRate < 0.5) ? this.maxAngleRate : -this.maxAngleRate;
    }
    this.angle -= Math.floor(this.angle);

    const rad = this.angle * Math.PI * 2;
    this.x += this.speed * Math.cos(rad);
    this.y += this.speed * Math.sin(rad);
  }
}

// 갭 슈터
class GapShooter extends Enemy {
  nway: NWayShooter;

  constructor(container: Container, angleRange: number, speed: number, count: number, interval: number) {
    super(container, ShapeId.ShVoid);
    this.nway = new NWayShooter(container, 0, angleRange, speed, count, interval, 0, 0);
    this.nway.x = 0;
    this.nway.y = -0.2;
  }

  shoot(bulletList: Bullet[]): void {
    this.nway.shotAngle = rand.real2();
    this.nway.shoot(bulletList);
  }
}

// 패턴 슈터
class PatternShooter extends Enemy {
  shotAngle: number;
  shotAngleRange: number;
  shotSpeed: number;
  interval: number;
  pattern: string;
  width: number;
  height: number;
  time: number = 0;

  constructor(
    container: Container,
    angle: number, angleRange: number, speed: number, interval: number,
    pattern: string, width: number, height: number
  ) {
    super(container, ShapeId.PsEnemy);
    this.shotAngle = angle;
    this.shotAngleRange = angleRange;
    this.shotSpeed = speed;
    this.interval = interval;
    this.pattern = pattern;
    this.width = width;
    this.height = height;
  }

  shoot(bulletList: Bullet[]): void {
    if (this.time % this.interval === 0) {
      const row = this.height - 1 - Math.floor(this.time / this.interval);
      if (row >= 0 && row < this.height) {
        for (let i = this.width - 1; i >= 0; i--) {
          const char = this.pattern[row * this.width + i];
          if (char !== ' ') {
            const bullet = new Bullet(
              this.container,
              ShapeId.IkBlackBullet,
              this.x, this.y,
              this.shotAngle + this.shotAngleRange * (i / (this.width - 1) - 0.5),
              0, this.shotSpeed, 0
            );
            bulletList.push(bullet);
          }
        }
      }
    }
    this.time = (this.time + 1) % (this.interval * this.height);
  }
}

// 스테핑 불릿
class SteppingBullet extends Bullet {
  initialSpeed: number;
  moveTime: number;
  stopTime: number;
  stepTime: number = 0;

  constructor(container: Container, x: number, y: number, angle: number, speed: number, moveTime: number, stopTime: number) {
    super(container, ShapeId.ThBlackBullet, x, y, angle, 0, speed, 0);
    this.initialSpeed = speed;
    this.moveTime = moveTime;
    this.stopTime = stopTime;
  }

  override move(): void {
    if (this.stepTime === 0) {
      this.speed = this.initialSpeed;
      this.setShape(ShapeId.ThBlackBullet);
    } else if (this.stepTime === this.moveTime) {
      this.speed = 0;
      this.setShape(ShapeId.ThWhiteBullet);
    }
    this.stepTime = (this.stepTime + 1) % (this.moveTime + this.stopTime);
    super.move();
  }
}

// 스테핑 스파이럴 슈터
class SteppingSpiralShooter extends Enemy {
  shotAngle: number;
  shotAngleRate: number;
  shotSpeed: number;
  moveTime: number;
  stopTime: number;

  constructor(container: Container, angle: number, angleRate: number, speed: number, moveTime: number, stopTime: number) {
    super(container, ShapeId.ThEnemy);
    this.shotAngle = angle;
    this.shotAngleRate = angleRate;
    this.shotSpeed = speed;
    this.moveTime = moveTime;
    this.stopTime = stopTime;
  }

  shoot(bulletList: Bullet[]): void {
    const bullet = new SteppingBullet(
      this.container,
      this.x, this.y,
      this.shotAngle,
      this.shotSpeed,
      this.moveTime,
      this.stopTime
    );
    bulletList.push(bullet);
    this.shotAngle += this.shotAngleRate;
    this.shotAngle -= Math.floor(this.shotAngle);
  }
}

// 다시 조준 불릿
class AimingAgainBullet extends Bullet {
  initialSpeed: number;
  moveTime: number;
  stopTime: number;
  stepTime: number = 0;

  constructor(container: Container, x: number, y: number, speed: number, moveTime: number, stopTime: number, ctx: StageContext) {
    super(container, ShapeId.ThBlackBullet, x, y, getMyShipAngle(ctx, x, y), 0, speed, 0);
    this.initialSpeed = speed;
    this.moveTime = moveTime;
    this.stopTime = stopTime;
  }

  moveWithAiming(ctx: StageContext): void {
    if (this.stepTime === 0) {
      this.angle = getMyShipAngle(ctx, this.x, this.y);
      this.speed = this.initialSpeed;
      this.setShape(ShapeId.ThBlackBullet);
    } else if (this.stepTime === this.moveTime) {
      this.speed = 0;
      this.setShape(ShapeId.ThWhiteBullet);
    }
    this.stepTime = (this.stepTime + 1) % (this.moveTime + this.stopTime);
    this.move();
  }
}

// 다시 조준 슈터
class AimingAgainShooter extends Enemy {
  shotSpeed: number;
  interval: number;
  moveTime: number;
  stopTime: number;
  time: number = 0;

  constructor(container: Container, x: number, y: number, speed: number, interval: number, moveTime: number, stopTime: number) {
    super(container, ShapeId.ThEnemy, x, y);
    this.shotSpeed = speed;
    this.interval = interval;
    this.moveTime = moveTime;
    this.stopTime = stopTime;
  }

  shoot(bulletList: Bullet[], ctx: StageContext): void {
    if (this.time === 0) {
      const bullet = new AimingAgainBullet(
        this.container,
        this.x, this.y,
        this.shotSpeed,
        this.moveTime,
        this.stopTime,
        ctx
      );
      bulletList.push(bullet);
    }
    this.time = (this.time + 1) % this.interval;
  }
}

// 배치 불릿
class PlacedBullet extends Bullet {
  initialSpeed: number;
  moveTime: number;
  stopTime: number;
  stepTime: number = 0;

  constructor(container: Container, shapeId: ShapeId, x: number, y: number, angle: number, speed: number, moveTime: number, stopTime: number) {
    super(container, shapeId, x, y, angle, 0, speed, 0);
    this.initialSpeed = speed;
    this.moveTime = moveTime;
    this.stopTime = stopTime;
  }

  override move(): void {
    if (this.stepTime === this.moveTime) {
      this.speed = 0;
    }
    if (this.stepTime === this.moveTime + this.stopTime) {
      this.speed = this.initialSpeed;
    }
    this.stepTime++;
    super.move();
  }
}

// 스테이지 정의
export const tokyoStages: Stage[] = [
  {
    name: 'SIMPLE HOMING',
    myShipShapeId: ShapeId.ThMyShip,
    topTime: 0,
    init: (ctx: StageContext) => {
      ctx.enemyList.push(new SimpleHomingShooter(ctx.container, 0, -0.4, 0.02, 20));
    }
  },
  {
    name: 'CONSTRAINED HOMING',
    myShipShapeId: ShapeId.ThMyShip,
    topTime: 0,
    init: (ctx: StageContext) => {
      ctx.enemyList.push(new ConstrainedHomingShooter(ctx.container, 0, -0.4, 0.02, 20, 0.005));
    }
  },
  {
    name: 'CONSTRAINED HOMING 2',
    myShipShapeId: ShapeId.ThMyShip,
    topTime: 0,
    init: (ctx: StageContext) => {
      ctx.enemyList.push(new ConstrainedHomingShooter(ctx.container, 0, -0.4, 0.01, 20, 0.005));
    }
  },
  {
    name: 'CONSTRAINED HOMING 3',
    myShipShapeId: ShapeId.ThMyShip,
    topTime: 0,
    init: (ctx: StageContext) => {
      ctx.enemyList.push(new ConstrainedHomingShooter(ctx.container, -0.6, 0, 0.015, 40, 0.005));
      ctx.enemyList.push(new ConstrainedHomingShooter(ctx.container, -0.3, -0.4, 0.015, 40, 0.005));
      ctx.enemyList.push(new ConstrainedHomingShooter(ctx.container, 0.3, -0.4, 0.015, 40, 0.005));
      ctx.enemyList.push(new ConstrainedHomingShooter(ctx.container, 0.6, 0, 0.015, 40, 0.005));
    }
  },
  {
    name: 'BULLET TRAILER',
    myShipShapeId: ShapeId.ThMyShip,
    topTime: 0,
    init: (ctx: StageContext) => {
      ctx.enemyList.push(new BulletTrailer(ctx.container, 0, -0.4, 0.01, 0.005, 5, 0));
    }
  },
  {
    name: 'BULLET TRAILER 2',
    myShipShapeId: ShapeId.IkBlackMyShip,
    topTime: 0,
    init: (ctx: StageContext) => {
      if (ctx.myShip) ctx.myShip.color = 0;
      ctx.enemyList.push(new BulletTrailer(ctx.container, -0.4, -0.4, 0.01, 0.005, 5, 0));
      ctx.enemyList.push(new BulletTrailer(ctx.container, 0.4, -0.4, 0.01, 0.005, 5, 1));
    }
  },
  {
    name: 'EVEN OVERTAKING',
    myShipShapeId: ShapeId.ThMyShip,
    topTime: 0,
    init: (ctx: StageContext) => {
      ctx.enemyList.push(new OvertakingShooter(ctx.container, 0.2, 0.01, 8, 240, 0.002, 0, 10, 4));
    }
  },
  {
    name: 'EVEN OVERTAKING 2',
    myShipShapeId: ShapeId.ThMyShip,
    topTime: 0,
    init: (ctx: StageContext) => {
      for (let i = 0; i < 2; i++) {
        const s = new OvertakingShooter(ctx.container, 0.2, 0.01, 8, 240, 0.002, 0, 10, 4);
        s.x = (i + 1) * 2.0 / 3 - 1;
        ctx.enemyList.push(s);
      }
    }
  },
  {
    name: 'EVEN OVERTAKING 3',
    myShipShapeId: ShapeId.ThMyShip,
    topTime: 0,
    init: (ctx: StageContext) => {
      for (let i = 0; i < 4; i++) {
        const s = new OvertakingShooter(ctx.container, 0.2, 0.01, 8, 240, 0.002, 0, 10, 4);
        s.x = (i + 1) * 2.0 / 5 - 1;
        ctx.enemyList.push(s);
      }
    }
  },
  {
    name: 'EVEN OVERTAKING 4',
    myShipShapeId: ShapeId.ThMyShip,
    topTime: 0,
    init: (ctx: StageContext) => {
      for (let i = 0; i < 8; i++) {
        const s = new OvertakingShooter(ctx.container, 0.2, 0.01, 8, 240, 0.002, 0, 10, 4);
        s.x = (i + 1) * 2.0 / 9 - 1;
        ctx.enemyList.push(s);
      }
    }
  },
  {
    name: 'GAP',
    myShipShapeId: ShapeId.ThMyShip,
    topTime: 0,
    init: (ctx: StageContext) => {
      const shooter = new NWayShooter(ctx.container, 0.75, 0.95, 0.005, 200, 150, 0, 0);
      ctx.enemyList.push(shooter);
    }
  },
  {
    name: 'GAP 2',
    myShipShapeId: ShapeId.ThMyShip,
    topTime: 0,
    init: (ctx: StageContext) => {
      const shooter = new GapShooter(ctx.container, 0.95, 0.005, 200, 150);
      ctx.enemyList.push(shooter);
      ctx.enemyList.push(shooter.nway);
    }
  },
  {
    name: 'GAP 3',
    myShipShapeId: ShapeId.ThMyShip,
    topTime: 0,
    init: (ctx: StageContext) => {
      const shooter = new GapShooter(ctx.container, 0.95, 0.003, 200, 100);
      ctx.enemyList.push(shooter);
      ctx.enemyList.push(shooter.nway);
    }
  },
  {
    name: 'PATTERN',
    myShipShapeId: ShapeId.ThMyShip,
    topTime: 0,
    init: (ctx: StageContext) => {
      const pattern =
        '                                   ' +
        '                                   ' +
        '                                   ' +
        '####  #   # #     #     ##### #####' +
        '#   # #   # #     #     #       #  ' +
        '####  #   # #     #     ####    #  ' +
        '#   # #   # #     #     #       #  ' +
        '####  ##### ##### ##### #####   #  ';
      ctx.enemyList.push(new PatternShooter(ctx.container, 0.25, 0.3, 0.01, 5, pattern, 35, 8));
    }
  },
  {
    name: 'PATTERN 2',
    myShipShapeId: ShapeId.ThMyShip,
    topTime: 0,
    init: (ctx: StageContext) => {
      const pattern =
        '#########   ##################' +
        '#########   ##################' +
        '#########   ##################' +
        '######      ###            ###' +
        '######      ###            ###' +
        '######      ###            ###' +
        '######   ######   ######   ###' +
        '######   ######   ######   ###' +
        '######   ######   ######   ###' +
        '######            ###      ###' +
        '######            ###      ###' +
        '######            ###      ###' +
        '#####################   ######' +
        '#####################   ######' +
        '#####################   ######' +
        '#########               ######' +
        '#########               ######' +
        '#########               ######' +
        '#########   ##################' +
        '#########   ##################' +
        '#########   ##################';
      ctx.enemyList.push(new PatternShooter(ctx.container, 0.25, 0.3, 0.005, 10, pattern, 30, 21));
    }
  },
  {
    name: 'STEPPING',
    myShipShapeId: ShapeId.ThMyShip,
    topTime: 0,
    init: (ctx: StageContext) => {
      ctx.enemyList.push(new SteppingSpiralShooter(ctx.container, 0, 0.03, 0.01, 60, 20));
    }
  },
  {
    name: 'STEPPING 2',
    myShipShapeId: ShapeId.ThMyShip,
    topTime: 0,
    init: (ctx: StageContext) => {
      ctx.enemyList.push(new SteppingSpiralShooter(ctx.container, 0, 0.03, 0.01, 60, 60));
    }
  },
  {
    name: 'AIMING AGAIN',
    myShipShapeId: ShapeId.ThMyShip,
    topTime: 0,
    init: (ctx: StageContext) => {
      ctx.enemyList.push(new AimingAgainShooter(ctx.container, 0, -0.7, 0.02, 40, 60, 20));
    }
  },
  {
    name: 'AIMING AGAIN 2',
    myShipShapeId: ShapeId.ThMyShip,
    topTime: 0,
    init: (ctx: StageContext) => {
      ctx.enemyList.push(new AimingAgainShooter(ctx.container, 0, -0.7, 0.02, 40, 20, 20));
    }
  },
  {
    name: 'AIMING AGAIN 3',
    myShipShapeId: ShapeId.ThMyShip,
    topTime: 0,
    init: (ctx: StageContext) => {
      ctx.enemyList.push(new AimingAgainShooter(ctx.container, -0.6, -0.6, 0.01, 40, 60, 20));
      ctx.enemyList.push(new AimingAgainShooter(ctx.container, -0.3, -0.7, 0.015, 42, 60, 20));
      ctx.enemyList.push(new AimingAgainShooter(ctx.container, 0, -0.8, 0.02, 44, 60, 20));
      ctx.enemyList.push(new AimingAgainShooter(ctx.container, 0.3, -0.7, 0.015, 42, 60, 20));
      ctx.enemyList.push(new AimingAgainShooter(ctx.container, 0.6, -0.6, 0.01, 40, 60, 20));
    }
  },
  {
    name: 'ANY',
    myShipShapeId: ShapeId.ThMyShip,
    topTime: 0,
    init: (ctx: StageContext) => {
      ctx.enemyList.push(new AimingAgainShooter(ctx.container, 0, -0.7, 0.02, 60, 60, 20));
    }
  },
  {
    name: 'ANY 2',
    myShipShapeId: ShapeId.ThMyShip,
    topTime: 0,
    init: (ctx: StageContext) => {
      ctx.enemyList.push(new ConstrainedHomingShooter(ctx.container, 0, -0.4, 0.02, 20, 0.005));
    }
  },
  {
    name: 'SPLITTING',
    myShipShapeId: ShapeId.ThMyShip,
    topTime: 0,
    init: (ctx: StageContext) => {
      // 분리 불릿은 복잡하므로 간단한 조준 슈터로 대체
      ctx.enemyList.push(new AimingAgainShooter(ctx.container, 0, -0.7, 0.01, 60, 30, 20));
    }
  },
  {
    name: 'SPLITTING N-WAY',
    myShipShapeId: ShapeId.ThMyShip,
    topTime: 0,
    init: (ctx: StageContext) => {
      ctx.enemyList.push(new AimingAgainShooter(ctx.container, 0, -0.7, 0.01, 60, 30, 20));
    }
  },
  {
    name: 'PLACED',
    myShipShapeId: ShapeId.ThMyShip,
    topTime: 0,
    init: (ctx: StageContext) => {
      ctx.enemyList.push(new AimingAgainShooter(ctx.container, 0, -0.7, 0.01, 20, 60, 120));
    }
  },
  {
    name: 'SPIRAL PLACED',
    myShipShapeId: ShapeId.ThMyShip,
    topTime: 0,
    init: (ctx: StageContext) => {
      ctx.enemyList.push(new SteppingSpiralShooter(ctx.container, 0, 0.003, 0.01, 60, 20));
    }
  },
  {
    name: 'SPIRAL PLACED 2',
    myShipShapeId: ShapeId.ThMyShip,
    topTime: 0,
    init: (ctx: StageContext) => {
      ctx.enemyList.push(new SteppingSpiralShooter(ctx.container, 0, 0.004, 0.02, 35, 5));
    }
  },
  {
    name: 'SPIRAL PLACED 3',
    myShipShapeId: ShapeId.ThMyShip,
    topTime: 0,
    init: (ctx: StageContext) => {
      ctx.enemyList.push(new SteppingSpiralShooter(ctx.container, 0.1, 0.004, 0.018, 20, 20));
    }
  },
  {
    name: 'STAR PLACED',
    myShipShapeId: ShapeId.ThMyShip,
    topTime: 0,
    init: (ctx: StageContext) => {
      ctx.enemyList.push(new SteppingSpiralShooter(ctx.container, 0, 0.02, 0.01, 60, 30));
    }
  },
  {
    name: 'STAR PLACED 2',
    myShipShapeId: ShapeId.ThMyShip,
    topTime: 0,
    init: (ctx: StageContext) => {
      ctx.enemyList.push(new SteppingSpiralShooter(ctx.container, 0, 0.02, 0.009, 60, 30));
      ctx.enemyList.push(new SteppingSpiralShooter(ctx.container, 0.5, 0.02, 0.015, 60, 30));
    }
  },
  {
    name: 'STAR PLACED TWICE',
    myShipShapeId: ShapeId.ThMyShip,
    topTime: 0,
    init: (ctx: StageContext) => {
      ctx.enemyList.push(new SteppingSpiralShooter(ctx.container, 0, 0.02, 0.01, 60, 30));
    }
  },
  {
    name: 'STAR PLACED TWICE 2',
    myShipShapeId: ShapeId.ThMyShip,
    topTime: 0,
    init: (ctx: StageContext) => {
      ctx.enemyList.push(new SteppingSpiralShooter(ctx.container, 0, 0.02, 0.009, 60, 30));
      ctx.enemyList.push(new SteppingSpiralShooter(ctx.container, 0.5, 0.02, 0.015, 60, 30));
    }
  },
];

// Export classes
export { SimpleHomingBullet, SimpleHomingShooter, ConstrainedHomingBullet, ConstrainedHomingShooter, BulletTrailer, GapShooter, PatternShooter, SteppingBullet, SteppingSpiralShooter, AimingAgainBullet, AimingAgainShooter, PlacedBullet };
