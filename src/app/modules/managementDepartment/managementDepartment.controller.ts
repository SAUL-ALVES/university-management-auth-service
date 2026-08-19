import createCrudController from '../../../shared/crudControllerFactory';
import { managementDepartmentFilterableFields } from './managementDepartment.constant';
import {
  IManagementDepartment,
  IManagementDepartmentFilters,
} from './managementDepartment.inerface';
import { ManagementDepartmentService } from './managementDepartment.service';

const handlers = createCrudController<
  IManagementDepartment,
  IManagementDepartmentFilters
>({
  filterableFields: managementDepartmentFilterableFields,
  service: {
    create: ManagementDepartmentService.createDepartment,
    getAll: ManagementDepartmentService.getAllDepartments,
    getOne: ManagementDepartmentService.getSingleDepartment,
    update: ManagementDepartmentService.updateDepartment,
    remove: ManagementDepartmentService.deleteDepartment,
  },
  messages: {
    created: 'Management department created successfully',
    fetchedAll: 'Management departments fetched successfully',
    fetchedOne: 'Management department fetched successfully',
    updated: 'Management department updated successfully',
    deleted: 'Management department deleted successfully',
  },
});

export const ManagementDepartmentController = {
  createDepartment: handlers.create,
  getAllDepartments: handlers.getAll,
  getSingleDepartment: handlers.getOne,
  updateDepartment: handlers.update,
  deleteDepartment: handlers.remove,
};
