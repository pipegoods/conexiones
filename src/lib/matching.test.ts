import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import type { Oferta, Solicitud } from '@/db/schema';
import { distanciaKm, normalizarLugar, puntuar, sugerenciasParaSolicitud } from './matching';

/* Fixtures mínimos: solo lo que el motor realmente lee. */

const HACE_UN_DIA = new Date(Date.now() - 86_400_000);

function solicitud(cambios: Partial<Solicitud> = {}): Solicitud {
  return {
    id: 's1',
    numero: 1,
    nombre: 'María Restrepo',
    telefono: '+573001112233',
    esParaOtraPersona: false,
    personasAfectadas: 4,
    tieneMenores: true,
    tieneAdultosMayores: false,
    tipos: ['herramientas'],
    descripcion: 'Se cayó el techo de la cocina.',
    urgencia: 'hoy',
    departamento: 'Quindío',
    municipio: 'Armenia',
    zona: 'La Esperanza',
    referenciaDireccion: null,
    lat: null,
    lng: null,
    estado: 'verificada',
    notasInternas: null,
    motivoDescarte: null,
    aceptaDatos: true,
    aceptaWhatsapp: true,
    creadoEn: HACE_UN_DIA,
    actualizadoEn: HACE_UN_DIA,
    contactadoEn: null,
    verificadoEn: null,
    conectadoEn: null,
    resueltoEn: null,
    ...cambios,
  } as Solicitud;
}

function oferta(cambios: Partial<Oferta> = {}): Oferta {
  return {
    id: 'o1',
    numero: 1,
    nombre: 'Pedro Gómez',
    telefono: '+573004445566',
    email: null,
    organizacion: null,
    tipos: ['herramientas'],
    descripcion: 'Soy carpintero, tengo herramienta propia.',
    departamento: 'Quindío',
    municipio: 'Armenia',
    zona: 'La Esperanza',
    radioKm: 10,
    lat: null,
    lng: null,
    disponibilidad: ['hoy'],
    notaDisponibilidad: null,
    estado: 'verificada',
    notasInternas: null,
    aceptaDatos: true,
    aceptaWhatsapp: true,
    creadoEn: HACE_UN_DIA,
    actualizadoEn: HACE_UN_DIA,
    verificadoEn: HACE_UN_DIA,
    ...cambios,
  } as Oferta;
}

describe('normalizarLugar', () => {
  it('cruza el mismo lugar escrito de formas distintas', () => {
    assert.equal(normalizarLugar('Bogotá D.C.'), normalizarLugar('bogota dc'));
    assert.equal(normalizarLugar(' Armenia '), normalizarLugar('ARMENIA'));
    assert.notEqual(normalizarLugar('Armenia'), normalizarLugar('Calarcá'));
  });

  it('no revienta con nulos', () => {
    assert.equal(normalizarLugar(null), '');
    assert.equal(normalizarLugar(undefined), '');
  });
});

describe('distanciaKm', () => {
  it('calcula una distancia conocida (Armenia → Pereira ≈ 40 km)', () => {
    const km = distanciaKm(4.5339, -75.6811, 4.8133, -75.6961);
    assert.ok(km > 25 && km < 45, `esperaba ~31 km, dio ${km}`);
  });

  it('da cero para el mismo punto', () => {
    assert.equal(Math.round(distanciaKm(4.5, -75.6, 4.5, -75.6)), 0);
  });
});

describe('puntuar — filtros duros', () => {
  it('descarta a quien no comparte ningún tipo de recurso', () => {
    assert.equal(puntuar(solicitud({ tipos: ['alimentos'] }), oferta({ tipos: ['transporte'] })), null);
  });

  it('descarta voluntarios pausados o archivados', () => {
    assert.equal(puntuar(solicitud(), oferta({ estado: 'pausada' })), null);
    assert.equal(puntuar(solicitud(), oferta({ estado: 'archivada' })), null);
  });

  it('descarta a quien ya está vinculado a esta solicitud', () => {
    assert.equal(puntuar(solicitud(), oferta(), { yaVinculadas: new Set(['o1']) }), null);
  });

  it('descarta a quien queda fuera de su propio radio de desplazamiento', () => {
    const lejos = puntuar(
      solicitud({ lat: 4.5339, lng: -75.6811 }),
      oferta({ lat: 4.8133, lng: -75.6961, radioKm: 5 }),
    );
    assert.equal(lejos, null);
  });

  it('acepta al mismo voluntario si su radio sí alcanza', () => {
    const cerca = puntuar(
      solicitud({ lat: 4.5339, lng: -75.6811 }),
      oferta({ lat: 4.8133, lng: -75.6961, radioKm: 50 }),
    );
    assert.ok(cerca);
  });

  it('descarta otro departamento cuando el recurso no viaja', () => {
    const fuera = puntuar(
      solicitud({ tipos: ['alimentos'] }),
      oferta({ tipos: ['alimentos'], departamento: 'Antioquia', municipio: 'Medellín', radioKm: 10 }),
    );
    assert.equal(fuera, null);
  });

  it('permite otro departamento cuando el recurso sí viaja (dinero, contactos, saber)', () => {
    const remoto = puntuar(
      solicitud({ tipos: ['dinero'] }),
      oferta({ tipos: ['dinero'], departamento: 'Antioquia', municipio: 'Medellín', radioKm: 10 }),
    );
    assert.ok(remoto);
    assert.ok(remoto.advertencias.some((a) => a.includes('otro departamento')));
  });
});

