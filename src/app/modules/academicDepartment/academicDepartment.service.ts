import { SortOrder } from 'mongoose';
import { paginationHelpers } from '../../../helpers/paginationHelper';
import { IGenericResponse } from '../../../interfaces/common';
import { IPaginationOptions } from '../../../interfaces/pagination';
import { AcademicFaculty } from '../academicFaculty/academicFaculty.model';
import { academicDepartmentSearchableFields } from './academicDepartment.constants';
import {
  AcademicDepartmentCreatedEvent,
  AcademicDepartmentUpdatedEvent,
  IAcademicDepartment,
  IAcademicDepartmentFilters,
} from './academicDepartment.interfaces';
import { AcademicDepartment } from './academicDepartment.model';

const createDepartment = async (
  payload: IAcademicDepartment
): Promise<IAcademicDepartment | null> => {
  return (await AcademicDepartment.create(payload)).populate(
    'academicFaculty'
  );
};

const getSingleDepartment = async (
  id: string
): Promise<IAcademicDepartment | null> => {
  return AcademicDepartment.findById(id).populate('academicFaculty');
};

const getAllDepartments = async (
  filters: IAcademicDepartmentFilters,
  paginationOptions: IPaginationOptions
): Promise<IGenericResponse<IAcademicDepartment[]>> => {
  const { limit, page, skip, sortBy, sortOrder } =
    paginationHelpers.calculatePagination(paginationOptions);

  const { searchTerm, ...filtersData } = filters;

  const andConditions: Record<string, unknown>[] = [];

  if (searchTerm) {
    andConditions.push({
      $or: academicDepartmentSearchableFields.map(field => ({
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

  const result = await AcademicDepartment.find(whereConditions)
    .populate('academicFaculty')
    .sort(sortConditions)
    .skip(skip)
    .limit(limit);

  const total = await AcademicDepartment.countDocuments(whereConditions);

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
  payload: Partial<IAcademicDepartment>
): Promise<IAcademicDepartment | null> => {
  return AcademicDepartment.findOneAndUpdate(
    { _id: id },
    payload,
    {
      new: true,
    }
  ).populate('academicFaculty');
};

const deleteDepartment = async (
  id: string
): Promise<IAcademicDepartment | null> => {
  return AcademicDepartment.findByIdAndDelete(id);
};

const insertIntoDBFromEvent = async (
  event: AcademicDepartmentCreatedEvent
): Promise<void> => {
  const academicFaculty = await AcademicFaculty.findOne({
    syncId: event.academicFacultyId,
  });

  await AcademicDepartment.create({
    title: event.title,
    academicFaculty: academicFaculty?._id,
    syncId: event.id,
  });
};

const updateOneInDBFromEvent = async (
  event: AcademicDepartmentUpdatedEvent
): Promise<void> => {
  const academicFaculty = await AcademicFaculty.findOne({
    syncId: event.academicFacultyId,
  });

  await AcademicDepartment.findOneAndUpdate(
    { syncId: event.id },
    {
      $set: {
        title: event.title,
        academicFaculty: academicFaculty?._id,
      },
    }
  );
};

const deleteOneFromDBFromEvent = async (
  syncId: string
): Promise<void> => {
  await AcademicDepartment.findOneAndDelete({ syncId });
};

export const AcademicDepartmentService = {
  createDepartment,
  getSingleDepartment,
  getAllDepartments,
  updateDepartment,
  deleteDepartment,
  insertIntoDBFromEvent,
  updateOneInDBFromEvent,
  deleteOneFromDBFromEvent,
};