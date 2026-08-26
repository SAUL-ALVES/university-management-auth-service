import createCrudController from '../../../shared/crudControllerFactory';
import { academicSemesterFilterableFields } from './academicSemester.constant';
import {
  IAcademicSemester,
  IAcademicSemesterFilters,
} from './academicSemester.interface';
import { AcademicSemesterService } from './academicSemester.service';

const handlers = createCrudController<
  IAcademicSemester,
  IAcademicSemesterFilters
>({
  filterableFields: academicSemesterFilterableFields,
  service: {
    create: AcademicSemesterService.createSemester,
    getAll: AcademicSemesterService.getAllsemesters,
    getOne: AcademicSemesterService.getSingleSemester,
    update: AcademicSemesterService.updateSemester,
    remove: AcademicSemesterService.deleteSemester,
  },
  messages: {
    created: 'Academic semester created successfully!',
    fetchedAll: 'Academic Semesters retrieved successfully !',
    fetchedOne: 'Academic Semester fetched successfully !',
    updated: 'Academic Semester updated successfully !',
    deleted: 'Academic Semester deleted successfully !',
  },
});

export const AcademicSemesterController = {
  createSemester: handlers.create,
  getSingleSemester: handlers.getOne,
  getAllSemesters: handlers.getAll,
  updateSemester: handlers.update,
  deleteSemester: handlers.remove,
};
