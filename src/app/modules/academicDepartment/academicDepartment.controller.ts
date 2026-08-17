import createCrudController from '../../../shared/crudControllerFactory';
import { academicDepartmentFilterableFields } from './academicDepartment.constants';
import {
  IAcademicDepartment,
  IAcademicDepartmentFilters,
} from './academicDepartment.interfaces';
import { AcademicDepartmentService } from './academicDepartment.service';

const handlers = createCrudController<
  IAcademicDepartment,
  IAcademicDepartmentFilters
>({
  filterableFields: academicDepartmentFilterableFields,
  service: {
    create: AcademicDepartmentService.createDepartment,
    getAll: AcademicDepartmentService.getAllDepartments,
    getOne: AcademicDepartmentService.getSingleDepartment,
    update: AcademicDepartmentService.updateDepartment,
    remove: AcademicDepartmentService.deleteDepartment,
  },
  messages: {
    created: 'Academic department created successfully',
    fetchedAll: 'Academic departments fetched successfully',
    fetchedOne: 'Academic department fetched successfully',
    updated: 'Academic department updated successfully',
    deleted: 'Academic department deleted successfully',
  },
});

export const AcademicDepartmentController = {
  createDepartment: handlers.create,
  getSingleDepartment: handlers.getOne,
  getAllDepartments: handlers.getAll,
  updateDepartment: handlers.update,
  deleteDepartment: handlers.remove,
};
