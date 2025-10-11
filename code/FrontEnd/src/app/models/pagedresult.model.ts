export interface PagedResult<T> {
  data: T[];
  totalCount: number;
  page: number;
  size: number;
  totalPages: number;
}