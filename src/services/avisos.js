import {
  avisosDeDespacho,
  avisosDeDiesel,
  avisosDeDocumentos,
  avisosDeProgramacion,
  avisosSinFallas,
  avisosSinInspeccion,
  corteDiario,
  recortarAvisos,
} from '../utils/avisos';
import { obtenerInspeccionesSinFallas, obtenerViajesSinInspeccion } from './mantenimiento';

const apiHost = import.meta.env.VITE_API_HOST;

const pedir = async (archivo, campos) => {
  const fd = new FormData();
  Object.entries(campos).forEach(([clave, valor]) => fd.append(clave, valor));
  const res = await fetch(`${apiHost}/${archivo}`, { method: 'POST', body: fd });
  const data = await res.json();
  if (data.status !== 'success') throw new Error(data.message || `No se pudo consultar ${archivo}`);
  return data;
};

const leer = (llave, porDefecto) => {
  try {
    const valor = JSON.parse(localStorage.getItem(llave) || 'null');
    return valor ?? porDefecto;
  } catch {
    return porDefecto;
  }
};

const guardar = (llave, valor) => {
  try {
    localStorage.setItem(llave, JSON.stringify(valor));
  } catch {
    return;
  }
};

const pedirAvisos = (op, campos = {}) => pedir('Notifications.php', { op, ...campos });

export const obtenerMisCategorias = async (usuarioId) => {
  const data = await pedirAvisos('getMisCategorias', { user_id: usuarioId });
  return Array.isArray(data.categorias) ? data.categorias : [];
};

export const suscriptoresDe = (categoria) => ({
  obtenerSuscriptores: async () => (await pedirAvisos('getSuscriptores', { categoria })).users || [],
  obtenerDisponibles: async () => (await pedirAvisos('getDisponibles', { categoria })).users || [],
  suscribir: ({ userId, usuarioId }) =>
    pedirAvisos('suscribir', { categoria, user_id: userId, id_usuario: usuarioId ?? '' }),
  desuscribir: ({ userId }) => pedirAvisos('desuscribir', { categoria, user_id: userId }),
});

export const crearConsultaDeDiesel = () => {
  let ultimo = { fecha: null, avisos: [] };
  return async () => {
    const corte = corteDiario(new Date());
    if (ultimo.fecha === corte.fecha) return ultimo.avisos;
    const data = await pedir('formularios.php', { op: 'getAll_diesel' });
    ultimo = { fecha: corte.fecha, avisos: avisosDeDiesel(Array.isArray(data.id) ? data.id : [], corte) };
    return ultimo.avisos;
  };
};

export const consultarAvisosDeMantenimiento = async () => {
  const [sinFallas, sinInspeccion] = await Promise.all([
    obtenerInspeccionesSinFallas(),
    obtenerViajesSinInspeccion(),
  ]);
  return [...avisosSinFallas(sinFallas, new Date()), ...avisosSinInspeccion(sinInspeccion)];
};

export const consultarAvisosDeProgramacion = async (usuarioId) => {
  const llave = `avisos_programacion_${usuarioId}`;
  const data = await pedir('Programacion_viajes.php', { op: 'getAll' });
  const { avisos, vistas } = avisosDeProgramacion(Array.isArray(data.data) ? data.data : [], leer(llave, {}), new Date());
  guardar(llave, vistas);
  return avisos;
};

export const consultarAvisosDeDespacho = async (usuario) => {
  const llave = `avisos_documentos_${usuario.id}`;
  const data = await pedir('new_tripsv2.php', {
    op: 'getPaginated',
    page: 0,
    limit: 100,
    tabValue: 1,
    filterDirection: 'All',
    user_id: usuario.id,
    user_type: usuario.tipo_usuario || '',
  });
  const viajes = Array.isArray(data.trips) ? data.trips : [];
  const ahora = new Date();
  const guardado = leer(llave, { base: null, avisos: [] });
  const { avisos: nuevos, base } = avisosDeDocumentos(viajes, guardado.base, ahora);
  const deDocumentos = recortarAvisos([...nuevos, ...(guardado.avisos || [])], ahora);
  guardar(llave, { base, avisos: deDocumentos });
  return [...avisosDeDespacho(viajes), ...deDocumentos];
};
