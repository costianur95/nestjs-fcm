import { Injectable } from '@nestjs/common/decorators/core/injectable.decorator';
import { Inject, Logger } from '@nestjs/common';
import { FCM_OPTIONS } from '../fcm.constants';
import { FcmOptions } from '../interfaces/fcm-options.interface';
import * as firebaseAdmin from 'firebase-admin';

@Injectable()
export class FcmService {
  constructor(
    @Inject(FCM_OPTIONS) private fcmOptionsProvider: FcmOptions,
    private readonly logger: Logger,
  ) {}

  async sendNotification(
    deviceIds: Array<string>,
    payload: firebaseAdmin.messaging.MessagingPayload,
    silent: boolean,
  ) {
    if (deviceIds.length == 0) {
      throw new Error('You provide an empty device ids list!');
    }

    if (firebaseAdmin.apps.length === 0) {
      firebaseAdmin.initializeApp({
        credential: firebaseAdmin.credential.cert(
          this.fcmOptionsProvider.firebaseSpecsPath,
        ),
      });
    }

    const options = {
      priority: 'high',
      timeToLive: 60 * 60 * 24,
    };

    const optionsSilent = {
      priority: 'high',
      timeToLive: 60 * 60 * 24,
      content_available: true,
    };

    let result = null;
    try {
      result = await firebaseAdmin
        .messaging()
        .sendToDevice(deviceIds, payload, silent ? optionsSilent : options);
    } catch (error) {
      this.logger.error(error.message, error.stackTrace, 'nestjs-fcm');
      throw error;
    }
    return result;
  }
}
