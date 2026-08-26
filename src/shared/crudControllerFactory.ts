import { RequestHandler } from 'express';
import httpStatus from 'http-status';
import { paginationFields } from '../constants/pagination';
import { IGenericResponse } from '../interfaces/common';
import { IPaginationOptions } from '../interfaces/pagination';
import catchAsync from './catchAsync';
import pick from './pick';
import sendResponse from './sendResponse';

/* eslint-disable no-unused-vars */
type BaseCrudService<TEntity, TFilters> = {
  getAll: (
    filters: TFilters,
    paginationOptions: IPaginationOptions
  ) => Promise<IGenericResponse<TEntity[]>>;
  getOne: (id: string) => Promise<TEntity | null>;
  update: (id: string, payload: Partial<TEntity>) => Promise<TEntity | null>;
  remove: (id: string) => Promise<TEntity | null>;
};

type CrudService<TEntity, TFilters> = BaseCrudService<TEntity, TFilters> & {
  create: (payload: TEntity) => Promise<TEntity | null>;
};
/* eslint-enable no-unused-vars */

type BaseCrudMessages = {
  fetchedAll: string;
  fetchedOne: string;
  updated: string;
  deleted: string;
};

type CrudMessages = BaseCrudMessages & {
  created: string;
};

type BaseCrudControllerConfig<TEntity, TFilters> = {
  filterableFields: string[];
  service: BaseCrudService<TEntity, TFilters>;
  messages: BaseCrudMessages;
};

type CrudControllerConfig<TEntity, TFilters> = {
  filterableFields: string[];
  service: CrudService<TEntity, TFilters>;
  messages: CrudMessages;
};

type BaseCrudController = {
  getAll: RequestHandler;
  getOne: RequestHandler;
  update: RequestHandler;
  remove: RequestHandler;
};

type CrudController = BaseCrudController & {
  create: RequestHandler;
};

const createBaseCrudController = <TEntity, TFilters>({
  filterableFields,
  service,
  messages,
}: BaseCrudControllerConfig<TEntity, TFilters>): BaseCrudController => {
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

  return { getAll, getOne, update, remove };
};

export const createCrudControllerWithoutCreate = <
  TEntity,
  TFilters
>(
  config: BaseCrudControllerConfig<TEntity, TFilters>
): BaseCrudController => createBaseCrudController(config);

const createCrudController = <TEntity, TFilters>({
  filterableFields,
  service,
  messages,
}: CrudControllerConfig<TEntity, TFilters>): CrudController => {
  const handlers = createBaseCrudController({
    filterableFields,
    service,
    messages,
  });

  const create = catchAsync(async (req, res) => {
    const result = await service.create(req.body);

    sendResponse<TEntity>(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: messages.created,
      data: result,
    });
  });

  return { create, ...handlers };
};

export default createCrudController;