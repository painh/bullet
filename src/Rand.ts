// 난수 생성기 (Mersenne Twister 대신 간단한 구현)
export class Rand {
  private seed: number;

  constructor(seed: number = Date.now()) {
    this.seed = seed;
  }

  // 0 이상 1 미만의 난수
  real2(): number {
    this.seed = (this.seed * 1103515245 + 12345) & 0x7fffffff;
    return this.seed / 0x7fffffff;
  }

  // -1 이상 1 이하의 난수
  real1(): number {
    return this.real2() * 2 - 1;
  }

  // 정수 난수
  int(max: number): number {
    return Math.floor(this.real2() * max);
  }
}

export const rand = new Rand();
