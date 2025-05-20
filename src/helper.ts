import { Position } from './types';

export const arePositionsEqual = (a: Position, b: Position): boolean => {
  return a.col === b.col && a.row === b.row;
};
