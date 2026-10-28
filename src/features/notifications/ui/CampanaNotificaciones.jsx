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
import CloseIcon from "@mui/icons-material/Close"
import LocalShippingIcon from "@mui/icons-material/LocalShipping"
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone"
import SettingsIcon from "@mui/icons-material/Settings"

import { UNIDAD } from "../../../entities/maintenance-point"
import { tiempoRelativo } from "../../../entities/notification"
import { COLOR, Pestanas, TINTE } from "../../../shared/ui"
import { FILTRO_CAMPANA, useCampanaNotificaciones } from "../model/useCampanaNotificaciones"

const PESTANAS = [
  { id: FILTRO_CAMPANA.TODAS, etiqueta: "Todas" },
  { id: FILTRO_CAMPANA.NO_LEIDAS, etiqueta: "Sin leer" },
  { id: FILTRO_CAMPANA.LEIDAS, etiqueta: "Leídas" },
]

/**
 * Una notificación dentro del panel.
 *
 * @param {object} props Propiedades del componente.
 * @param {object} props.notificacion La notificación a mostrar.
 * @param {string} props.viaje La nomenclatura del viaje, o el mensaje si no es de un viaje.
 *   En una inspección no se usa: el renglón enseña el lado, la unidad y el operador.
 * @param {boolean} props.leida Si la persona ya la vio.
 * @param {Function} props.onAbrir Qué hacer al tocarla.
 * @returns {object} El renglón renderizado.
 */
function Renglon({ notificacion, viaje, leida, onAbrir }) {
  const esInspeccion = notificacion.tipo === "inspeccion"
  const titulo = esInspeccion ? `Nueva inspección #${notificacion.clFinalId}` : "BL Firmado"
  const subtitulo = esInspeccion
    ? `${notificacion.lado === UNIDAD.CAJA ? "Caja" : "Camión"}${notificacion.unidad ? ` ${notificacion.unidad}` : ""} · ${notificacion.operador}`
    : viaje

  return (
    <ListItemButton
      onClick={onAbrir}
      sx={{
        px: 2.5,
        py: 1.25,
        alignItems: "flex-start",
        bgcolor: leida ? "transparent" : COLOR.INFO_FONDO,
        "&:hover": { bgcolor: COLOR.LIENZO },
      }}
    >
      <ListItemAvatar sx={{ minWidth: 44 }}>
        {esInspeccion ? (
          <Avatar sx={{ bgcolor: TINTE.NARANJA.fondo, color: TINTE.NARANJA.texto, width: 36, height: 36 }}>
            <BuildIcon fontSize="small" />
          </Avatar>
        ) : (
          <Avatar sx={{ bgcolor: COLOR.INFO_FONDO, color: COLOR.INFO, width: 36, height: 36 }}>
            <LocalShippingIcon fontSize="small" />
          </Avatar>
        )}
      </ListItemAvatar>

      <ListItemText
        primary={
          <Typography variant="body2" fontWeight={800} color={COLOR.TINTA}>
            {titulo}
          </Typography>
        }
        secondary={
          <Typography variant="caption" color={COLOR.APAGADO} noWrap sx={{ display: "block" }}>
            {subtitulo}
          </Typography>
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
  const { grupos, sinLeer, filtro, setFiltro, estaLeida, viajeDe, marcarTodasLeidas, puedeAdministrar } =
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
      <IconButton onClick={(evento) => setAncla(evento.currentTarget)} sx={{ color: COLOR.TINTA }}>
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
          <IconButton size="small" onClick={cerrar}>
            <CloseIcon fontSize="small" />
          </IconButton>
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
                    onAbrir={() => {
                      if (notificacion.tipo === "inspeccion") {
                        irA(`/mantenimiento?pestana=inspecciones&lado=${notificacion.lado}`)
                      } else if (notificacion.trip_id) {
                        irA(`/edit-trip/${notificacion.trip_id}`)
                      } else {
                        cerrar()
                      }
                    }}
                  />
                ))}
              </List>
              <Divider />
            </Box>
          ))}
        </Box>

        {puedeAdministrar && (
          <Box sx={{ px: 2, py: 1.25 }}>
            <Button
              fullWidth
              size="small"
              startIcon={<SettingsIcon fontSize="small" />}
              onClick={() => irA("/notifications-manager")}
              sx={{ textTransform: "none", fontWeight: 700, color: COLOR.TINTA }}
            >
              Notificaciones manager
            </Button>
          </Box>
        )}
      </Popover>
    </>
  )
}
