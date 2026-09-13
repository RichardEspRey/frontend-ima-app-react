import React, { useMemo, useState } from "react";
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
} from "@mui/material";
import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import SearchIcon from "@mui/icons-material/Search";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import PointOfSaleIcon from "@mui/icons-material/PointOfSale";

// Datos dummy — a futuro vendrán de notification_categories / user_notification_subscriptions.
const INITIAL_CATEGORIES = [
  {
    id: "viajes",
    nombre: "Viajes",
    descripcion: "Documentos y eventos subidos en un viaje (BL, POD, etc.)",
    icon: LocalShippingIcon,
    color: "#1d4ed8",
    users: [
      { id: 1, name: "Juan Pérez" },
      { id: 2, name: "Pedro Gómez" },
    ],
  },
  {
    id: "compras",
    nombre: "Compras",
    descripcion: "Órdenes de compra creadas y aprobaciones pendientes",
    icon: ShoppingCartIcon,
    color: "#b5651d",
    users: [{ id: 3, name: "María López" }],
  },
  {
    id: "ventas",
    nombre: "Ventas",
    descripcion: "Cotizaciones y ventas cerradas",
    icon: PointOfSaleIcon,
    color: "#1a9d5b",
    users: [],
  },
];

// Dummy pool de usuarios disponibles para asignar.
const ALL_USERS = [
  { id: 1, name: "Juan Pérez" },
  { id: 2, name: "Pedro Gómez" },
  { id: 3, name: "María López" },
  { id: 4, name: "Ana Torres" },
  { id: 5, name: "Carlos Ruiz" },
  { id: 6, name: "Sofía Ramírez" },
];

const NotificationsManager = () => {
  const [categories, setCategories] = useState(INITIAL_CATEGORIES);
  const [addUserFor, setAddUserFor] = useState(null); // categoria seleccionada
  const [search, setSearch] = useState("");

  const handleOpenAddUser = (category) => {
    setAddUserFor(category);
    setSearch("");
  };

  const handleCloseAddUser = () => setAddUserFor(null);

  const handleAddUser = (userToAdd) => {
    setCategories((prev) =>
      prev.map((cat) =>
        cat.id === addUserFor.id
          ? { ...cat, users: [...cat.users, userToAdd] }
          : cat
      )
    );
    setAddUserFor((prev) => ({ ...prev, users: [...prev.users, userToAdd] }));
  };

  const handleRemoveUser = (categoryId, userId) => {
    setCategories((prev) =>
      prev.map((cat) =>
        cat.id === categoryId
          ? { ...cat, users: cat.users.filter((u) => u.id !== userId) }
          : cat
      )
    );
  };

  const availableUsers = useMemo(() => {
    if (!addUserFor) return [];
    const alreadyAssigned = new Set(addUserFor.users.map((u) => u.id));
    return ALL_USERS.filter(
      (u) =>
        !alreadyAssigned.has(u.id) &&
        u.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [addUserFor, search]);

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

      <List
        sx={{
          bgcolor: "#fff",
          borderRadius: 2,
          border: "1px solid #e2e8f0",
          overflow: "hidden",
        }}
      >
        {categories.map((cat, idx) => {
          const Icon = cat.icon;
          return (
            <React.Fragment key={cat.id}>
              {idx > 0 && <Divider />}
              <ListItem sx={{ py: 2.5, px: 3, alignItems: "flex-start" }}>
                <ListItemAvatar>
                  <Avatar sx={{ bgcolor: `${cat.color}1a`, color: cat.color }}>
                    <Icon />
                  </Avatar>
                </ListItemAvatar>

                <ListItemText
                  sx={{ mr: 2 }}
                  primary={
                    <Typography fontWeight={800} color="#0f172a">
                      {cat.nombre}
                    </Typography>
                  }
                  secondary={
                    <>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        {cat.descripcion}
                      </Typography>
                      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                        {cat.users.length === 0 ? (
                          <Typography variant="caption" color="text.disabled">
                            Sin usuarios asignados
                          </Typography>
                        ) : (
                          cat.users.map((u) => (
                            <Chip
                              key={u.id}
                              label={u.name}
                              size="small"
                              onDelete={() => handleRemoveUser(cat.id, u.id)}
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
                  onClick={() => handleOpenAddUser(cat)}
                  sx={{ whiteSpace: "nowrap", mt: 0.5 }}
                >
                  Agregar usuario
                </Button>
              </ListItem>
            </React.Fragment>
          );
        })}
      </List>

      <Dialog open={!!addUserFor} onClose={handleCloseAddUser} maxWidth="xs" fullWidth>
        <DialogTitle>
          Agregar usuario a {addUserFor?.nombre}
        </DialogTitle>
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
          <List dense sx={{ maxHeight: 280, overflowY: "auto" }}>
            {availableUsers.length === 0 && (
              <Typography variant="body2" color="text.secondary" sx={{ px: 1, py: 2, textAlign: "center" }}>
                No hay usuarios disponibles.
              </Typography>
            )}
            {availableUsers.map((u) => (
              <ListItem
                key={u.id}
                button
                onClick={() => handleAddUser(u)}
                sx={{ borderRadius: 1 }}
              >
                <ListItemAvatar>
                  <Avatar sx={{ width: 32, height: 32 }}>{u.name.charAt(0)}</Avatar>
                </ListItemAvatar>
                <ListItemText primary={u.name} />
              </ListItem>
            ))}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseAddUser}>Cerrar</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default NotificationsManager;
