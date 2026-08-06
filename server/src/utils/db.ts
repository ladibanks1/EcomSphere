import { QueryResult } from 'pg';

export const getOne = <T>(data: QueryResult): T | null =>
  data.rowCount ? (data.rows[0] as T) : null;

export const getMany = <T>(data: QueryResult): T[] => data.rows as T[];
