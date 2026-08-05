import { SortOrder } from 'mongoose';
import { paginationHelpers } from '../../../helpers/paginationHelper';
import { IGenericResponse } from '../../../interfaces/common';
import { IPaginationOptions } from '../../../interfaces/pagination';
import { academicFacultySearchableFields } from './academicFaculty.constants';
import {
  AcademicFacultyCreatedEvent,
  AcademicFacultyUpdatedEvent,
  IAcademicFaculty,
  IAcademicFacultyFilters,
} from './academicFaculty.interfaces';
import { AcademicFaculty } from './academicFaculty.model';

const createFaculty = async (
  payload: IAcademicFaculty
): Promise<IAcademicFaculty> => {
  return AcademicFaculty.create(payload);
};

const getSingleFaculty = async (
  id: string
): Promise<IAcademicFaculty | null> => {
  return AcademicFaculty.findById(id);
};

const getAllFaculties = async (
  filters: IAcademicFacultyFilters,
  paginationOptions: IPaginationOptions
): Promise<IGenericResponse<IAcademicFaculty[]>> => {
  const { searchTerm, ...filtersData } = filters;

  const { page, limit, skip, sortBy, sortOrder } =
    paginationHelpers.calculatePagination(paginationOptions);

  const andConditions: Record<string, unknown>[] = [];

  if (searchTerm) {
    andConditions.push({
      $or: academicFacultySearchableFields.map(field => ({
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

  const result = await AcademicFaculty.find(whereConditions)
    .sort(sortConditions)
    .skip(skip)
    .limit(limit);

  const total = await AcademicFaculty.countDocuments(whereConditions);

  return {
    meta: {
      page,
      limit,
      total,
    },
    data: result,
  };
};

const updateFaculty = async (
  id: string,
  payload: Partial<IAcademicFaculty>
): Promise<IAcademicFaculty | null> => {
  return AcademicFaculty.findOneAndUpdate(
    { _id: id },
    payload,
    {
      new: true,
    }
  );
};

const deleteByIdFromDB = async (
  id: string
): Promise<IAcademicFaculty | null> => {
  return AcademicFaculty.findByIdAndDelete(id);
};

const insertIntoDBFromEvent = async (
  event: AcademicFacultyCreatedEvent
): Promise<void> => {
  await AcademicFaculty.create({
    syncId: event.id,
    title: event.title,
  });
};

const updateOneInDBFromEvent = async (
  event: AcademicFacultyUpdatedEvent
): Promise<void> => {
  await AcademicFaculty.findOneAndUpdate(
    { syncId: event.id },
    {
      $set: {
        title: event.title,
      },
    }
  );
};

const deleteOneFromDBFromEvent = async (
  syncId: string
): Promise<void> => {
  await AcademicFaculty.findOneAndDelete({ syncId });
};

export const AcademicFacultyService = {
  createFaculty,
  getAllFaculties,
  getSingleFaculty,
  updateFaculty,
  deleteByIdFromDB,
  insertIntoDBFromEvent,
  updateOneInDBFromEvent,
  deleteOneFromDBFromEvent,
};