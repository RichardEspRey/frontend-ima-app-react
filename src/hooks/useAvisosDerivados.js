import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'react-toastify';
import { useAuthStore } from '../store/useAuthStore';
import { sondear } from '../utils/sondeo';
import {
  consultarAvisosDeDespacho,
  consultarAvisosDeMantenimiento,
  consultarAvisosDeProgramacion,
  crearConsultaDeDiesel,
  obtenerMisCategorias,
} from '../services/avisos';
import { CATEGORIA, categoriasPorDefecto } from '../utils/avisos';
import notiSound from '../assets/sounds/update.mp3';

const DIESEL_MS = 60 * 1000;
const MANTENIMIENTO_MS = 5 * 60 * 1000;
const VIAJES_MS = 2 * 60 * 1000;
const VIAJES_OCULTA_MS = 5 * 60 * 1000;
const CATEGORIAS_MS = 5 * 60 * 1000;

const useFuente = ({ activa, consultar, permitidas, visibleMs, ocultoMs }) => {
  const [avisos, setAvisos] = useState([]);
  const conocidas = useRef(null);

  useEffect(() => {
    conocidas.current = null;
    if (!activa) {
      setAvisos([]);
      return undefined;
    }

    return sondear(
      async () => {
        const lista = (await consultar()).filter((a) => permitidas.has(a.categoria));
        if (conocidas.current) {
          const nuevas = lista.filter((a) => !conocidas.current.has(a.id));
          nuevas.forEach((a) =>
            toast.info([a.titulo, a.subtitulo].filter(Boolean).join(' · '), { position: 'top-right' })
          );
          if (nuevas.length > 0) new Audio(notiSound).play().catch(() => {});
        }
        conocidas.current = new Set(lista.map((a) => a.id));
        setAvisos(lista);
      },
      { visibleMs, ocultoMs }
    );
  }, [activa, consultar, permitidas, visibleMs, ocultoMs]);

  return avisos;
};

const useCategorias = (usuarioId, porDefecto) => {
  const [guardadas, setGuardadas] = useState(null);
  const delServidor = useMemo(() => (guardadas === null ? null : new Set(guardadas.split(',').filter(Boolean))), [guardadas]);

  useEffect(() => {
    setGuardadas(null);
    if (!usuarioId) return undefined;
    return sondear(
      async () => {
        try {
          setGuardadas((await obtenerMisCategorias(usuarioId)).slice().sort().join(','));
        } catch {
          setGuardadas(null);
        }
      },
      { visibleMs: CATEGORIAS_MS, ocultoMs: null }
    );
  }, [usuarioId]);

  return delServidor || porDefecto;
};

export function useAvisosDerivados({ recibeInspecciones }) {
  const user = useAuthStore((estado) => estado.user);
  const permisos = useAuthStore((estado) => estado.userPermissions);
  const usuarioId = user?.id;
  const tipoUsuario = user?.tipo_usuario;
  const esAdmin = tipoUsuario?.toLowerCase() === 'admin';

  const porDefecto = useMemo(
    () =>
      categoriasPorDefecto({
        puede: (permiso) => Boolean(usuarioId) && (esAdmin || permisos?.[permiso] === true),
        recibeInspecciones: Boolean(usuarioId) && recibeInspecciones,
      }),
    [usuarioId, esAdmin, permisos, recibeInspecciones]
  );
  const categorias = useCategorias(usuarioId, porDefecto);
  const recibe = (...lista) => lista.some((categoria) => categorias.has(categoria));

  const consultarDiesel = useMemo(() => (usuarioId ? crearConsultaDeDiesel() : null), [usuarioId]);
  const consultarProgramacion = useCallback(() => consultarAvisosDeProgramacion(usuarioId), [usuarioId]);
  const consultarDespacho = useCallback(
    () => consultarAvisosDeDespacho({ id: usuarioId, tipo_usuario: tipoUsuario }),
    [usuarioId, tipoUsuario]
  );

  const diesel = useFuente({
    activa: recibe(CATEGORIA.DIESEL_STATE, CATEGORIA.DIESEL_FLEETONE),
    consultar: consultarDiesel,
    permitidas: categorias,
    visibleMs: DIESEL_MS,
    ocultoMs: DIESEL_MS,
  });
  const mantenimiento = useFuente({
    activa: recibe(CATEGORIA.SIN_FALLAS, CATEGORIA.SIN_INSPECCION),
    consultar: consultarAvisosDeMantenimiento,
    permitidas: categorias,
    visibleMs: MANTENIMIENTO_MS,
    ocultoMs: MANTENIMIENTO_MS,
  });
  const programacion = useFuente({
    activa: recibe(CATEGORIA.VIAJE_PROGRAMADO),
    consultar: consultarProgramacion,
    permitidas: categorias,
    visibleMs: VIAJES_MS,
    ocultoMs: VIAJES_OCULTA_MS,
  });
  const despacho = useFuente({
    activa: recibe(CATEGORIA.VIAJE_DESPACHO, CATEGORIA.VIAJE_DOCUMENTOS),
    consultar: consultarDespacho,
    permitidas: categorias,
    visibleMs: VIAJES_MS,
    ocultoMs: VIAJES_OCULTA_MS,
  });

  return useMemo(
    () => [...diesel, ...mantenimiento, ...programacion, ...despacho],
    [diesel, mantenimiento, programacion, despacho]
  );
}
