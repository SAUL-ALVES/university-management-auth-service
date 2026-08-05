import httpStatus from 'http-status';
import { SortOrder } from 'mongoose';
import ApiError from '../../../errors/ApiError';
import { paginationHelpers } from '../../../helpers/paginationHelper';
import { IGenericResponse } from '../../../interfaces/common';
import { IPaginationOptions } from '../../../interfaces/pagination';
import {
  academicSemesterSearchableFields,
  academicSemesterTitleCodeMapper,
} from './academicSemester.constant';
import {
  IAcademicSemester,
  IAcademicSemesterCreatedEvent,
  IAcademicSemesterFilters,
} from './academicSemester.interface';
import { AcademicSemester } from './academicSemester.model';

const createSemester = async (
  payload: IAcademicSemester
): Promise<IAcademicSemester> => {
  if (academicSemesterTitleCodeMapper[payload.title] !== payload.code) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid Semester Code');
  }

  return AcademicSemester.create(payload);
};

const getSingleSemester = async (
  id: string
): Promise<IAcademicSemester | null> => {
  return AcademicSemester.findById(id);
};

const getAllsemesters = async (
  filters: IAcademicSemesterFilters,
  paginationOptions: IPaginationOptions
): Promise<IGenericResponse<IAcademicSemester[]>> => {
  const { searchTerm, ...filtersData } = filters;

  const { page, limit, skip, sortBy, sortOrder } =
    paginationHelpers.calculatePagination(paginationOptions);

  const andConditions: Record<string, unknown>[] = [];

  if (searchTerm) {
    andConditions.push({
      $or: academicSemesterSearchableFields.map(field => ({
        [field]: {
          $regex: searchTerm,
          $options: 'i',
        },
      })),
    });
  }

  if (Object.keys(filtersData).length > 0) {
    andConditions.push({
      $and: Object.entries(filtersData).map(([field, value]) => ({
        [field]: value,
      })),
    });
  }

  const sortConditions: Record<string, SortOrder> = {};

  if (sortBy && sortOrder) {
    sortConditions[sortBy] = sortOrder;
  }

  const whereConditions =
    andConditions.length > 0 ? { $and: andConditions } : {};

  const result = await AcademicSemester.find(whereConditions)
    .sort(sortConditions)
    .skip(skip)
    .limit(limit);

  const total = await AcademicSemester.countDocuments();

  return {
    meta: {
      page,
      limit,
      total,
    },
    data: result,
  };
};

const updateSemester = async (
  id: string,
  payload: Partial<IAcademicSemester>
): Promise<IAcademicSemester | null> => {
  if (
    payload.title &&
    payload.code &&
    academicSemesterTitleCodeMapper[payload.title] !== payload.code
  ) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid Semester Code');
  }

  return AcademicSemester.findOneAndUpdate(
    { _id: id },
    payload,
    {
      new: true,
    }
  );
};

const deleteSemester = async (
  id: string
): Promise<IAcademicSemester | null> => {
  return AcademicSemester.findByIdAndDelete(id);
};

const createSemesterFromEvent = async (
  event: IAcademicSemesterCreatedEvent
): Promise<void> => {
  await AcademicSemester.create({
    title: event.title,
    year: event.year,
    code: event.code,
    startMonth: event.startMonth,
    endMonth: event.endMonth,
    syncId: event.id,
  });
};

const updateOneIntoDBFromEvent = async (
  event: IAcademicSemesterCreatedEvent
): Promise<void> => {
  await AcademicSemester.findOneAndUpdate(
    { syncId: event.id },
    {
      $set: {
        title: event.title,
        year: event.year,
        code: event.code,
        startMonth: event.startMonth,
        endMonth: event.endMonth,
      },
    }
  );
};

const deleteOneFromDBFromEvent = async (
  syncId: string
): Promise<void> => {
  await AcademicSemester.findOneAndDelete({ syncId });
};

export const AcademicSemesterService = {
  createSemester,
  getSingleSemester,
  getAllsemesters,
  updateSemester,
  deleteSemester,
  createSemesterFromEvent,
  updateOneIntoDBFromEvent,
  deleteOneFromDBFromEvent,
};