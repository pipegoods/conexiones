'use client';

import { useMemo, useState } from 'react';

import { SelectField } from '@/components/form/Fields';
import { DEPARTMENTS, URGENCIES, URGENCY_LABELS } from '@/lib/catalogs';
import { municipalityOptions } from '@/lib/locations';

type RequestFilterFieldsProps = {
  status?: string;
  search: string;
  department?: string;
  municipality?: string;
  urgency?: string;
};

export function RequestFilterFields({
  status,
  search,
  department: initialDepartment = '',
  municipality = '',
  urgency = '',
}: RequestFilterFieldsProps) {
  const [department, setDepartment] = useState(initialDepartment);

  const departmentOptions = DEPARTMENTS.map((name) => ({ value: name, text: name }));
  const municipalityList = useMemo(() => municipalityOptions(department), [department]);
  const urgencyOptions = URGENCIES.map((value) => ({ value, text: URGENCY_LABELS[value] }));

  return (
    <form method="get" className="mt-4 space-y-4">
      {status && <input type="hidden" name="estado" value={status} />}

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <SelectField
          name="department"
          label="Departamento"
          options={[{ value: '', text: 'Todos' }, ...departmentOptions]}
          defaultValue={initialDepartment}
          placeholder="Todos"
          searchable
          searchPlaceholder="Buscar departamento…"
          onValueChange={setDepartment}
        />
        <SelectField
          key={department || 'none'}
          name="municipality"
          label="Municipio"
          options={[{ value: '', text: 'Todos' }, ...municipalityList]}
          defaultValue={municipality}
          placeholder={department ? 'Todos' : 'Elige departamento primero'}
          searchable={municipalityList.length >= 10}
          searchPlaceholder="Buscar municipio…"
        />
        <SelectField
          name="urgency"
          label="Urgencia"
          options={[{ value: '', text: 'Todas' }, ...urgencyOptions]}
          defaultValue={urgency}
          placeholder="Todas"
        />
      </div>

      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          type="search"
          name="q"
          defaultValue={search}
          placeholder="Buscar por nombre, teléfono, municipio o descripción…"
          aria-label="Buscar solicitudes"
          className="flex-1 rounded-xl border border-neutral-200 px-4 py-2.5 text-sm focus:border-marca-morado focus:ring-2 focus:ring-marca-morado/20"
        />
        <button
          type="submit"
          className="rounded-xl bg-tinta px-5 py-2.5 text-sm font-bold text-white transition hover:brightness-125"
        >
          Filtrar
        </button>
      </div>
    </form>
  );
}