describe('puntuar — puntaje', () => {
  it('el caso perfecto saca puntaje alto y sin advertencias', () => {
    const r = puntuar(solicitud(), oferta());
    assert.ok(r);
    assert.ok(r.score >= 90, `esperaba >=90, dio ${r.score}`);
    assert.deepEqual(r.advertencias, []);
  });

  it('cubrir solo parte de lo pedido baja el puntaje y se explica', () => {
    const completo = puntuar(solicitud({ tipos: ['herramientas'] }), oferta({ tipos: ['herramientas'] }))!;
    const parcial = puntuar(
      solicitud({ tipos: ['herramientas', 'alimentos', 'transporte'] }),
      oferta({ tipos: ['herramientas'] }),
    )!;

    assert.ok(parcial.score < completo.score);
    assert.ok(parcial.razones.some((r) => r.includes('1 de 3')));
  });

  it('avisa cuando la disponibilidad no alcanza para la urgencia', () => {
    const r = puntuar(solicitud({ urgencia: 'inmediata' }), oferta({ disponibilidad: ['fines_de_semana'] }))!;
    assert.ok(r.advertencias.some((a) => a.includes('no cubre esta urgencia')));
  });

  it('avisa cuando el voluntario no ha sido verificado', () => {
    const r = puntuar(solicitud(), oferta({ estado: 'nueva' }))!;
    assert.ok(r.advertencias.some((a) => a.includes('no ha sido verificado')));
    assert.ok(r.score < puntuar(solicitud(), oferta())!.score);
  });

  it('penaliza a un voluntario saturado', () => {
    const libre = puntuar(solicitud(), oferta())!;
    const saturado = puntuar(solicitud(), oferta(), { carga: new Map([['o1', 5]]) })!;

    assert.ok(saturado.score < libre.score);
    assert.ok(saturado.advertencias.some((a) => a.includes('saturado')));
  });

  it('penaliza registros viejos que probablemente ya no aplican', () => {
    const viejo = puntuar(
      solicitud(),
      oferta({ creadoEn: new Date(Date.now() - 40 * 86_400_000) }),
    )!;
    assert.ok(viejo.advertencias.some((a) => a.includes('sigue disponible')));
  });

  it('nunca se sale del rango 0-100', () => {
    const r = puntuar(solicitud(), oferta({ estado: 'nueva' }), { carga: new Map([['o1', 20]]) })!;
    assert.ok(r.score >= 0 && r.score <= 100);
  });
});

describe('sugerenciasParaSolicitud', () => {
  it('ordena de mejor a peor y esconde los cruces débiles', () => {
    const s = solicitud({ tipos: ['herramientas', 'trabajo_fisico'] });

    const candidatos = [
      oferta({ id: 'flojo', tipos: ['herramientas'], municipio: 'Calarcá', estado: 'nueva', radioKm: 5 }),
      oferta({ id: 'ideal', tipos: ['herramientas', 'trabajo_fisico'] }),
      oferta({ id: 'medio', tipos: ['herramientas'], disponibilidad: ['esta_semana'] }),
      oferta({ id: 'ajeno', tipos: ['alimentos'] }),
    ];

    const resultado = sugerenciasParaSolicitud(s, candidatos);
    const ids = resultado.map((r) => r.oferta.id);

    assert.equal(ids[0], 'ideal', 'el que cubre todo debe ir primero');
    assert.ok(!ids.includes('ajeno'), 'quien no comparte recursos no debe aparecer');

    for (let i = 1; i < resultado.length; i++) {
      assert.ok(resultado[i - 1].score >= resultado[i].score, 'debe venir ordenado de mayor a menor');
    }
  });

  it('respeta el límite pedido', () => {
    const candidatos = Array.from({ length: 30 }, (_, i) => oferta({ id: `o${i}` }));
    assert.equal(sugerenciasParaSolicitud(solicitud(), candidatos, {}, 5).length, 5);
  });

  it('devuelve lista vacía cuando no hay nadie que encaje', () => {
    assert.deepEqual(sugerenciasParaSolicitud(solicitud(), []), []);
  });
});
