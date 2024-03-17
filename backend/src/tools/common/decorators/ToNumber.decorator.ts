import { Transform } from 'class-transformer';
import { isNumber, isString } from 'class-validator';

export function ToNumber(): PropertyDecorator {
  return Transform(({ value }) => {
    if (isString(value)) {
      const parsed = parseFloat(value);
      if (isNaN(parsed)) {
        throw new Error(`Unable to convert "${value}" to a number`);
      }
      return parsed;
    }
    if (isNumber(value)) {
      return value;
    }
    throw new Error(`Expected number or string, got ${typeof value}`);
  });
}
