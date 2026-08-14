'use client';

import { useActionState } from 'react';

import { submitOffer, type FormState } from '@/app/actions';
import { SubmitButton } from '@/components/form/SubmitButton';
import {
  CheckboxField,
  SelectField,
  TextField,
  TextareaField,
  OptionGroup,
  ErrorSummary,
} from '@/components/form/Fields';
import { HoneypotFields } from '@/components/form/HoneypotFields';
import { LocationFields } from '@/components/form/LocationFields';
import { NetworkStatusBanner } from '@/components/form/NetworkStatusBanner';
import { PhoneField } from '@/components/form/PhoneField';
import { FormSection } from '@/components/form/Shell';
import {
  AVAILABILITIES,
  AVAILABILITY_LABELS,
  RADIUS_OPTIONS_KM,
  RADIUS_LABELS,
  RESOURCES,
  RESOURCE_TYPES,
} from '@/lib/catalogs';

const INITIAL_STATE: FormState = {};

const RESOURCE_OPTIONS = RESOURCE_TYPES.map((t) => ({
  value: t,
  text: RESOURCES[t].offering,
  emoji: RESOURCES[t].emoji,
}));

const AVAILABILITY_OPTIONS = AVAILABILITIES.map((d) => ({
  value: d,
  text: AVAILABILITY_LABELS[d],
}));

const RADIUS_OPTIONS = RADIUS_OPTIONS_KM.map((r) => ({ value: String(r), text: RADIUS_LABELS[r] }));

export function OfferForm() {
  const [state, action] = useActionState(submitOffer, INITIAL_STATE);
  const errors = state.errors ?? {};

  return (
    <form action={action} className="relative space-y-9" noValidate>
      <HoneypotFields />
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
        <p className="text-sm leading-relaxed text-emerald-900">
          <strong className="font-bold">No te preguntamos qué quieres donar.</strong> Te preguntamos qué puedes
          poner a disposición: un oficio, un vehículo, unas horas, un espacio. Eso suele resolver más que el
          dinero.
        </p>
      </div>

      <NetworkStatusBanner />
      <ErrorSummary errors={state.errors} />

      {state.message && (
        <div role="alert" className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-800">
          {state.message}
        </div>
      )}

      <FormSection
        step={1}
        title="¿Qué puedes poner a disposición?"
        description="Selecciona todo lo que aplique."
      >
        <OptionGroup
          name="types"
          label="Capacidad"
          options={RESOURCE_OPTIONS}
          error={errors.types}
          accent="green"
          required
        />

        <TextareaField
          name="description"
          label="¿Qué puedes hacer exactamente?"
          placeholder="Ejemplo: Soy carpintero y puedo reparar puertas, ventanas y techos. También tengo herramienta eléctrica propia."
          hint="Sé concreto. “Tengo una camioneta y puedo transportar materiales por las tardes” vale muchísimo más que “quiero ayudar”."
          error={errors.description}
          required
        />
      </FormSection>

      <FormSection step={2} title="¿Dónde estás y hasta dónde puedes ir?">
        <LocationFields departmentError={errors.department} municipalityError={errors.municipality} />
        <TextField name="zone" label="Barrio, vereda o zona" error={errors.zone} />
        <SelectField
          name="radiusKm"
          label="¿Hasta dónde puedes desplazarte?"
          options={RADIUS_OPTIONS}
          defaultValue="10"
          hint="Esto evita que te propongamos casos a los que no alcanzas a llegar."
          error={errors.radiusKm}
          required
        />
      </FormSection>

      <FormSection step={3} title="¿Cuándo puedes?">
        <OptionGroup
          name="availability"
          label="Disponibilidad"
          options={AVAILABILITY_OPTIONS}
          error={errors.availability}
          accent="green"
          required
        />
        <TextField
          name="availabilityNote"
          label="¿Algún horario en particular?"
          placeholder="Ejemplo: Entre semana solo después de las 5 p.m."
          error={errors.availabilityNote}
        />
      </FormSection>

      <FormSection step={4} title="¿Quién eres?">
        <TextField name="name" label="Nombre y apellido" autoComplete="name" error={errors.name} required />
        <PhoneField
          hint="Te escribimos solo cuando haya un caso verificado que encaje con lo que ofreces."
          error={errors.phone}
        />
        <TextField
          name="email"
          label="Correo electrónico (opcional)"
          type="email"
          inputMode="email"
          autoComplete="email"
          error={errors.email}
        />
        <TextField
          name="organization"
          label="Empresa u organización (opcional)"
          placeholder="Si ayudas a nombre de una empresa, fundación o parroquia"
          error={errors.organization}
        />
      </FormSection>

      <FormSection step={5} title="Autorización">
        <CheckboxField
          name="acceptsDataUse"
          error={errors.acceptsDataUse}
          label={
            <>
              Autorizo a Conexiones a tratar mis datos personales para contactarme cuando haya una necesidad que
              encaje con lo que puedo aportar, conforme a la Ley 1581 de 2012. Entiendo que mis datos no serán
              publicados y que puedo pedir su eliminación en cualquier momento.
            </>
          }
        />

        <SubmitButton accent="green">Ponerme a disposición</SubmitButton>

        <p className="text-center text-xs text-neutral-500">
          Registrarte no te compromete a nada. Cuando te propongamos un caso, puedes decir que no.
        </p>
      </FormSection>
    </form>
  );
}
