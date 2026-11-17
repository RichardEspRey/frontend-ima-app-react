import { describe, it, expect } from 'vitest';
import {
  corteDiario,
  relojEnZona,
  avisosDeDiesel,
  avisosSinFallas,
  avisosSinInspeccion,
  avisosDeProgramacion,
  avisosDeDespacho,
  avisosDeDocumentos,
  documentosDeViaje,
  recortarAvisos,
  fechaLocal,
  CATEGORIA_AVISO,
  categoriasPorDefecto,
} from '../model/avisos';

describe('corteDiario', () => {
  it('antes de las 10 de Monterrey el corte vigente es el de ayer', () => {
    const corte = corteDiario(new Date('2026-11-16T15:59:59Z'));
    expect(corte.fecha).toBe('2026-11-15');
    expect(corte.momento.toISOString()).toBe('2026-11-15T16:00:00.000Z');
  });

  it('a las 10:00 de Monterrey empieza el corte de hoy', () => {
    const corte = corteDiario(new Date('2026-11-16T16:00:00Z'));
    expect(corte.fecha).toBe('2026-11-16');
    expect(corte.momento.toISOString()).toBe('2026-11-16T16:00:00.000Z');
  });

  it('no depende de la hora del servidor ni de UTC: 03:00 UTC sigue siendo el día anterior', () => {
    const corte = corteDiario(new Date('2026-11-17T03:00:00Z'));
    expect(corte.fecha).toBe('2026-11-16');
    expect(corte.momento.toISOString()).toBe('2026-11-16T16:00:00.000Z');
  });

  it('cruza de mes sin romperse', () => {
    expect(corteDiario(new Date('2026-12-01T10:00:00Z')).fecha).toBe('2026-11-30');
  });

  it('lee el reloj de la zona pedida', () => {
    expect(relojEnZona(new Date('2026-11-16T16:05:09Z'))).toMatchObject({ dia: 16, hora: 10, minuto: 5, segundo: 9 });
  });
});

describe('avisosDeDiesel', () => {
  const corte = { fecha: '2026-11-16', momento: new Date(2026, 10, 16, 10, 0, 0) };

  it('suma los acumulados y da un aviso por tipo', () => {
    const avisos = avisosDeDiesel(
      [
        { state_pending_count: '2', fleetone_pending_count: '1' },
        { state_pending_count: '0', fleetone_pending_count: '3' },
        { state_pending_count: '1', fleetone_pending_count: 0 },
      ],
      corte
    );
    expect(avisos.map((a) => a.id)).toEqual(['diesel-state-2026-11-16', 'diesel-fleetone-2026-11-16']);
    expect(avisos[0].subtitulo).toBe('3 estados pendientes en 2 viajes');
    expect(avisos[1].subtitulo).toBe('4 tickets pendientes en 2 viajes');
    expect(avisos[0].created_at).toBe('2026-11-16 10:00:00');
  });

  it('no avisa de lo que está en ceros', () => {
    expect(avisosDeDiesel([{ state_pending_count: '0', fleetone_pending_count: '0' }], corte)).toEqual([]);
  });

  it('usa singular con un solo pendiente', () => {
    const [aviso] = avisosDeDiesel([{ state_pending_count: '1' }], corte);
    expect(aviso.subtitulo).toBe('1 estado pendiente en 1 viaje');
  });
});

describe('avisosSinFallas', () => {
  const ahora = new Date(2026, 10, 16, 12, 0, 0);

  it('avisa de las recientes, con o sin caja', () => {
    const avisos = avisosSinFallas(
      [
        { cl_final_id: '276', fecha_creacion: '2026-11-12 09:44:41', no_camion: '12', no_caja: null, operador: 'Jose', nomenclatura: '257-US-26' },
        { cl_final_id: '272', fecha_creacion: '2026-11-04 10:24:56', no_camion: '12', no_caja: '102', operador: 'Jose', nomenclatura: '249-US-26' },
        { cl_final_id: '100', fecha_creacion: '2026-10-01 10:00:00', no_camion: '1', operador: 'Viejo' },
      ],
      ahora
    );
    expect(avisos.map((a) => a.id)).toEqual(['sin-fallas-276', 'sin-fallas-272']);
    expect(avisos[0].subtitulo).toBe('Camión 12 · Jose');
    expect(avisos[1].subtitulo).toBe('Camión 12 · Caja 102 · Jose');
    expect(avisos[0].titulo).toBe('Inspección sin fallas 257-US-26');
  });
});

