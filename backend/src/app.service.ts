import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    const random = Math.random();
    return 'Hello World! ' + random.toString() + '';
  }
}
