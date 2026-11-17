import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'react-toastify';
import { useAuthStore } from '../store/useAuthStore';
import { sondear } from '../utils/sondeo';
import {
  consultarAvisosDeDespacho,
  consultarAvisosDeMantenimiento,
  consultarAvisosDeProgramacion,
  crearConsultaDeDiesel,
} from '../services/avisos';
import notiSound from '../assets/sounds/update.mp3';

const DIESEL_MS = 60 * 1000;
const MANTENIMIENTO_MS = 5 * 60 * 1000;
const VIAJES_MS = 2 * 60 * 1000;
const VIAJES_OCULTA_MS = 5 * 60 * 1000;

const useFuente = ({ activa, consultar, visibleMs, ocultoMs }) => {
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
        const lista = await consultar();
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
  }, [activa, consultar, visibleMs, ocultoMs]);

  return avisos;
};

export function useAvisosDerivados({ recibeInspecciones }) {
  const user = useAuthStore((estado) => estado.user);
  const permisos = useAuthStore((estado) => estado.userPermissions);
  const usuarioId = user?.id;
  const tipoUsuario = user?.tipo_usuario;
  const esAdmin = tipoUsuario?.toLowerCase() === 'admin';
  const puede = (permiso) => Boolean(usuarioId) && (esAdmin || permisos?.[permiso] === true);

  const consultarDiesel = useMemo(() => (usuarioId ? crearConsultaDeDiesel() : null), [usuarioId]);
  const consultarProgramacion = useCallback(() => consultarAvisosDeProgramacion(usuarioId), [usuarioId]);
  const consultarDespacho = useCallback(
    () => consultarAvisosDeDespacho({ id: usuarioId, tipo_usuario: tipoUsuario }),
    [usuarioId, tipoUsuario]
  );

  const diesel = useFuente({
    activa: puede('gastos_diesel'),
    consultar: consultarDiesel,
    visibleMs: DIESEL_MS,
    ocultoMs: DIESEL_MS,
  });
  const mantenimiento = useFuente({
    activa: Boolean(usuarioId) && recibeInspecciones,
    consultar: consultarAvisosDeMantenimiento,
    visibleMs: MANTENIMIENTO_MS,
    ocultoMs: MANTENIMIENTO_MS,
  });
  const programacion = useFuente({
    activa: puede('viajes_tab_programacion'),
    consultar: consultarProgramacion,
    visibleMs: VIAJES_MS,
    ocultoMs: VIAJES_OCULTA_MS,
  });
  const despacho = useFuente({
    activa: puede('viajes_tab_despacho'),
    consultar: consultarDespacho,
    visibleMs: VIAJES_MS,
    ocultoMs: VIAJES_OCULTA_MS,
  });

  return useMemo(
    () => [...diesel, ...mantenimiento, ...programacion, ...despacho],
    [diesel, mantenimiento, programacion, despacho]
  );
}
