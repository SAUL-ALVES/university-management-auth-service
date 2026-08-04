import { SortOrder } from 'mongoose';

type FiltersData = Record<string, unknown>;

const buildAndConditions = (
  searchTerm: string | undefined,
  filtersData: FiltersData,
  searchableFields: string[]
): Record<string, unknown>[] => {
  const andConditions: Record<string, unknown>[] = [];

  if (searchTerm) {
    andConditions.push({
      $or: searchableFields.map(field => ({
        [field]: {
          $regex: searchTerm,
          $options: 'i',
        },
      })),
    });
  }

  if (Object.keys(filtersData).length) {
    andConditions.push({
      $and: Object.entries(filtersData).map(([field, value]) => ({
        [field]: value,
      })),
    });
  }

  return andConditions;
};

const buildWhereConditions = (
  andConditions: Record<string, unknown>[]
): Record<string, unknown> => {
  return andConditions.length > 0 ? { $and: andConditions } : {};
};

const buildSortConditions = (
  sortBy?: string,
  sortOrder?: SortOrder
): { [key: string]: SortOrder } => {
  const sortConditions: { [key: string]: SortOrder } = {};

  if (sortBy && sortOrder) {
    sortConditions[sortBy] = sortOrder;
  }

  return sortConditions;
};

const flattenNestedObject = <T extends object>(
  nestedObject: Record<string, unknown>,
  parentKey: string,
  target: Partial<T>
): void => {
  Object.keys(nestedObject).forEach(key => {
    const nestedKey = `${parentKey}.${key}`;
    (target as Record<string, unknown>)[nestedKey] = nestedObject[key];
  });
};

export const queryHelpers = {
  buildAndConditions,
  buildWhereConditions,
  buildSortConditions,
  flattenNestedObject,
};
