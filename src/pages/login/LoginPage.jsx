import { useState } from "react"
import {
  Box,
  Button,
  CircularProgress,
  InputAdornment,
  Paper,
  TextField,
  Typography,
} from "@mui/material"
import { Lock as LockIcon, Person as PersonIcon } from "@mui/icons-material"
import { useNavigate } from "react-router-dom"

import fondo from "../../assets/images/hero.jpg"
import logo from "../../assets/images/logo.png"
import { iniciarSesion, validarCredenciales } from "../../entities/session"
import { notify } from "../../shared/ui"
import { useAuthStore } from "../../store/useAuthStore"

const CAMPO_SX = { "& .MuiOutlinedInput-root": { borderRadius: 2, bgcolor: "#f8fafc" } }

/**
 * La puerta de entrada a la aplicación.
 *
 * Al entrar se piden los permisos de la persona —de eso se encarga el store— y,
 * si corre dentro de Electron, se dispara la comprobación de actualizaciones:
 * es el único momento en que se sabe que hay alguien delante de la pantalla.
 *
 * @returns {object} La pantalla renderizada.
 */
export default function LoginPage() {
  const navigate = useNavigate()
  const login = useAuthStore((estado) => estado.login)

  const [usuario, setUsuario] = useState("")
  const [contrasena, setContrasena] = useState("")
  const [entrando, setEntrando] = useState(false)

  const entrar = async (evento) => {
    evento.preventDefault()

    const falta = validarCredenciales({ usuario, contrasena })
    if (falta) return notify.aviso(falta, "Campos incompletos")

    setEntrando(true)
    try {
      const persona = await iniciarSesion({ usuario, contrasena })
      await login(persona.id, persona.name, persona.type, persona.user)

      window?.electron?.checkForUpdates?.()
      navigate("/home")
    } catch (fallo) {
      notify.error(fallo, "Acceso denegado")
    } finally {
      setEntrando(false)
    }
  }

  return (
    <Box
      sx={{
        width: "100vw",
        height: "100vh",
        backgroundImage: `url(${fondo})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        position: "relative",
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(15, 23, 42, 0.65)",
          backdropFilter: "blur(6px)",
        },
      }}
    >
      <Paper
        elevation={24}
        sx={{
          position: "relative",
          zIndex: 1,
          width: "100%",
          maxWidth: 420,
          p: { xs: 4, sm: 5 },
          borderRadius: 4,
          bgcolor: "rgba(255, 255, 255, 0.95)",
          backdropFilter: "blur(20px)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
        }}
      >
        <Box
          component="img"
          src={logo}
          alt="IMA Express"
          sx={{ width: 200, mb: 4, objectFit: "contain" }}
        />

        <Typography
          variant="h5"
          fontWeight={800}
          color="#0f172a"
          mb={1}
          textAlign="center"
          letterSpacing="-0.02em"
        >
          Bienvenido de nuevo
        </Typography>
        <Typography variant="body2" color="#64748b" mb={4} textAlign="center" fontWeight={500}>
          Ingresa tus credenciales para acceder a la plataforma.
        </Typography>

        <Box component="form" onSubmit={entrar} sx={{ width: "100%" }}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Usuario"
            value={usuario}
            onChange={(e) => setUsuario(e.target.value)}
            disabled={entrando}
            sx={{ mb: 2.5, ...CAMPO_SX }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <PersonIcon sx={{ color: "#94a3b8" }} />
                </InputAdornment>
              ),
            }}
          />

          <TextField
            fullWidth
            type="password"
            variant="outlined"
            placeholder="Contraseña"
            value={contrasena}
            onChange={(e) => setContrasena(e.target.value)}
            disabled={entrando}
            sx={{ mb: 4, ...CAMPO_SX }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <LockIcon sx={{ color: "#94a3b8" }} />
                </InputAdornment>
              ),
            }}
          />

          <Button
            fullWidth
            type="submit"
            variant="contained"
            disableElevation
            disabled={entrando}
            sx={{
              py: 1.5,
              borderRadius: 2,
              bgcolor: "#0f172a",
              fontSize: "1rem",
              fontWeight: 700,
              textTransform: "none",
              transition: "0.2s",
              "&:hover": {
                bgcolor: "#1e293b",
                transform: "translateY(-2px)",
                boxShadow: "0 10px 15px -3px rgba(15, 23, 42, 0.3)",
              },
            }}
          >
            {entrando ? <CircularProgress size={26} sx={{ color: "white" }} /> : "Iniciar Sesión"}
          </Button>
        </Box>
      </Paper>
    </Box>
  )
}
