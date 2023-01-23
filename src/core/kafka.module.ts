import { DynamicModule, Module, Provider, Type } from '@nestjs/common';
import { ClientProxyFactory, KafkaOptions } from '@nestjs/microservices';
import { KAFKA_MODULE } from '../constant';
import { KafkaModuleAsyncOptions, KafkaModuleOptionFactory } from '../interface/kafka.option';

const data = ClientProxyFactory.create({});

@Module({})
export class KafkaModule {
  static register(options: KafkaOptions): DynamicModule {
    return {
      module: KafkaModule,
      providers: [
        {
          provide: KAFKA_MODULE,
          useValue: ClientProxyFactory.create(options),
        },
      ],
      exports: [KAFKA_MODULE, KafkaModule],
      global: true,
    };
  }

  static registerAsync(options: KafkaModuleAsyncOptions): DynamicModule {
    return {
      module: KafkaModule,
      imports: [...(options.imports || [])],
      providers: [...this.createAsyncProviders(options)],

      exports: [KAFKA_MODULE, KafkaModule],
      global: true,
    };
  }

  private static createAsyncProviders(options: KafkaModuleAsyncOptions): Provider[] {
    if (options.useExisting || options.useFactory) {
      return [this.createAsyncOptionsProvider(options)];
    }
    return [
      this.createAsyncOptionsProvider(options),
      {
        provide: options.useClass || '',
        useClass: options?.useClass as Type<KafkaModuleOptionFactory>,
        useValue: options,
      },
    ];
  }

  private static createAsyncOptionsProvider(options: KafkaModuleAsyncOptions): Provider {
    if (options.useFactory) {
      return {
        provide: KAFKA_MODULE,
        useFactory: options.useFactory,
        inject: options.inject || [],
      };
    }
    return {
      provide: KAFKA_MODULE,
      useFactory: async (optionsFactory: KafkaModuleOptionFactory) => await optionsFactory.createOptions(),
      inject: [options.useExisting || options.useClass || ''],
    };
  }
}
