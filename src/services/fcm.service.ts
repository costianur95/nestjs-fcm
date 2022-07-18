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
    imageUrl?: string
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

    const body: firebaseAdmin.messaging.MulticastMessage = {
      tokens: deviceIds,
      data: payload?.data,
      notification: {
        title: payload?.notification?.title,
        body: payload?.notification?.body,
        imageUrl
      },
      apns: {
        payload: {
          aps: {
            sound: payload?.notification?.sound,
            contentAvailable: silent ? true : false,
            mutableContent: true
          }
        },
        fcmOptions: {
         imageUrl
        }
      },
      android: {
        priority: 'high',
        ttl: 60 * 60 * 24,
      }
    }

    let result = null;
    try {
      result = await firebaseAdmin
        .messaging()
        .sendMulticast(body, false)
    } catch (error) {
      this.logger.error(error.message, error.stackTrace, 'nestjs-fcm');
      throw error;
    }
    return result;
  }
}
