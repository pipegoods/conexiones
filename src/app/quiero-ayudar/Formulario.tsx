'use client';

import { useActionState } from 'react';

import { registrarOferta, type EstadoFormulario } from '@/app/acciones';
import { BotonEnviar } from '@/components/formulario/BotonEnviar';
import {
  CampoCheckbox,
  CampoSelect,
  CampoTexto,
  CampoTextarea,
  GrupoOpciones,
  ResumenErrores,
} from '@/components/formulario/Campos';
import { Seccion } from '@/components/formulario/Cascaron';
import {
  DEPARTAMENTOS,
  DISPONIBILIDADES,
  DISPONIBILIDAD_LABEL,
  RADIOS_KM,
  RADIO_LABEL,
  RECURSOS,
  TIPOS_RECURSO,
} from '@/lib/catalogos';

const ESTADO_INICIAL: EstadoFormulario = {};

const OPCIONES_RECURSOS = TIPOS_RECURSO.map((t) => ({
  valor: t,
  texto: RECURSOS[t].ofrezco,
  emoji: RECURSOS[t].emoji,
}));

const OPCIONES_DISPONIBILIDAD = DISPONIBILIDADES.map((d) => ({
  valor: d,
  texto: DISPONIBILIDAD_LABEL[d],
}));

const OPCIONES_RADIO = RADIOS_KM.map((r) => ({ valor: String(r), texto: RADIO_LABEL[r] }));

const OPCIONES_DEPARTAMENTO = DEPARTAMENTOS.map((d) => ({ valor: d, texto: d }));

export function FormularioOferta() {
  const [estado, accion] = useActionState(registrarOferta, ESTADO_INICIAL);
  const e = estado.errores ?? {};

  return (
    <form action={accion} className="space-y-9" noValidate>
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
        <p className="text-sm leading-relaxed text-emerald-900">
          <strong className="font-bold">No te preguntamos qué quieres donar.</strong> Te preguntamos qué puedes
          poner a disposición: un oficio, un vehículo, unas horas, un espacio. Eso suele resolver más que el
          dinero.
        </p>
      </div>

      <ResumenErrores errores={estado.errores} />

      {estado.mensaje && (
        <div role="alert" className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-800">
          {estado.mensaje}
        </div>
      )}

      <Seccion
        numero={1}
        titulo="¿Qué puedes poner a disposición?"
        descripcion="Selecciona todo lo que aplique."
      >
        <GrupoOpciones
          nombre="tipos"
          etiqueta="Capacidad"
          opciones={OPCIONES_RECURSOS}
          error={e.tipos}
          acento="verde"
          requerido
        />

        <CampoTextarea
          nombre="descripcion"
          etiqueta="¿Qué puedes hacer exactamente?"
          placeholder="Ejemplo: Soy carpintero y puedo reparar puertas, ventanas y techos. También tengo herramienta eléctrica propia."
          ayuda="Sé concreto. “Tengo una camioneta y puedo transportar materiales por las tardes” vale muchísimo más que “quiero ayudar”."
          error={e.descripcion}
          requerido
        />
      </Seccion>

      <Seccion numero={2} titulo="¿Dónde estás y hasta dónde puedes ir?">
        <CampoSelect
          nombre="departamento"
          etiqueta="Departamento"
          opciones={OPCIONES_DEPARTAMENTO}
          error={e.departamento}
          requerido
        />
        <CampoTexto
          nombre="municipio"
          etiqueta="Municipio o ciudad"
          placeholder="Ejemplo: Armenia"
          error={e.municipio}
          requerido
        />
        <CampoTexto nombre="zona" etiqueta="Barrio, vereda o zona" error={e.zona} />
        <CampoSelect
          nombre="radioKm"
          etiqueta="¿Hasta dónde puedes desplazarte?"
          opciones={OPCIONES_RADIO}
          defaultValue="10"
          ayuda="Esto evita que te propongamos casos a los que no alcanzas a llegar."
          error={e.radioKm}
          requerido
        />
      </Seccion>

      <Seccion numero={3} titulo="¿Cuándo puedes?">
        <GrupoOpciones
          nombre="disponibilidad"
          etiqueta="Disponibilidad"
          opciones={OPCIONES_DISPONIBILIDAD}
          error={e.disponibilidad}
          acento="verde"
          requerido
        />
        <CampoTexto
          nombre="notaDisponibilidad"
          etiqueta="¿Algún horario en particular?"
          placeholder="Ejemplo: Entre semana solo después de las 5 p.m."
          error={e.notaDisponibilidad}
        />
      </Seccion>

      <Seccion numero={4} titulo="¿Quién eres?">
        <CampoTexto nombre="nombre" etiqueta="Nombre y apellido" autoComplete="name" error={e.nombre} requerido />
        <CampoTexto
          nombre="telefono"
          etiqueta="Número de WhatsApp"
          tipo="tel"
          inputMode="tel"
          autoComplete="tel"
          placeholder="300 123 4567"
          ayuda="Te escribimos solo cuando haya un caso verificado que encaje con lo que ofreces."
          error={e.telefono}
          requerido
        />
        <CampoTexto
          nombre="email"
          etiqueta="Correo electrónico (opcional)"
          tipo="email"
          inputMode="email"
          autoComplete="email"
          error={e.email}
        />
        <CampoTexto
          nombre="organizacion"
          etiqueta="Empresa u organización (opcional)"
          placeholder="Si ayudas a nombre de una empresa, fundación o parroquia"
          error={e.organizacion}
        />
      </Seccion>

      <Seccion numero={5} titulo="Autorización">
        <CampoCheckbox
          nombre="aceptaDatos"
          error={e.aceptaDatos}
          etiqueta={
            <>
              Autorizo a Conexiones a tratar mis datos personales para contactarme cuando haya una necesidad que
              encaje con lo que puedo aportar, conforme a la Ley 1581 de 2012. Entiendo que mis datos no serán
              publicados y que puedo pedir su eliminación en cualquier momento.
            </>
          }
        />

        <BotonEnviar acento="verde">Ponerme a disposición</BotonEnviar>

        <p className="text-center text-xs text-neutral-500">
          Registrarte no te compromete a nada. Cuando te propongamos un caso, puedes decir que no.
        </p>
      </Seccion>
    </form>
  );
}