describe('avisosSinInspeccion', () => {
  it('solo avisa del operador con más de un viaje', () => {
    const avisos = avisosSinInspeccion([
      { operador: 'Cesar Fierro Santamaría ', nomenclatura: '106-MX-96T1-26', creation_date: '2026-11-06 10:28:27' },
      { operador: 'Cesar Fierro Santamaría', nomenclatura: '105-MX-95T1-26', creation_date: '2026-11-05 08:12:07' },
      { operador: 'Alejandro Zablah Ruiz', nomenclatura: '251-US-26', creation_date: '2026-10-30 13:07:53' },
    ]);
    expect(avisos).toHaveLength(1);
    expect(avisos[0].id).toBe('sin-inspeccion-cesar-fierro-santamaria-2');
    expect(avisos[0].subtitulo).toBe('Cesar Fierro Santamaría · 2 viajes');
    expect(avisos[0].detalle).toBe('106-MX-96T1-26, 105-MX-95T1-26');
    expect(avisos[0].created_at).toBe('2026-11-06 10:28:27');
  });

  it('resume la lista cuando son muchos viajes', () => {
    const viajes = [1, 2, 3, 4, 5].map((n) => ({ operador: 'Ana', nomenclatura: `${n}-MX-26`, creation_date: `2026-11-0${n} 08:00:00` }));
    expect(avisosSinInspeccion(viajes)[0].detalle).toBe('1-MX-26, 2-MX-26, 3-MX-26 y 2 más');
  });

  it('cambia de id cuando se suma otro viaje, para volver a avisar', () => {
    const viaje = (n) => ({ operador: 'Ana', nomenclatura: `${n}`, creation_date: `2026-11-0${n} 08:00:00` });
    const dos = avisosSinInspeccion([viaje(1), viaje(2)]);
    const tres = avisosSinInspeccion([viaje(1), viaje(2), viaje(3)]);
    expect(dos[0].id).not.toBe(tres[0].id);
  });
});

describe('avisosDeProgramacion', () => {
  const ahora = new Date(2026, 10, 16, 9, 30, 0);

  it('fecha la programación la primera vez que se ve y la conserva después', () => {
    const programaciones = [
      { id: '31', nombre_compania: 'PALOS GARZA HUB', destino: 'WILSON, NC', truck_unidad: '10', driver_nombre: 'Luis', salida: '2026-11-17 07:00:00' },
    ];
    const primera = avisosDeProgramacion(programaciones, {}, ahora, 4);
    expect(primera.avisos[0]).toMatchObject({
      id: 'programacion-31',
      subtitulo: 'PALOS GARZA HUB · Camión 10 · Luis',
      detalle: 'WILSON, NC · Sale 17/11 07:00',
      created_at: '2026-11-16 09:30:00',
    });

    const despues = avisosDeProgramacion(programaciones, primera.vistas, new Date(2026, 10, 16, 11, 0, 0), 4);
    expect(despues.avisos[0].created_at).toBe('2026-11-16 09:30:00');
  });

  it('olvida las programaciones que ya no existen', () => {
    const { vistas } = avisosDeProgramacion([], { 31: '2026-11-16 09:30:00' }, ahora, 4);
    expect(vistas).toEqual({});
  });
});

const viajeDeEjemplo = (documentos, faltantes = ['orden_retiro'], paradas = []) => ({
  trip_id: '611',
  trip_number: '266-US-26',
  truck_unidad: '10',
  driver_nombre: 'Luis Enrique',
  creation_date: '2026-11-14 08:54:36',
  etapas: [
    {
      stage_number: '1',
      documentos_adjuntos: documentos.map(([document_id, tipo_documento]) => ({ document_id, tipo_documento })),
      documentos_faltantes: faltantes.length,
      documentos_faltantes_lista: faltantes,
      stops_in_transit: paradas,
    },
  ],
});

describe('avisosDeDespacho', () => {
  it('un aviso por viaje en despacho, con lo que le falta', () => {
    const [aviso] = avisosDeDespacho([viajeDeEjemplo([['7350', 'doda']])], 1);
    expect(aviso).toMatchObject({
      id: 'despacho-611',
      titulo: 'Viaje en despacho 266-US-26',
      subtitulo: 'Camión 10 · Luis Enrique',
      detalle: 'Faltan 1: ORDEN RETIRO',
      created_at: '2026-11-14 08:54:36',
    });
  });
});

