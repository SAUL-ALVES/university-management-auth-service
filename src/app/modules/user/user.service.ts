import httpStatus from 'http-status';
import mongoose, { ClientSession, Types } from 'mongoose';
import config from '../../../config/index';
import ApiError from '../../../errors/ApiError';
import { RedisClient } from '../../../shared/redis';
import { IAcademicSemester } from '../academicSemester/academicSemester.interface';
import { AcademicSemester } from '../academicSemester/academicSemester.model';
import { IAdmin } from '../admin/admin.interface';
import { Admin } from '../admin/admin.model';
import { IFaculty } from '../faculty/faculty.interface';
import { Faculty } from '../faculty/faculty.model';
import { IStudent } from '../student/student.interface';
import { Student } from '../student/student.model';
import { EVENT_FACULTY_CREATED, EVENT_STUDENT_CREATED } from './user.constant';
import { IUser } from './user.interface';
import { User } from './user.model';
import {
  generateAdminId,
  generateFacultyId,
  generateStudentId,
} from './user.utils';

type PopulateConfig = {
  path: string;
  populate?: Array<{ path: string }>;
};

type CreateRelatedUserParams<TProfile extends { id?: string }> = {
  profile: TProfile;
  user: IUser;
  role: 'student' | 'faculty' | 'admin';
  defaultPassword: string;
  generateId: () => Promise<string>;
  createProfile: (
    docs: TProfile[],
    options: { session: ClientSession }
  ) => Promise<Array<TProfile & { _id: Types.ObjectId }>>;
  attachProfileToUser: (user: IUser, profileId: Types.ObjectId) => void;
  failCreateProfileMessage: string;
  failCreateUserMessage: string;
  populate: PopulateConfig;
  eventName?: string;
  eventPayload?: (createdUser: IUser) => unknown;
};

const withTransaction = async <T>(
  work: (session: ClientSession) => Promise<T>
): Promise<T> => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();
    const result = await work(session);
    await session.commitTransaction();
    return result;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    await session.endSession();
  }
};

const applyDefaultPasswordAndRole = (
  user: IUser,
  defaultPassword: string,
  role: IUser['role']
): void => {
  if (!user.password) {
    user.password = defaultPassword;
  }
  user.role = role;
};

const createRelatedUser = async <TProfile extends { id?: string }>(
  params: CreateRelatedUserParams<TProfile>
): Promise<IUser | null> => {
  const {
    profile,
    user,
    role,
    defaultPassword,
    generateId,
    createProfile,
    attachProfileToUser,
    failCreateProfileMessage,
    failCreateUserMessage,
    populate,
    eventName,
    eventPayload,
  } = params;

  applyDefaultPasswordAndRole(user, defaultPassword, role);

  const createdUser = await withTransaction(async session => {
    const id = await generateId();
    user.id = id;
    profile.id = id;

    const createdProfiles = await createProfile([profile], { session });
    if (!createdProfiles.length) {
      throw new ApiError(httpStatus.BAD_REQUEST, failCreateProfileMessage);
    }

    attachProfileToUser(user, createdProfiles[0]._id);

    const newUsers = await User.create([user], { session });
    if (!newUsers.length) {
      throw new ApiError(httpStatus.BAD_REQUEST, failCreateUserMessage);
    }

    return newUsers[0];
  });

  let populatedUser = await User.findOne({ id: createdUser.id }).populate(
    populate
  );

  if (populatedUser && eventName && eventPayload) {
    await RedisClient.publish(
      eventName,
      JSON.stringify(eventPayload(populatedUser))
    );
  }

  return populatedUser;
};

const createStudent = async (
  student: IStudent,
  user: IUser
): Promise<IUser | null> => {
  const academicSemester = await AcademicSemester.findById(
    student.academicSemester
  ).lean();

  return createRelatedUser({
    profile: student,
    user,
    role: 'student',
    defaultPassword: config.default_student_pass as string,
    generateId: () =>
      generateStudentId(academicSemester as IAcademicSemester),
    createProfile: (docs, options) =>
      Student.create(docs, options) as Promise<
        Array<IStudent & { _id: Types.ObjectId }>
      >,
    attachProfileToUser: (currentUser, profileId) => {
      currentUser.student = profileId;
    },
    failCreateProfileMessage: 'Failed to create student',
    failCreateUserMessage: 'Failed to create user',
    populate: {
      path: 'student',
      populate: [
        { path: 'academicSemester' },
        { path: 'academicDepartment' },
        { path: 'academicFaculty' },
      ],
    },
    eventName: EVENT_STUDENT_CREATED,
    eventPayload: createdUser => createdUser.student,
  });
};

const createFaculty = async (
  faculty: IFaculty,
  user: IUser
): Promise<IUser | null> => {
  return createRelatedUser({
    profile: faculty,
    user,
    role: 'faculty',
    defaultPassword: config.default_faculty_pass as string,
    generateId: generateFacultyId,
    createProfile: (docs, options) =>
      Faculty.create(docs, options) as Promise<
        Array<IFaculty & { _id: Types.ObjectId }>
      >,
    attachProfileToUser: (currentUser, profileId) => {
      currentUser.faculty = profileId;
    },
    failCreateProfileMessage: 'Failed to create faculty',
    failCreateUserMessage: 'Failed to create user',
    populate: {
      path: 'faculty',
      populate: [
        { path: 'academicDepartment' },
        { path: 'academicFaculty' },
      ],
    },
    eventName: EVENT_FACULTY_CREATED,
    eventPayload: createdUser => createdUser.faculty,
  });
};

const createAdmin = async (
  admin: IAdmin,
  user: IUser
): Promise<IUser | null> => {
  return createRelatedUser({
    profile: admin,
    user,
    role: 'admin',
    defaultPassword: config.default_admin_pass as string,
    generateId: generateAdminId,
    createProfile: (docs, options) =>
      Admin.create(docs, options) as Promise<
        Array<IAdmin & { _id: Types.ObjectId }>
      >,
    attachProfileToUser: (currentUser, profileId) => {
      currentUser.admin = profileId;
    },
    failCreateProfileMessage: 'Failed to create admin',
    failCreateUserMessage: 'Failed to create admin',
    populate: {
      path: 'admin',
      populate: [{ path: 'managementDepartment' }],
    },
  });
};

export const UserService = {
  createStudent,
  createFaculty,
  createAdmin,
};
