import { createCrudControllerWithoutCreate } from '../../../shared/crudControllerFactory';
import { facultyFilterableFields } from './faculty.constant';
import { IFaculty, IFacultyFilters } from './faculty.interface';
import { FacultyService } from './faculty.service';

const handlers = createCrudControllerWithoutCreate<
  IFaculty,
  IFacultyFilters
>({
  filterableFields: facultyFilterableFields,
  service: {
    getAll: FacultyService.getAllFaculties,
    getOne: FacultyService.getSingleFaculty,
    update: FacultyService.updateFaculty,
    remove: FacultyService.deleteFaculty,
  },
  messages: {
    fetchedAll: 'Faculties fetched successfully !',
    fetchedOne: 'Faculty fetched successfully !',
    updated: 'Faculty updated successfully !',
    deleted: 'Faculty deleted successfully !',
  },
});

export const FacultyController = {
  getSingleFaculty: handlers.getOne,
  getAllFaculties: handlers.getAll,
  updateFaculty: handlers.update,
  deleteFaculty: handlers.remove,
};
