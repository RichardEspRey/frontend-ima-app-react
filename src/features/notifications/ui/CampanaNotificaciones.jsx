import { useState } from "react"
import { useNavigate } from "react-router-dom"
import {
  Avatar,
  Badge,
  Box,
  Button,
  Divider,
  IconButton,
  List,
  ListItemAvatar,
  ListItemButton,
  ListItemText,
  Popover,
  Typography,
} from "@mui/material"
import BuildIcon from "@mui/icons-material/Build"
import DescriptionIcon from "@mui/icons-material/Description"
import EventAvailableIcon from "@mui/icons-material/EventAvailable"
import LocalGasStationIcon from "@mui/icons-material/LocalGasStation"
import CloseIcon from "@mui/icons-material/Close"
import LocalShippingIcon from "@mui/icons-material/LocalShipping"
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone"
import SettingsIcon from "@mui/icons-material/Settings"

import { UNIDAD } from "../../../entities/maintenance-point"
import { TIPO_AVISO, tiempoRelativo } from "../../../entities/notification"
import { useViajesFiltrosStore } from "../../../store/useViajesFiltrosStore"
import { COLOR, Pestanas, TINTE } from "../../../shared/ui"
import { FILTRO_CAMPANA, useCampanaNotificaciones } from "../model/useCampanaNotificaciones"

const PESTANAS = [
  { id: FILTRO_CAMPANA.TODAS, etiqueta: "Todas" },
  { id: FILTRO_CAMPANA.NO_LEIDAS, etiqueta: "Sin leer" },
  { id: FILTRO_CAMPANA.LEIDAS, etiqueta: "Leídas" },
]

const ASPECTO_BL = { icono: LocalShippingIcon, fondo: COLOR.INFO_FONDO, texto: COLOR.INFO }
const ASPECTO_TALLER = { icono: BuildIcon, fondo: TINTE.NARANJA.fondo, texto: TINTE.NARANJA.texto }

const ASPECTO_POR_TIPO = {
  inspeccion: ASPECTO_TALLER,
  [TIPO_AVISO.MANTENIMIENTO]: ASPECTO_TALLER,
  [TIPO_AVISO.DIESEL]: { icono: LocalGasStationIcon, fondo: TINTE.AMBAR.fondo, texto: TINTE.AMBAR.texto },
  [TIPO_AVISO.PROGRAMACION]: { icono: EventAvailableIcon, fondo: TINTE.TEAL.fondo, texto: TINTE.TEAL.texto },
  [TIPO_AVISO.DESPACHO]: ASPECTO_BL,
  [TIPO_AVISO.DOCUMENTOS]: { icono: DescriptionIcon, fondo: TINTE.VIOLETA.fondo, texto: TINTE.VIOLETA.texto },
}

/**
 * Lo que un renglón de la campana enseña y a dónde lleva, según el tipo de aviso.
 *
 * Los BL firmados vienen del servidor sin tipo; las inspecciones traen sus
 * propios campos; el resto de avisos ya llega con título, subtítulo y destino.
 *
 * @param {object} notificacion La notificación o el aviso.
 * @param {string} viaje La nomenclatura del viaje, para los BL.
 * @returns {{aspecto: object, titulo: string, subtitulo: string, detalle: (string|undefined), destino: (object|null)}} La presentación.
 */
function presentarAviso(notificacion, viaje) {
  if (notificacion.tipo === "inspeccion") {
    return {
      aspecto: ASPECTO_TALLER,
      titulo: `Nueva inspección ${notificacion.nomenclatura}`,
      subtitulo: `${notificacion.lado === UNIDAD.CAJA ? "Caja" : "Camión"}${notificacion.unidad ? ` ${notificacion.unidad}` : ""} · ${notificacion.operador}`,
      destino: { ruta: `/mantenimiento?pestana=inspecciones&lado=${notificacion.lado}` },
    }
  }

  if (notificacion.tipo) {
    return {
      aspecto: ASPECTO_POR_TIPO[notificacion.tipo] ?? ASPECTO_BL,
      titulo: notificacion.titulo,
      subtitulo: notificacion.subtitulo,
      detalle: notificacion.detalle,
      destino: notificacion.destino ?? null,
    }
  }

  return {
    aspecto: ASPECTO_BL,
    titulo: "BL Firmado",
    subtitulo: viaje,
    destino: notificacion.trip_id ? { ruta: `/edit-trip/${notificacion.trip_id}` } : null,
  }
}

/**
 * Una notificación dentro del panel.
 *
 * @param {object} props Propiedades del componente.
 * @param {object} props.notificacion La notificación a mostrar.
 * @param {string} props.viaje La nomenclatura del viaje, o el mensaje si no es de un viaje.
 * @param {boolean} props.leida Si la persona ya la vio.
 * @param {Function} props.onAbrir Qué hacer al tocarla; recibe el destino del aviso.
 * @returns {object} El renglón renderizado.
 */
