import { SearchExecutor } from '../types';
export interface GraphQLClientLike {
    query<T = any>(options: {
        query: string | any;
        variables?: Record<string, any>;
        context?: any;
    }): Promise<{
        data: T;
    }>;
}
export interface GraphQLAdapterOptions {
    client: GraphQLClientLike;
    query: string | any;
    queryVariableName?: string;
    resultExtractor?: (data: any) => any;
    additionalVariables?: Record<string, any>;
}
export declare function createGraphQLExecutor<T = any>(options: GraphQLAdapterOptions): SearchExecutor<T>;
