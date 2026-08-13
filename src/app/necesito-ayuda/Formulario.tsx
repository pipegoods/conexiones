'use client';

import { useActionState } from 'react';

import { registrarSolicitud, type EstadoFormulario } from '@/app/acciones';
import { BotonEnviar } from '@/components/formulario/BotonEnviar';
import {
  CampoCheckbox,
  CampoSelect,
  CampoTexto,
  CampoTextarea,
  GrupoOpciones,
  ResumenErrores,
} from '@/components/formulario/Campos';
import { AvisoEmergencia, Seccion } from '@/components/formulario/Cascaron';
import {
  DEPARTAMENTOS,
  RECURSOS,
  TIPOS_RECURSO,
  URGENCIAS,
  URGENCIA_LABEL,
} from '@/lib/catalogos';

const ESTADO_INICIAL: EstadoFormulario = {};

const OPCIONES_RECURSOS = TIPOS_RECURSO.map((t) => ({
  valor: t,
  texto: RECURSOS[t].necesito,
  emoji: RECURSOS[t].emoji,
}));

const OPCIONES_URGENCIA = URGENCIAS.map((u) => ({ valor: u, texto: URGENCIA_LABEL[u] }));

const OPCIONES_DEPARTAMENTO = DEPARTAMENTOS.map((d) => ({ valor: d, texto: d }));

export function FormularioSolicitud() {
  const [estado, accion] = useActionState(registrarSolicitud, ESTADO_INICIAL);
  const e = estado.errores ?? {};

  return (
    <form action={accion} className="space-y-9" noValidate>
      <AvisoEmergencia />
      <ResumenErrores errores={estado.errores} />

      {estado.mensaje && (
        <div role="alert" className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-800">
          {estado.mensaje}
        </div>
      )}

      <Seccion
        numero={1}
        titulo="¿Qué necesitas?"
        descripcion="Selecciona todo lo que aplique. Entre más preciso, más rápido encontramos a quien pueda ayudar."
      >
        <GrupoOpciones
          nombre="tipos"
          etiqueta="Tipo de ayuda"
          opciones={OPCIONES_RECURSOS}
          error={e.tipos}
          requerido
        />

        <CampoTextarea
          nombre="descripcion"
          etiqueta="Cuéntanos qué pasó y qué necesitas exactamente"
          placeholder="Ejemplo: El temblor tumbó el techo de la cocina y no tenemos dónde cocinar. Somos 4 personas, dos son niños. Necesitamos tejas y alguien que sepa instalarlas."
          ayuda="Escribe como le contarías a un vecino. Los detalles son los que hacen que alguien pueda decir “yo tengo eso”."
          error={e.descripcion}
          requerido
        />

        <GrupoOpciones
          nombre="urgencia"
          etiqueta="¿Para cuándo la necesitas?"
          opciones={OPCIONES_URGENCIA}
          multiple={false}
          error={e.urgencia}
          requerido
        />
      </Seccion>

      <Seccion numero={2} titulo="¿Dónde estás?" descripcion="Solo el equipo verificador ve esta información.">
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
        <CampoTexto
          nombre="zona"
          etiqueta="Barrio, vereda o zona"
          placeholder="Ejemplo: Barrio La Esperanza"
          error={e.zona}
        />
        <CampoTexto
          nombre="referenciaDireccion"
          etiqueta="Un punto de referencia para llegar"
          placeholder="Ejemplo: A dos cuadras de la escuela, casa de portón azul"
          ayuda="No necesitamos tu dirección exacta todavía. La pedimos solo cuando ya hay alguien confirmado para ayudarte."
          error={e.referenciaDireccion}
        />
      </Seccion>

      <Seccion numero={3} titulo="¿Quién eres?" descripcion="Necesitamos poder llamarte para verificar la solicitud.">
        <CampoTexto
          nombre="nombre"
          etiqueta="Nombre y apellido"
          autoComplete="name"
          error={e.nombre}
          requerido
        />
        <CampoTexto
          nombre="telefono"
          etiqueta="Número de WhatsApp"
          tipo="tel"
          inputMode="tel"
          autoComplete="tel"
          placeholder="300 123 4567"
          ayuda="Por aquí te vamos a contactar. Es el único canal que usamos."
          error={e.telefono}
          requerido
        />
        <CampoTexto
          nombre="personasAfectadas"
          etiqueta="¿Cuántas personas están afectadas?"
          tipo="number"
          inputMode="numeric"
          defaultValue="1"
          error={e.personasAfectadas}
          requerido
        />

        <div className="space-y-3 rounded-2xl bg-neutral-50 p-5">
          <CampoCheckbox
            nombre="esParaOtraPersona"
            etiqueta="Estoy pidiendo ayuda para otra persona, no para mí"
          />
          <CampoCheckbox nombre="tieneMenores" etiqueta="Hay niños o niñas en el hogar" />
          <CampoCheckbox nombre="tieneAdultosMayores" etiqueta="Hay adultos mayores o personas con discapacidad" />
        </div>
      </Seccion>

      <Seccion numero={4} titulo="Autorización">
        <CampoCheckbox
          nombre="aceptaDatos"
          error={e.aceptaDatos}
          etiqueta={
            <>
              Autorizo a Conexiones a tratar mis datos personales con el único fin de verificar esta solicitud y
              conectarme con alguien que pueda ayudarme, conforme a la Ley 1581 de 2012. Entiendo que mis datos no
              serán publicados y que puedo pedir su eliminación en cualquier momento.
            </>
          }
        />

        <BotonEnviar acento="rosa">Enviar mi solicitud</BotonEnviar>

        <p className="text-center text-xs text-neutral-500">
          Conexiones es gratuito. Nunca te vamos a pedir dinero ni datos bancarios.
        </p>
      </Seccion>
    </form>
  );
}
