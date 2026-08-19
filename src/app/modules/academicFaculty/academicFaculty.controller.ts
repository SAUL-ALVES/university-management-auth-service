import createCrudController from '../../../shared/crudControllerFactory';
import { academicFacultyFilterableFields } from './academicFaculty.constants';
import {
  IAcademicFaculty,
  IAcademicFacultyFilters,
} from './academicFaculty.interfaces';
import { AcademicFacultyService } from './academicFaculty.service';

const handlers = createCrudController<
  IAcademicFaculty,
  IAcademicFacultyFilters
>({
  filterableFields: academicFacultyFilterableFields,
  service: {
    create: AcademicFacultyService.createFaculty,
    getAll: AcademicFacultyService.getAllFaculties,
    getOne: AcademicFacultyService.getSingleFaculty,
    update: AcademicFacultyService.updateFaculty,
    remove: AcademicFacultyService.deleteByIdFromDB,
  },
  messages: {
    created: 'Academic faculty created successfully',
    fetchedAll: 'Academic faculties fetched successfully',
    fetchedOne: 'Academic faculty fetched successfully',
    updated: 'Academic faculty updated successfully',
    deleted: 'Academic faculty deleted successfully',
  },
});

export const AcademicFacultyController = {
  createFaculty: handlers.create,
  getSingleFaculty: handlers.getOne,
  getAllFaculties: handlers.getAll,
  updateFaculty: handlers.update,
  deleteFaculty: handlers.remove,
};
