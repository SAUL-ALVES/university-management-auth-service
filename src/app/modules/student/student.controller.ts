import { createCrudControllerWithoutCreate } from '../../../shared/crudControllerFactory';
import { studentFilterableFields } from './student.constant';
import { IStudent, IStudentFilters } from './student.interface';
import { StudentService } from './student.service';

const handlers = createCrudControllerWithoutCreate<
  IStudent,
  IStudentFilters
>({
  filterableFields: studentFilterableFields,
  service: {
    getAll: StudentService.getAllStudents,
    getOne: StudentService.getSingleStudent,
    update: StudentService.updateStudent,
    remove: StudentService.deleteStudent,
  },
  messages: {
    fetchedAll: 'Students fetched successfully !',
    fetchedOne: 'Student fetched successfully !',
    updated: 'Student updated successfully !',
    deleted: 'Student deleted successfully !',
  },
});

export const StudentController = {
  getSingleStudent: handlers.getOne,
  getAllStudents: handlers.getAll,
  updateStudent: handlers.update,
  deleteStudent: handlers.remove,
};
