import mongoose, { SortOrder } from 'mongoose';
import { paginationHelpers } from '../../../helpers/paginationHelper';
import { queryHelpers } from '../../../helpers/queryHelper';
import { IGenericResponse } from '../../../interfaces/common';
import { IPaginationOptions } from '../../../interfaces/pagination';

import httpStatus from 'http-status';
import ApiError from '../../../errors/ApiError';
import { RedisClient } from '../../../shared/redis';
import { User } from '../user/user.model';
import {
  EVENT_STUDENT_UPDATED,
  studentSearchableFields,
} from './student.constant';
import { IStudent, IStudentFilters } from './student.interface';
import { Student } from './student.model';

const getAllStudents = async (
  filters: IStudentFilters,
  paginationOptions: IPaginationOptions
): Promise<IGenericResponse<IStudent[]>> => {
  const { searchTerm, ...filtersData } = filters;
  const { page, limit, skip, sortBy, sortOrder } =
    paginationHelpers.calculatePagination(paginationOptions);

  const andConditions = queryHelpers.buildAndConditions(
    searchTerm,
    filtersData as Record<string, unknown>,
    studentSearchableFields
  );
  const sortConditions = queryHelpers.buildSortConditions(
    sortBy,
    sortOrder as SortOrder
  );
  const whereConditions = queryHelpers.buildWhereConditions(andConditions);

  const result = await Student.find(whereConditions)
    .populate('academicSemester')
    .populate('academicDepartment')
    .populate('academicFaculty')
    .sort(sortConditions)
    .skip(skip)
    .limit(limit);

  const total = await Student.countDocuments(whereConditions);

  return {
    meta: {
      page,
      limit,
      total,
    },
    data: result,
  };
};

const getSingleStudent = async (id: string): Promise<IStudent | null> => {
  const result = await Student.findOne({ id })
    .populate('academicSemester')
    .populate('academicDepartment')
    .populate('academicFaculty');
  return result;
};

const updateStudent = async (
  id: string,
  payload: Partial<IStudent>
): Promise<IStudent | null> => {
  const isExist = await Student.findOne({ id });

  if (!isExist) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Student not found !');
  }

  const { name, guardian, localGuardian, ...studentData } = payload;
  const updatedStudentData: Partial<IStudent> = { ...studentData };

  if (name && Object.keys(name).length > 0) {
    queryHelpers.flattenNestedObject(
      name as unknown as Record<string, unknown>,
      'name',
      updatedStudentData
    );
  }

  if (guardian && Object.keys(guardian).length > 0) {
    queryHelpers.flattenNestedObject(
      guardian as unknown as Record<string, unknown>,
      'guardian',
      updatedStudentData
    );
  }

  if (localGuardian && Object.keys(localGuardian).length > 0) {
    queryHelpers.flattenNestedObject(
      localGuardian as unknown as Record<string, unknown>,
      'localGuardian',
      updatedStudentData
    );
  }

  const result = await Student.findOneAndUpdate({ id }, updatedStudentData, {
    new: true,
  })
    .populate('academicFaculty')
    .populate('academicDepartment')
    .populate('academicSemester');

  if (result) {
    await RedisClient.publish(EVENT_STUDENT_UPDATED, JSON.stringify(result));
  }

  return result;
};

const deleteStudent = async (id: string): Promise<IStudent | null> => {
  const isExist = await Student.findOne({ id });

  if (!isExist) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Student not found !');
  }

  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const student = await Student.findOneAndDelete({ id }, { session });
    if (!student) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Failed to delete student');
    }

    await User.deleteOne({ id }, { session });
    await session.commitTransaction();

    return student;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    await session.endSession();
  }
};

export const StudentService = {
  getAllStudents,
  getSingleStudent,
  updateStudent,
  deleteStudent,
};
