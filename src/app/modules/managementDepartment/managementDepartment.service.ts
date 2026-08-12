import { SortOrder } from 'mongoose';
import { paginationHelpers } from '../../../helpers/paginationHelper';
import { queryHelpers } from '../../../helpers/queryHelper';
import { IGenericResponse } from '../../../interfaces/common';
import { IPaginationOptions } from '../../../interfaces/pagination';
import { managementDepartmentSearchableFields } from './managementDepartment.constant';
import {
  IManagementDepartment,
  IManagementDepartmentFilters,
} from './managementDepartment.inerface';
import { ManagementDepartment } from './managementDepartment.model';

const createDepartment = async (
  payload: IManagementDepartment
): Promise<IManagementDepartment | null> => {
  return ManagementDepartment.create(payload);
};

const getSingleDepartment = async (
  id: string
): Promise<IManagementDepartment | null> => {
  return ManagementDepartment.findById(id);
};

const getAllDepartments = async (
  filters: IManagementDepartmentFilters,
  paginationOptions: IPaginationOptions
): Promise<IGenericResponse<IManagementDepartment[]>> => {
  const { searchTerm, ...filtersData } = filters;
  const { page, limit, skip, sortBy, sortOrder } =
    paginationHelpers.calculatePagination(paginationOptions);

  const andConditions = queryHelpers.buildAndConditions(
    searchTerm,
    filtersData as Record<string, unknown>,
    managementDepartmentSearchableFields
  );
  const sortConditions = queryHelpers.buildSortConditions(
    sortBy,
    sortOrder as SortOrder
  );
  const whereConditions = queryHelpers.buildWhereConditions(andConditions);

  const result = await ManagementDepartment.find(whereConditions)
    .sort(sortConditions)
    .skip(skip)
    .limit(limit);

  const total = await ManagementDepartment.countDocuments(whereConditions);

  return {
    meta: {
      page,
      limit,
      total,
    },
    data: result,
  };
};

const updateDepartment = async (
  id: string,
  payload: Partial<IManagementDepartment>
): Promise<IManagementDepartment | null> => {
  return ManagementDepartment.findOneAndUpdate({ _id: id }, payload, {
    new: true,
  });
};

const deleteDepartment = async (
  id: string
): Promise<IManagementDepartment | null> => {
  return ManagementDepartment.findByIdAndDelete(id);
};

export const ManagementDepartmentService = {
  createDepartment,
  getAllDepartments,
  getSingleDepartment,
  updateDepartment,
  deleteDepartment,
};
