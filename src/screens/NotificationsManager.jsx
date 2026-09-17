import React, { useEffect, useState } from "react";
import {
  Container,
  Box,
  Typography,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Chip,
  Stack,
  Button,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  InputAdornment,
  CircularProgress,
  Alert,
} from "@mui/material";
import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import SearchIcon from "@mui/icons-material/Search";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import Flashy from "@pablotheblink/flashyjs";
import { useAuthStore } from "../store/useAuthStore";

const ADMIN_TYPES = new Set(["admin"]);

const CATEGORY = {
  id: "viajes",
  nombre: "Viajes",
  descripcion: "Documentos y eventos subidos en un viaje (BL, POD, etc.)",
  icon: LocalShippingIcon,
  color: "#1d4ed8",
};

const NotificationsManager = () => {
  const apiHost = import.meta.env.VITE_API_HOST;
  const { user } = useAuthStore();

  const [subscribers, setSubscribers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [addUserOpen, setAddUserOpen] = useState(false);
  const [availableUsers, setAvailableUsers] = useState([]);
  const [loadingAvailable, setLoadingAvailable] = useState(false);
  const [search, setSearch] = useState("");

  const fetchSubscribers = async () => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("op", "getSubscribers");
      const res = await fetch(`${apiHost}/Notifications.php`, { method: "POST", body: formData });
      const data = await res.json();
      if (data.status === "success") setSubscribers(data.users || []);
      else Flashy.error(data.message || "Error al cargar suscriptores.");
    } catch (err) {
      Flashy.error("No se pudo conectar con el servidor.");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchSubscribers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchAvailableUsers = async () => {
    setLoadingAvailable(true);
    try {
      const formData = new FormData();
      formData.append("op", "getAvailableUsers");
      const res = await fetch(`${apiHost}/Notifications.php`, { method: "POST", body: formData });
      const data = await res.json();
      if (data.status === "success") setAvailableUsers(data.users || []);
      else Flashy.error(data.message || "Error al cargar usuarios disponibles.");
    } catch (err) {
      Flashy.error("No se pudo conectar con el servidor.");
    }
    setLoadingAvailable(false);
  };

  const handleOpenAddUser = () => {
    setSearch("");
    setAddUserOpen(true);
    fetchAvailableUsers();
  };

  const handleCloseAddUser = () => setAddUserOpen(false);

  const handleAddUser = async (userToAdd) => {
    try {
      const formData = new FormData();
      formData.append("op", "subscribe");
      formData.append("user_id", userToAdd.id);
      const res = await fetch(`${apiHost}/Notifications.php`, { method: "POST", body: formData });
      const data = await res.json();
      if (data.status === "success") {
        setSubscribers((prev) => [...prev, userToAdd]);
        setAvailableUsers((prev) => prev.filter((u) => u.id !== userToAdd.id));
        Flashy.success(`${userToAdd.name} ahora recibirá notificaciones de viajes.`);
      } else {
        Flashy.error(data.message || "Error al suscribir al usuario.");
      }
    } catch (err) {
      Flashy.error("No se pudo conectar con el servidor.");
    }
  };

  const handleRemoveUser = async (userToRemove) => {
    try {
      const formData = new FormData();
      formData.append("op", "unsubscribe");
      formData.append("user_id", userToRemove.id);
      const res = await fetch(`${apiHost}/Notifications.php`, { method: "POST", body: formData });
      const data = await res.json();
      if (data.status === "success") {
        setSubscribers((prev) => prev.filter((u) => u.id !== userToRemove.id));
        Flashy.success(`${userToRemove.name} ya no recibirá notificaciones de viajes.`);
      } else {
        Flashy.error(data.message || "Error al dar de baja al usuario.");
      }
    } catch (err) {
      Flashy.error("No se pudo conectar con el servidor.");
    }
  };

  const filteredAvailable = availableUsers.filter((u) =>
    (u.name || u.user || "").toLowerCase().includes(search.toLowerCase())
  );

  const Icon = CATEGORY.icon;
  const userType = String(user?.tipo_usuario || "").trim().toLowerCase();

  if (!user || !ADMIN_TYPES.has(userType)) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="error">Acceso denegado. Solo administradores pueden ver esta sección.</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 6 }}>
      <Box sx={{ mb: 3 }}>
        <Typography
          variant="h4"
          component="h1"
          fontWeight={800}
          sx={{ display: "flex", alignItems: "center", color: "#0f172a" }}
        >
          <NotificationsActiveIcon sx={{ mr: 1, color: "primary.main" }} />
          Notificaciones Manager
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Funcionalidades disponibles y los usuarios que reciben sus notificaciones.
        </Typography>
      </Box>

      {loading ? (
        <Box display="flex" justifyContent="center" py={6}>
          <CircularProgress />
        </Box>
      ) : (
        <List
          sx={{
            bgcolor: "#fff",
            borderRadius: 2,
            border: "1px solid #e2e8f0",
            overflow: "hidden",
          }}
        >
          <ListItem sx={{ py: 2.5, px: 3, alignItems: "flex-start" }}>
            <ListItemAvatar>
              <Avatar sx={{ bgcolor: `${CATEGORY.color}1a`, color: CATEGORY.color }}>
                <Icon />
              </Avatar>
            </ListItemAvatar>

            <ListItemText
              sx={{ mr: 2 }}
              primary={
                <Typography fontWeight={800} color="#0f172a">
                  {CATEGORY.nombre}
                </Typography>
              }
              secondary={
                <>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    {CATEGORY.descripcion}
                  </Typography>
                  <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                    {subscribers.length === 0 ? (
                      <Typography variant="caption" color="text.disabled">
                        Sin usuarios asignados
                      </Typography>
                    ) : (
                      subscribers.map((u) => (
                        <Chip
                          key={u.id}
                          label={u.name || u.user}
                          size="small"
                          onDelete={() => handleRemoveUser(u)}
                          sx={{ mb: 0.5 }}
                        />
                      ))
                    )}
                  </Stack>
                </>
              }
            />

            <Button
              variant="outlined"
              size="small"
              startIcon={<PersonAddIcon />}
              onClick={handleOpenAddUser}
              sx={{ whiteSpace: "nowrap", mt: 0.5 }}
            >
              Agregar usuario
            </Button>
          </ListItem>
        </List>
      )}

      <Dialog open={addUserOpen} onClose={handleCloseAddUser} maxWidth="xs" fullWidth>
        <DialogTitle>Agregar usuario a {CATEGORY.nombre}</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            size="small"
            placeholder="Buscar usuario..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={{ mt: 1, mb: 2 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            }}
          />
          {loadingAvailable ? (
            <Box display="flex" justifyContent="center" py={3}>
              <CircularProgress size={28} />
            </Box>
          ) : (
            <List dense sx={{ maxHeight: 280, overflowY: "auto" }}>
              {filteredAvailable.length === 0 && (
                <Typography variant="body2" color="text.secondary" sx={{ px: 1, py: 2, textAlign: "center" }}>
                  No hay usuarios disponibles.
                </Typography>
              )}
              {filteredAvailable.map((u) => (
                <ListItem key={u.id} button onClick={() => handleAddUser(u)} sx={{ borderRadius: 1 }}>
                  <ListItemAvatar>
                    <Avatar sx={{ width: 32, height: 32 }}>{(u.name || u.user).charAt(0)}</Avatar>
                  </ListItemAvatar>
                  <ListItemText primary={u.name || u.user} />
                </ListItem>
              ))}
            </List>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseAddUser}>Cerrar</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default NotificationsManager;
