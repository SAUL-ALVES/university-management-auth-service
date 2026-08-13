import { IAcademicSemester } from '../academicSemester/academicSemester.interface';
import { User } from './user.model';

type UserRole = 'student' | 'faculty' | 'admin';

const SEQUENCE_LENGTH = 5;

const findLastUserId = async (
  role: UserRole,
  prefixLength: number
): Promise<string | undefined> => {
  const lastUser = await User.findOne(
    { role },
    { id: 1, _id: 0 }
  )
    .sort({ createdAt: -1 })
    .lean();

  return lastUser?.id
    ? lastUser.id.substring(prefixLength)
    : undefined;
};

const getNextSequentialId = (currentId?: string): string => {
  const numericId = Number.parseInt(currentId || '0', 10);

  return (numericId + 1)
    .toString()
    .padStart(SEQUENCE_LENGTH, '0');
};

const generatePrefixedId = async (
  role: 'faculty' | 'admin',
  prefix: 'F' | 'A'
): Promise<string> => {
  const currentId = await findLastUserId(role, 2);
  const nextId = getNextSequentialId(currentId);

  return `${prefix}-${nextId}`;
};

export const generateStudentId = async (
  academicSemester: IAcademicSemester
): Promise<string> => {
  const currentId = await findLastUserId('student', 4);
  const nextId = getNextSequentialId(currentId);

  return `${academicSemester.year}${academicSemester.code}${nextId}`;
};

export const generateFacultyId = (): Promise<string> =>
  generatePrefixedId('faculty', 'F');

export const generateAdminId = (): Promise<string> =>
  generatePrefixedId('admin', 'A');