function Renglon({ notificacion, viaje, leida, onAbrir }) {
  const { aspecto, titulo, subtitulo, detalle, destino } = presentarAviso(notificacion, viaje)
  const Icono = aspecto.icono

  return (
    <ListItemButton
      onClick={() => onAbrir(destino)}
      sx={{
        px: 2.5,
        py: 1.25,
        alignItems: "flex-start",
        bgcolor: leida ? "transparent" : COLOR.INFO_FONDO,
        "&:hover": { bgcolor: COLOR.LIENZO },
      }}
    >
      <ListItemAvatar sx={{ minWidth: 44 }}>
        <Avatar sx={{ bgcolor: aspecto.fondo, color: aspecto.texto, width: 36, height: 36 }}>
          <Icono fontSize="small" />
        </Avatar>
      </ListItemAvatar>

      <ListItemText
        sx={{ minWidth: 0 }}
        primary={
          <Typography variant="body2" fontWeight={800} color={COLOR.TINTA}>
            {titulo}
          </Typography>
        }
        secondary={
          <>
            <Typography component="span" variant="caption" color={COLOR.APAGADO} noWrap sx={{ display: "block" }}>
              {subtitulo}
            </Typography>
            {detalle ? (
              <Typography component="span" variant="caption" color={COLOR.APAGADO} sx={{ display: "block", opacity: 0.8 }}>
                {detalle}
              </Typography>
            ) : null}
          </>
        }
      />

      <Box sx={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 0.5, ml: 1 }}>
        <Typography variant="caption" color={COLOR.APAGADO} whiteSpace="nowrap">
          {tiempoRelativo(notificacion.created_at)}
        </Typography>
        {!leida && <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: COLOR.INFO }} />}
      </Box>
    </ListItemButton>
  )
}

/**
 * La campana de notificaciones del encabezado.
 *
 * Enseña lo que ya trae la consulta de notificaciones —la misma que usa el
 * aviso emergente— agrupado por día, con el contador de lo que falta por leer.
 * Al cerrarse, da por leído lo que estaba a la vista.
 *
 * @returns {object} La campana renderizada.
 */
export function CampanaNotificaciones() {
  const navigate = useNavigate()
  const [ancla, setAncla] = useState(null)
  const { grupos, sinLeer, filtro, setFiltro, estaLeida, viajeDe, marcarTodasLeidas, ocultar, puedeAdministrar, refrescar } =
    useCampanaNotificaciones()

  const cerrar = () => {
    setAncla(null)
    marcarTodasLeidas()
  }

  const irA = (ruta) => {
    cerrar()
    navigate(ruta)
  }

  return (
    <>
      <IconButton
        onClick={(evento) => {
          setAncla(evento.currentTarget)
          refrescar()
        }}
        sx={{ color: COLOR.TINTA }}
      >
        <Badge badgeContent={sinLeer} color="primary">
          <NotificationsNoneIcon />
        </Badge>
      </IconButton>

      <Popover
        open={Boolean(ancla)}
        anchorEl={ancla}
        onClose={cerrar}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        slotProps={{ paper: { sx: { width: 400, maxHeight: 560, mt: 1, borderRadius: 3 } } }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            px: 2.5,
            pt: 2,
            pb: 1.5,
          }}
        >
          <Typography variant="subtitle1" fontWeight={800} color={COLOR.TINTA}>
            Notificaciones
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            {puedeAdministrar && (
              <Button
                size="small"
                startIcon={<SettingsIcon fontSize="small" />}
                onClick={() => irA("/notifications-manager")}
                sx={{ textTransform: "none", fontWeight: 700, color: COLOR.TEXTO_SUAVE, borderRadius: 2 }}
              >
                Administrar
              </Button>
            )}
            <IconButton size="small" onClick={cerrar}>
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>
        </Box>

        <Pestanas valor={filtro} onChange={setFiltro} pestanas={PESTANAS} sx={{ mx: 2.5, mb: 1 }} />

        <Box sx={{ maxHeight: 440, overflowY: "auto" }}>
          {grupos.length === 0 && (
            <Typography
              variant="body2"
              color={COLOR.APAGADO}
              sx={{ px: 2.5, py: 4, textAlign: "center" }}
            >
              No hay notificaciones
            </Typography>
          )}

          {grupos.map(({ etiqueta, notificaciones }) => (
            <Box key={etiqueta}>
              <Typography
                variant="caption"
                sx={{ px: 2.5, pt: 1.5, pb: 0.5, display: "block", color: COLOR.APAGADO, fontWeight: 700 }}
              >
                {etiqueta}
              </Typography>

              <List disablePadding>
                {notificaciones.map((notificacion) => (
                  <Renglon
                    key={notificacion.id}
                    notificacion={notificacion}
                    viaje={viajeDe(notificacion)}
                    leida={estaLeida(notificacion)}
                    onAbrir={(destino) => {
                      ocultar(notificacion)
                      if (!destino) {
                        cerrar()
                        return
                      }
                      if (destino.pestanaViajes !== undefined) {
                        useViajesFiltrosStore.getState().set({ tabValue: destino.pestanaViajes, page: 0 })
                      }
                      irA(destino.ruta)
                    }}
                  />
                ))}
              </List>
              <Divider />
            </Box>
          ))}
        </Box>

      </Popover>
    </>
  )
}