describe('avisosDeDocumentos', () => {
  const ahora = new Date(2026, 10, 16, 12, 0, 0);

  it('la primera vez solo toma nota, sin avisar', () => {
    const { avisos, base } = avisosDeDocumentos([viajeDeEjemplo([['7350', 'doda']])], null, ahora, 1);
    expect(avisos).toEqual([]);
    expect(base).toEqual({ 611: ['7350'] });
  });

  it('un viaje que aparece después tampoco avisa de los documentos con los que nació', () => {
    const { avisos } = avisosDeDocumentos([viajeDeEjemplo([['7350', 'doda']])], {}, ahora, 1);
    expect(avisos).toEqual([]);
  });

  it('junta en un solo aviso los documentos que entraron a la vez', () => {
    const { avisos, base } = avisosDeDocumentos(
      [viajeDeEjemplo([['7350', 'doda'], ['7351', 'entry'], ['7352', 'bl']])],
      { 611: ['7350'] },
      ahora,
      1,
    );
    expect(avisos).toHaveLength(1);
    expect(avisos[0]).toMatchObject({
      id: 'documentos-611-7351-7352',
      titulo: '2 documentos agregados 266-US-26',
      subtitulo: 'ENTRY, BL',
      detalle: 'Faltan 1: ORDEN RETIRO',
      created_at: '2026-11-16 12:00:00',
    });
    expect(base[611]).toEqual(['7350', '7351', '7352']);
  });

  it('dice cuando ya no falta nada', () => {
    const { avisos } = avisosDeDocumentos(
      [viajeDeEjemplo([['7350', 'doda'], ['7366', 'orden_retiro']], [])],
      { 611: ['7350'] },
      ahora,
      1,
    );
    expect(avisos[0].titulo).toBe('Documento agregado 266-US-26');
    expect(avisos[0].detalle).toBe('Documentos completos');
  });

  it('cuenta el BL firmado de las paradas', () => {
    const viaje = viajeDeEjemplo([['7350', 'doda']], [], [{ bl_firmado_doc: { document_id: '7353' } }, { bl_firmado_doc: null }]);
    expect(documentosDeViaje(viaje)).toEqual([
      { id: '7350', tipo: 'doda' },
      { id: '7353', tipo: 'bl_firmado' },
    ]);
  });

  it('sin cambios no avisa', () => {
    const { avisos } = avisosDeDocumentos([viajeDeEjemplo([['7350', 'doda']])], { 611: ['7350'] }, ahora, 1);
    expect(avisos).toEqual([]);
  });
});

describe('recortarAvisos', () => {
  it('tira los de más de 14 días y respeta el máximo', () => {
    const ahora = new Date(2026, 10, 16, 12, 0, 0);
    const avisos = [
      { id: 'a', created_at: fechaLocal(new Date(2026, 10, 16, 11, 0, 0)) },
      { id: 'b', created_at: fechaLocal(new Date(2026, 10, 10, 11, 0, 0)) },
      { id: 'c', created_at: fechaLocal(new Date(2026, 9, 20, 11, 0, 0)) },
    ];
    expect(recortarAvisos(avisos, ahora).map((a) => a.id)).toEqual(['a', 'b']);
    expect(recortarAvisos(avisos, ahora, 1).map((a) => a.id)).toEqual(['a']);
  });
});

describe('categorías', () => {
  it('cada aviso dice a qué lista pertenece', () => {
    const corte = { fecha: '2026-11-16', momento: new Date(2026, 10, 16, 10, 0, 0) };
    const [state, fleet] = avisosDeDiesel([{ state_pending_count: '1', fleetone_pending_count: '1' }], corte);
    expect(state.categoria).toBe(CATEGORIA_AVISO.DIESEL_STATE);
    expect(fleet.categoria).toBe(CATEGORIA_AVISO.DIESEL_FLEETONE);
    expect(avisosDeDespacho([viajeDeEjemplo([])], 1)[0].categoria).toBe(CATEGORIA_AVISO.VIAJE_DESPACHO);
  });

  it('sin listas del servidor, reparte por permiso de pantalla', () => {
    const categorias = categoriasPorDefecto({ veDiesel: false, recibeInspecciones: true, veProgramacion: false, veDespacho: true });
    expect([...categorias].sort()).toEqual(
      [
        CATEGORIA_AVISO.SIN_FALLAS,
        CATEGORIA_AVISO.SIN_INSPECCION,
        CATEGORIA_AVISO.VIAJE_DESPACHO,
        CATEGORIA_AVISO.VIAJE_DOCUMENTOS,
      ].sort(),
    );
  });
});
