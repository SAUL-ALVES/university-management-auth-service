import httpStatus from 'http-status';
import mongoose, { SortOrder } from 'mongoose';
import ApiError from '../../../errors/ApiError';
import { paginationHelpers } from '../../../helpers/paginationHelper';
import { queryHelpers } from '../../../helpers/queryHelper';
import { IGenericResponse } from '../../../interfaces/common';
import { IPaginationOptions } from '../../../interfaces/pagination';
import { User } from '../user/user.model';
import { adminSearchableFields } from './admin.constant';
import { IAdmin, IAdminFilters } from './admin.interface';
import { Admin } from './admin.model';

const getSingleAdmin = async (id: string): Promise<IAdmin | null> => {
  const result = await Admin.findOne({ id }).populate('managementDepartment');
  return result;
};

const getAllAdmins = async (
  filters: IAdminFilters,
  paginationOptions: IPaginationOptions
): Promise<IGenericResponse<IAdmin[]>> => {
  const { searchTerm, ...filtersData } = filters;
  const { page, limit, skip, sortBy, sortOrder } =
    paginationHelpers.calculatePagination(paginationOptions);

  const andConditions = queryHelpers.buildAndConditions(
    searchTerm,
    filtersData as Record<string, unknown>,
    adminSearchableFields
  );
  const sortConditions = queryHelpers.buildSortConditions(
    sortBy,
    sortOrder as SortOrder
  );
  const whereConditions = queryHelpers.buildWhereConditions(andConditions);

  const result = await Admin.find(whereConditions)
    .populate('managementDepartment')
    .sort(sortConditions)
    .skip(skip)
    .limit(limit);

  const total = await Admin.countDocuments(whereConditions);

  return {
    meta: {
      page,
      limit,
      total,
    },
    data: result,
  };
};

const updateAdmin = async (
  id: string,
  payload: Partial<IAdmin>
): Promise<IAdmin | null> => {
  const isExist = await Admin.findOne({ id });

  if (!isExist) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Admin not found !');
  }

  const { name, ...adminData } = payload;
  const updatedAdminData: Partial<IAdmin> = { ...adminData };

  if (name && Object.keys(name).length > 0) {
    queryHelpers.flattenNestedObject(
      name as unknown as Record<string, unknown>,
      'name',
      updatedAdminData
    );
  }

  const result = await Admin.findOneAndUpdate({ id }, updatedAdminData, {
    new: true,
  });
  return result;
};

const deleteAdmin = async (id: string): Promise<IAdmin | null> => {
  const isExist = await Admin.findOne({ id });

  if (!isExist) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Admin not found !');
  }

  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const admin = await Admin.findOneAndDelete({ id }, { session });
    if (!admin) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Failed to delete admin');
    }

    await User.deleteOne({ id }, { session });
    await session.commitTransaction();

    return admin;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    await session.endSession();
  }
};

export const AdminService = {
  getSingleAdmin,
  getAllAdmins,
  updateAdmin,
  deleteAdmin,
};
