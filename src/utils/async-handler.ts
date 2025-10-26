import type { NextFunction, Request, Response } from 'express';
import type { ParamsDictionary } from 'express-serve-static-core';
import type { ParsedQs } from 'qs';

/**
 * Утилита, оборачивающая асинхронный обработчик роута (без `next()`), чтобы любая ошибка автоматически
 * передавалась в `next()`. Это позволяет избежать включения блоков `try/catch` в каждый асинхронный обработчик.
 *
 * @param fn Асинхронный обработчик запросов Express, возвращающий промис.
 * @returns Стандартный обработчик запросов Express.
 */
export function asyncHandler<
  P = ParamsDictionary,
  ResponseBody = unknown,
  RequestBody = unknown,
  RequestQuery = ParsedQs,
  LocalsObject extends Record<string, unknown> = Record<string, unknown>,
>(
  function_: (
    request: Request<P, ResponseBody, RequestBody, RequestQuery, LocalsObject>,
    response: Response<ResponseBody, LocalsObject>,
  ) => Promise<void>,
): (
  request: Request<P, ResponseBody, RequestBody, RequestQuery, LocalsObject>,
  response: Response<ResponseBody, LocalsObject>,
  next: NextFunction,
) => Promise<void> {
  return async function (
    request: Request<P, ResponseBody, RequestBody, RequestQuery, LocalsObject>,
    response: Response<ResponseBody, LocalsObject>,
    next: NextFunction,
  ): Promise<void> {
    try {
      await function_(request, response);
    } catch (error) {
      next(error);
    }
  };
}