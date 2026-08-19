import { RequestHandler } from 'express';
import httpStatus from 'http-status';
import { paginationFields } from '../constants/pagination';
import { IGenericResponse } from '../interfaces/common';
import { IPaginationOptions } from '../interfaces/pagination';
import catchAsync from './catchAsync';
import pick from './pick';
import sendResponse from './sendResponse';

/* eslint-disable no-unused-vars */
type CrudService<TEntity, TFilters> = {
  create: (payload: TEntity) => Promise<TEntity | null>;
  getAll: (
    filters: TFilters,
    paginationOptions: IPaginationOptions
  ) => Promise<IGenericResponse<TEntity[]>>;
  getOne: (id: string) => Promise<TEntity | null>;
  update: (id: string, payload: Partial<TEntity>) => Promise<TEntity | null>;
  remove: (id: string) => Promise<TEntity | null>;
};
/* eslint-enable no-unused-vars */

type CrudMessages = {
  created: string;
  fetchedAll: string;
  fetchedOne: string;
  updated: string;
  deleted: string;
};

type CrudControllerConfig<TEntity, TFilters> = {
  filterableFields: string[];
  service: CrudService<TEntity, TFilters>;
  messages: CrudMessages;
};

type CrudController = {
  create: RequestHandler;
  getAll: RequestHandler;
  getOne: RequestHandler;
  update: RequestHandler;
  remove: RequestHandler;
};

const createCrudController = <TEntity, TFilters>({
  filterableFields,
  service,
  messages,
}: CrudControllerConfig<TEntity, TFilters>): CrudController => {
  const create = catchAsync(async (req, res) => {
    const result = await service.create(req.body);

    sendResponse<TEntity>(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: messages.created,
      data: result,
    });
  });

  const getAll = catchAsync(async (req, res) => {
    const filters = pick(req.query, filterableFields) as unknown as TFilters;
    const paginationOptions = pick(
      req.query,
      paginationFields
    ) as unknown as IPaginationOptions;
    const result = await service.getAll(filters, paginationOptions);

    sendResponse<TEntity[]>(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: messages.fetchedAll,
      meta: result.meta,
      data: result.data,
    });
  });

  const getOne = catchAsync(async (req, res) => {
    const result = await service.getOne(req.params.id);

    sendResponse<TEntity>(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: messages.fetchedOne,
      data: result,
    });
  });

  const update = catchAsync(async (req, res) => {
    const result = await service.update(req.params.id, req.body);

    sendResponse<TEntity>(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: messages.updated,
      data: result,
    });
  });

  const remove = catchAsync(async (req, res) => {
    const result = await service.remove(req.params.id);

    sendResponse<TEntity>(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: messages.deleted,
      data: result,
    });
  });

  return { create, getAll, getOne, update, remove };
};

export default createCrudController;
