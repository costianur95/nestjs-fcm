import { Logger } from '@nestjs/common';

export interface FcmOptions {
  firebaseSpecsPath: string;
  logger?: any;
}
