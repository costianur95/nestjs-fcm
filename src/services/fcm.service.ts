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
        notification: {
          sound: payload?.notification?.sound
        }
      }
    }

    let result = null
    let failureCount = 0
    let successCount = 0
    const failedDeviceIds = []

    while(deviceIds.length) {
      try {
        result = await firebaseAdmin
          .messaging()
          .sendMulticast({...body, tokens: deviceIds.splice(0,500)}, false)
          if (result.failureCount > 0) {
            const failedTokens = [];
            result.responses.forEach((resp, id) => {
              if (!resp.success) {
                failedTokens.push(deviceIds[id]);
              }
            });
            failedDeviceIds.push(...failedTokens)
          }
          failureCount += result.failureCount;
          successCount += result.successCount;
      } catch (error) {
        this.logger.error(error.message, error.stackTrace, 'nestjs-fcm');
        throw error;
      }
 
    }
    return {failureCount, successCount, failedDeviceIds};
  }

  async sendNotificationV1(
    deviceIds: Array<string>,
    payload: firebaseAdmin.messaging.MessagingPayload,
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

    let result = null;
    try {
      result = await firebaseAdmin
        .messaging()
        .sendMulticast({
          tokens: deviceIds,
          data: payload.data
        });
    } catch (error) {
      this.logger.error(error.message, error.stackTrace, 'nestjs-fcm');
      throw error;
    }
    return result;
  }
}
