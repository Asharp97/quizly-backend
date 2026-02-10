import { Injectable, ExecutionContext } from '@nestjs/common';
import { CacheInterceptor } from '@nestjs/cache-manager';
import { GqlExecutionContext } from '@nestjs/graphql';

const QUIZ_BY_ID_PREFIX = 'quiz_by_id:';
const QUIZ_BY_LINK_PREFIX = 'quiz_by_link:';

export const buildQuizByIdCacheKey = (id: string) =>
  `${QUIZ_BY_ID_PREFIX}${id}`;
export const buildQuizByLinkCacheKey = (link: string) =>
  `${QUIZ_BY_LINK_PREFIX}${link}`;

@Injectable()
export class GraphqlCacheInterceptor extends CacheInterceptor {
  trackBy(context: ExecutionContext): string | undefined {
    const gqlContext = GqlExecutionContext.create(context);
    const info = gqlContext.getInfo();

    if (info.operation.operation !== 'query') {
      return undefined;
    }

    const args = gqlContext.getArgs();

    if (info.fieldName === 'GetQuiz') {
      const id = args?.where?.id;
      return id ? buildQuizByIdCacheKey(id) : undefined;
    }

    if (info.fieldName === 'VerifyQuizLink') {
      const link = args?.link;
      return link ? buildQuizByLinkCacheKey(link) : undefined;
    }

    return `${info.fieldName}:${JSON.stringify(args ?? {})}`;
  }
}
