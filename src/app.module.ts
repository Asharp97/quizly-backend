import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { GraphQLModule } from '@nestjs/graphql';
import { UserModule } from './user/user.module';
import { RedisModule } from '@liaoliaots/nestjs-redis';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from './common/guards/auth.guard';
import { ScheduleModule } from '@nestjs/schedule';
import { QuizModule } from './quiz/quiz.module';
import { QuestionModule } from './question/question.module';
import { AnswerModule } from './answer/answer.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: 'schema.gql',
      subscriptions: {
        'graphql-ws': true,
        'subscriptions-transport-ws': true,
      },
      playground: process.env.NODE_ENV === 'development',
      context: ({ req, res }: { req: unknown; res: unknown }) => ({ req, res }),
    }),
    RedisModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        config: {
          host: configService.get('API_REDIS_HOST'),
          port: configService.get('API_REDIS_PORT'),
          username: configService.get('API_REDIS_USERNAME') || undefined,
          password: configService.get('API_REDIS_PASSWORD') || undefined,
        },
      }),
    }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const secret = configService.get<string>('API_JWT_SECRET');
        return {
          secret,
          signOptions: {
            issuer: configService.get<string>('API_JWT_ISSUER'),
          },
        };
      },
      inject: [ConfigService],
      global: true,
    }),
    ScheduleModule.forRoot(),
    UserModule,
    QuizModule,
    QuestionModule,
    AnswerModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ],
})
export class AppModule {}
