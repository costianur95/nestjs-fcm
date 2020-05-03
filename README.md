<h1 align="center"></h1>

<div align="center">
  <a href="http://nestjs.com/" target="_blank">
    <img src="https://nestjs.com/img/logo_text.svg" width="150" alt="Nest Logo" />
  </a>
</div>

<h3 align="center">NestJS FCM push notifications module</h3>

<div align="center">
  <a href="https://nestjs.com" target="_blank">
    <img src="https://img.shields.io/badge/built%20with-NestJs-red.svg" alt="Built with NestJS">
  </a>
</div>

### Installation

```bash
npm install --save nestjs-fcm
```

### FcmModule

To user FcmService you must add the module first. **The `FcmModule` has a `@Global()` attribute so you should only import it once**.

```typescript
import { Module } from '@nestjs/common';
import * as path from 'path';
import { FcmModule } from 'nestjs-fcm';

@Module({
  imports: [
    FcmModule.forRoot({
      firebaseSpecsPath: path.join(__dirname, '../firebase.spec.json'),
    }),
  ],
  controllers: [],
})
export class AppModule {}
```

### `FcmService` use firebase.spec.json file to send notifications using firebase-admin dependency.

```typescript
@Injectable()
export class SampleService {
  constructor(private readonly fcmService: FcmService) {}

  async doStuff() {
    await this.fcmService.sendNotification([
      'device_id_1',
      'device_id_2',
      ]
      payload,
      silent,
    ]);
  }
}
```

## Change Log

See [Changelog](CHANGELOG.md) for more information.

## Contributing

Contributions welcome! See [Contributing](CONTRIBUTING.md).

## Author

**Razvan Costianu**

## License

Licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
