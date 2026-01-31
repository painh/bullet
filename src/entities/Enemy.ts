import { Container } from 'pixi.js';
import { Mover } from './Mover';
import { ShapeId } from '../data/Shapes';

export class Enemy extends Mover {
  constructor(
    container: Container,
    shapeId: ShapeId,
    x: number = 0,
    y: number = -0.7
  ) {
    super(container, shapeId, x, y, 0);
  }
}
