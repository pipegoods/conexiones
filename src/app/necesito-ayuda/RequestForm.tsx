'use client';

import { useActionState } from 'react';

import { submitRequest, type FormState } from '@/app/actions';
import { SubmitButton } from '@/components/form/SubmitButton';
import {
  CheckboxField,
  SelectField,
  TextField,
  TextareaField,
  OptionGroup,
  ErrorSummary,
} from '@/components/form/Fields';
import { EmergencyNotice, FormSection } from '@/components/form/Shell';
import {
  DEPARTMENTS,
  RESOURCES,
  RESOURCE_TYPES,
  URGENCIES,
  URGENCY_LABELS,
} from '@/lib/catalogs';

const INITIAL_STATE: FormState = {};

const RESOURCE_OPTIONS = RESOURCE_TYPES.map((t) => ({
  value: t,
  text: RESOURCES[t].seeking,
  emoji: RESOURCES[t].emoji,
}));

const URGENCY_OPTIONS = URGENCIES.map((u) => ({ value: u, text: URGENCY_LABELS[u] }));

const DEPARTMENT_OPTIONS = DEPARTMENTS.map((d) => ({ value: d, text: d }));

export function RequestForm() {
  const [state, action] = useActionState(submitRequest, INITIAL_STATE);
  const errors = state.errors ?? {};

  return (
    <form action={action} className="space-y-9" noValidate>
      <EmergencyNotice />
      <ErrorSummary errors={state.errors} />

      {state.message && (
        <div role="alert" className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-800">
          {state.message}
        </div>
      )}

      <FormSection
        step={1}
        title="¿Qué necesitas?"
        description="Selecciona todo lo que aplique. Entre más preciso, más rápido encontramos a quien pueda ayudar."
      >
        <OptionGroup
          name="types"
          label="Tipo de ayuda"
          options={RESOURCE_OPTIONS}
          error={errors.types}
          required
        />

        <TextareaField
          name="description"
          label="Cuéntanos qué pasó y qué necesitas exactamente"
          placeholder="Ejemplo: El temblor tumbó el techo de la cocina y no tenemos dónde cocinar. Somos 4 personas, dos son niños. Necesitamos tejas y alguien que sepa instalarlas."
          hint="Escribe como le contarías a un vecino. Los detalles son los que hacen que alguien pueda decir “yo tengo eso”."
          error={errors.description}
          required
        />

        <OptionGroup
          name="urgency"
          label="¿Para cuándo la necesitas?"
          options={URGENCY_OPTIONS}
          multiple={false}
          error={errors.urgency}
          required
        />
      </FormSection>

      <FormSection step={2} title="¿Dónde estás?" description="Solo el equipo verificador ve esta información.">
        <SelectField
          name="department"
          label="Departamento"
          options={DEPARTMENT_OPTIONS}
          searchPlaceholder="Buscar departamento…"
          error={errors.department}
          required
        />
        <TextField
          name="municipality"
          label="Municipio o ciudad"
          placeholder="Ejemplo: Armenia"
          error={errors.municipality}
          required
        />
        <TextField
          name="zona"
          label="Barrio, vereda o zona"
          placeholder="Ejemplo: Barrio La Esperanza"
          error={errors.zone}
        />
        <TextField
          name="addressReference"
          label="Un punto de referencia para llegar"
          placeholder="Ejemplo: A dos cuadras de la escuela, casa de portón azul"
          hint="No necesitamos tu dirección exacta todavía. La pedimos solo cuando ya hay alguien confirmado para ayudarte."
          error={errors.addressReference}
        />
      </FormSection>

      <FormSection step={3} title="¿Quién eres?" description="Necesitamos poder llamarte para verificar la solicitud.">
        <TextField
          name="name"
          label="Nombre y apellido"
          autoComplete="name"
          error={errors.name}
          required
        />
        <TextField
          name="phone"
          label="Número de WhatsApp"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          placeholder="300 123 4567"
          hint="Por aquí te vamos a contactar. Es el único canal que usamos."
          error={errors.phone}
          required
        />
        <TextField
          name="affectedPeople"
          label="¿Cuántas personas están afectadas?"
          type="number"
          inputMode="numeric"
          defaultValue="1"
          error={errors.affectedPeople}
          required
        />

        <div className="space-y-3 rounded-2xl bg-neutral-50 p-5">
          <CheckboxField
            name="isForSomeoneElse"
            label="Estoy pidiendo ayuda para otra persona, no para mí"
          />
          <CheckboxField name="hasMinors" label="Hay niños o niñas en el hogar" />
          <CheckboxField name="hasElderly" label="Hay adultos mayores o personas con discapacidad" />
        </div>
      </FormSection>

      <FormSection step={4} title="Autorización">
        <CheckboxField
          name="acceptsDataUse"
          error={errors.acceptsDataUse}
          label={
            <>
              Autorizo a Conexiones a tratar mis datos personales con el único fin de verificar esta solicitud y
              conectarme con alguien que pueda ayudarme, conforme a la Ley 1581 de 2012. Entiendo que mis datos no
              serán publicados y que puedo pedir su eliminación en cualquier momento.
            </>
          }
        />

        <SubmitButton accent="pink">Enviar mi solicitud</SubmitButton>

        <p className="text-center text-xs text-neutral-500">
          Conexiones es gratuito. Nunca te vamos a pedir dinero ni datos bancarios.
        </p>
      </FormSection>
    </form>
  );
}
