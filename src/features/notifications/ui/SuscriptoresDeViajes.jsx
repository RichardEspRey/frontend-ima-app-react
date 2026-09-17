import { useMemo, useState } from "react"
import {
  Avatar,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  InputAdornment,
  List,
  ListItem,
  ListItemAvatar,
  ListItemButton,
  ListItemText,
  Stack,
  TextField,
  Typography,
} from "@mui/material"
import LocalShippingIcon from "@mui/icons-material/LocalShipping"
import PersonAddIcon from "@mui/icons-material/PersonAdd"
import SearchIcon from "@mui/icons-material/Search"

import {
  useDesuscribir,
  useSuscribir,
  useSuscriptores,
  useUsuariosDisponibles,
} from "../../../entities/notification"
import { BloqueEsqueleto, COLOR, EstadoError, notify } from "../../../shared/ui"

/**
 * El nombre con el que se conoce a una persona en esta pantalla.
 *
 * El endpoint manda `name` unas veces y `user` otras, según de qué tabla salga.
 *
 * @param {object} persona La persona devuelta por el servidor.
 * @returns {string} Su nombre.
 */
const nombreDe = (persona) => persona?.name || persona?.user || "Sin nombre"

/**
 * Quiénes reciben las notificaciones de viajes, y cómo cambiarlo.
 *
 * Es la única categoría que existe hoy —documentos y eventos de un viaje—, así
 * que se pinta una sola tarjeta. Cuando haya más, esto se vuelve una lista.
 *
 * @returns {object} El panel renderizado.
 */
export function SuscriptoresDeViajes() {
  const [buscador, setBuscador] = useState(false)
  const [busqueda, setBusqueda] = useState("")

  const suscriptores = useSuscriptores()
  const disponibles = useUsuariosDisponibles(buscador)
  const suscribir = useSuscribir()
  const desuscribir = useDesuscribir()

  const candidatos = useMemo(() => {
    const texto = busqueda.trim().toLowerCase()
    const lista = disponibles.data ?? []
    if (!texto) return lista
    return lista.filter((persona) => nombreDe(persona).toLowerCase().includes(texto))
  }, [disponibles.data, busqueda])

  const abrirBuscador = () => {
    setBusqueda("")
    setBuscador(true)
  }

  const agregar = async (persona) => {
    try {
      await suscribir.mutateAsync(persona.id)
      notify.exito(`${nombreDe(persona)} ahora recibirá notificaciones de viajes.`)
    } catch (fallo) {
      notify.error(fallo)
    }
  }

  const quitar = async (persona) => {
    try {
      await desuscribir.mutateAsync(persona.id)
      notify.exito(`${nombreDe(persona)} ya no recibirá notificaciones de viajes.`)
    } catch (fallo) {
      notify.error(fallo)
    }
  }

  if (suscriptores.isError) {
    return <EstadoError error={suscriptores.error} onReintentar={suscriptores.refetch} />
  }

  return (
    <>
      <Box sx={{ border: `1px solid ${COLOR.BORDE}`, borderRadius: 2, bgcolor: COLOR.BLANCO, p: 3 }}>
        <Stack direction="row" spacing={2} alignItems="flex-start">
          <Avatar sx={{ bgcolor: COLOR.INFO_FONDO, color: COLOR.INFO }}>
            <LocalShippingIcon />
          </Avatar>

          <Box sx={{ flexGrow: 1 }}>
            <Typography fontWeight={800} color={COLOR.TINTA}>
              Viajes
            </Typography>
            <Typography variant="body2" color={COLOR.APAGADO} sx={{ mb: 1.5 }}>
              Documentos y eventos subidos en un viaje (BL, POD, etc.).
            </Typography>

            {suscriptores.isLoading ? (
              <BloqueEsqueleto alto={32} conTitulo={false} />
            ) : (
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                {(suscriptores.data ?? []).length === 0 ? (
                  <Typography variant="caption" color={COLOR.TENUE}>
                    Sin usuarios asignados
                  </Typography>
                ) : (
                  suscriptores.data.map((persona) => (
                    <Chip
                      key={persona.id}
                      label={nombreDe(persona)}
                      size="small"
                      onDelete={() => quitar(persona)}
                      disabled={desuscribir.isPending}
                    />
                  ))
                )}
              </Stack>
            )}
          </Box>

          <Button
            variant="outlined"
            size="small"
            startIcon={<PersonAddIcon />}
            onClick={abrirBuscador}
            sx={{ whiteSpace: "nowrap" }}
          >
            Agregar usuario
          </Button>
        </Stack>
      </Box>

      <Dialog open={buscador} onClose={() => setBuscador(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Agregar usuario a Viajes</DialogTitle>

        <DialogContent>
          <TextField
            fullWidth
            size="small"
            placeholder="Buscar usuario..."
            value={busqueda}
            onChange={(evento) => setBusqueda(evento.target.value)}
            sx={{ mt: 1, mb: 2 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            }}
          />

          {disponibles.isLoading ? (
            <BloqueEsqueleto alto={200} conTitulo={false} />
          ) : (
            <List dense sx={{ maxHeight: 280, overflowY: "auto" }}>
              {candidatos.length === 0 && (
                <ListItem>
                  <ListItemText
                    primary={
                      <Typography variant="body2" color={COLOR.APAGADO} textAlign="center">
                        No hay usuarios disponibles.
                      </Typography>
                    }
                  />
                </ListItem>
              )}

              {candidatos.map((persona) => (
                <ListItemButton
                  key={persona.id}
                  onClick={() => agregar(persona)}
                  disabled={suscribir.isPending}
                  sx={{ borderRadius: 1 }}
                >
                  <ListItemAvatar>
                    <Avatar sx={{ width: 32, height: 32 }}>{nombreDe(persona).charAt(0)}</Avatar>
                  </ListItemAvatar>
                  <ListItemText primary={nombreDe(persona)} />
                </ListItemButton>
              ))}
            </List>
          )}
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setBuscador(false)}>Cerrar</Button>
        </DialogActions>
      </Dialog>
    </>
  )
}
