export interface PaginatedResponse<T> {
  readonly data: T[];
  readonly meta: PaginationMeta;
}

export interface PaginationMeta {
  readonly total: number;
  readonly page: number;
  readonly pageSize: number;
  readonly totalPages: number;
  readonly hasNextPage: boolean;
  readonly hasPreviousPage: boolean;
}

export interface OffsetPaginationParams {
  readonly page: number;
  readonly pageSize: number;
}

export interface CursorPaginationParams {
  readonly cursor?: string;
  readonly limit: number;
}

export interface CursorPaginatedResponse<T> {
  readonly data: T[];
  readonly nextCursor: string | null;
  readonly hasMore: boolean;
}
