import data from './municipalities-by-department.json';

import type { DEPARTMENTS } from '@/lib/catalogs';

export type DepartmentName = (typeof DEPARTMENTS)[number];

const municipalitiesByDepartment = data as Record<DepartmentName, string[]>;

/** Sorted municipality names for a department. */
export function municipalitiesForDepartment(department: string): readonly string[] {
  return municipalitiesByDepartment[department as DepartmentName] ?? [];
}

export function isValidMunicipality(department: string, municipality: string): boolean {
  const list = municipalitiesForDepartment(department);
  const normalized = municipality.trim().toLowerCase();
  return list.some((name) => name.toLowerCase() === normalized);
}

export function municipalityOptions(department: string): readonly { value: string; text: string }[] {
  return municipalitiesForDepartment(department).map((name) => ({ value: name, text: name }));
}
