'use client';

import { useMemo, useState } from 'react';

import { DEPARTMENTS } from '@/lib/catalogs';
import { municipalityOptions } from '@/lib/locations';

import { SearchableSelectField } from './SearchableSelectField';
import { SelectField } from './Fields';

type LocationFieldsProps = {
  departmentError?: string;
  municipalityError?: string;
  defaultDepartment?: string;
  defaultMunicipality?: string;
};

const DEPARTMENT_OPTIONS = DEPARTMENTS.map((department) => ({ value: department, text: department }));

export function LocationFields({
  departmentError,
  municipalityError,
  defaultDepartment = '',
  defaultMunicipality = '',
}: LocationFieldsProps) {
  const [department, setDepartment] = useState(defaultDepartment);

  const municipalityList = useMemo(() => municipalityOptions(department), [department]);

  return (
    <>
      <SelectField
        name="department"
        label="Departamento"
        options={DEPARTMENT_OPTIONS}
        searchPlaceholder="Buscar departamento…"
        error={departmentError}
        defaultValue={defaultDepartment}
        required
        onValueChange={(value) => setDepartment(value)}
      />

      {department ? (
        <SearchableSelectField
          key={department}
          name="municipality"
          label="Municipio o ciudad"
          options={municipalityList}
          searchPlaceholder="Buscar municipio…"
          placeholder="Selecciona tu municipio…"
          emptyMessage="No encontramos ese municipio en el departamento seleccionado."
          error={municipalityError}
          defaultValue={defaultMunicipality}
          required
        />
      ) : (
        <div>
          <p className="text-sm font-bold text-tinta">
            Municipio o ciudad<span className="ml-1 text-marca-rosa">*</span>
          </p>
          <p className={`${'mt-2 w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-[16px] text-neutral-400'}`}>
            Primero selecciona un departamento
          </p>
          <input type="hidden" name="municipality" value="" />
          {municipalityError && (
            <p role="alert" className="mt-1.5 text-sm font-medium text-red-600">
              {municipalityError}
            </p>
          )}
        </div>
      )}
    </>
  );
}
