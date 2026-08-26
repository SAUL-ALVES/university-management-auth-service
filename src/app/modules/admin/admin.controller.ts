import { createCrudControllerWithoutCreate } from '../../../shared/crudControllerFactory';
import { adminFilterableFields } from './admin.constant';
import { IAdmin, IAdminFilters } from './admin.interface';
import { AdminService } from './admin.service';

const handlers = createCrudControllerWithoutCreate<
  IAdmin,
  IAdminFilters
>({
  filterableFields: adminFilterableFields,
  service: {
    getAll: AdminService.getAllAdmins,
    getOne: AdminService.getSingleAdmin,
    update: AdminService.updateAdmin,
    remove: AdminService.deleteAdmin,
  },
  messages: {
    fetchedAll: 'Admins fetched successfully !',
    fetchedOne: 'Admin fetched successfully !',
    updated: 'Admin updated successfully !',
    deleted: 'Admin deleted successfully !',
  },
});

export const AdminController = {
  getSingleAdmin: handlers.getOne,
  getAllAdmins: handlers.getAll,
  updateAdmin: handlers.update,
  deleteAdmin: handlers.remove,
};