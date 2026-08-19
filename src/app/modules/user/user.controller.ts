import { UserService } from './user.service';
import createUserHandler from './userControllerFactory';

const createStudent = createUserHandler(
  'student',
  UserService.createStudent,
  'Student created successfully!'
);

const createFaculy = createUserHandler(
  'faculty',
  UserService.createFaculty,
  'Faculty created successfully!'
);

const createAdmin = createUserHandler(
  'admin',
  UserService.createAdmin,
  'Admin created successfully!'
);

export const UserController = {
  createStudent,
  createFaculy,
  createAdmin,
};
