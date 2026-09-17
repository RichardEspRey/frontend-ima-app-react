import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  IconButton,
  Badge,
  Popover,
  Box,
  Typography,
  List,
  ListItemButton,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Divider,
  Button,
  Tabs,
  Tab,
  IconButton as CloseButton,
} from "@mui/material";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import CloseIcon from "@mui/icons-material/Close";
import SettingsIcon from "@mui/icons-material/Settings";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import { useAuthStore } from "../store/useAuthStore";

const dateGroupLabel = (createdAt) => {
  const date = new Date(createdAt.replace(" ", "T"));
  const now = new Date();
  const startOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const diffDays = Math.round((startOfDay(now) - startOfDay(date)) / 86400000);

  if (diffDays === 0) return "Hoy";
  if (diffDays === 1) return "Ayer";
  return date.toLocaleDateString("es-MX", { day: "2-digit", month: "short", year: "2-digit" });
};

const relativeTime = (createdAt) => {
  const date = new Date(createdAt.replace(" ", "T"));
  const diffMs = Date.now() - date.getTime();
  const diffMin = Math.round(diffMs / 60000);

  if (diffMin < 1) return "Justo ahora";
  if (diffMin < 60) return `Hace ${diffMin} min`;
  const diffHrs = Math.round(diffMin / 60);
  if (diffHrs < 24) return `Hace ${diffHrs} h`;
  return dateGroupLabel(createdAt);
};

const seenKey = (userId) => `notif_seen_ids_${userId}`;

const NotificationBell = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const apiHost = import.meta.env.VITE_API_HOST;
  const isAdmin = user?.tipo_usuario?.toLowerCase() === "admin";

  const [anchorEl, setAnchorEl] = useState(null);
  const [tab, setTab] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [seenIds, setSeenIds] = useState(() => {
    try {
      return new Set(JSON.parse(localStorage.getItem(seenKey(user?.id)) || "[]"));
    } catch {
      return new Set();
    }
  });

  const open = Boolean(anchorEl);

  const fetchNotifications = async () => {
    if (!user?.id) return;
    try {
      const formData = new FormData();
      formData.append("op", "getAll");
      formData.append("user_id", user.id);
      formData.append("limit", 20);

      const res = await fetch(`${apiHost}/Notifications.php`, { method: "POST", body: formData });
      const data = await res.json();
      if (data.status === "success" && Array.isArray(data.notifications)) {
        setNotifications(data.notifications);
      }
    } catch (err) {
      console.error("[NotificationBell] Error al obtener notificaciones:", err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const intervalId = setInterval(fetchNotifications, 15000);
    return () => clearInterval(intervalId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const unreadCount = notifications.filter((n) => !seenIds.has(n.id)).length;

  const handleOpen = (e) => setAnchorEl(e.currentTarget);

  const handleClose = () => {
    setAnchorEl(null);
    const updated = new Set(seenIds);
    notifications.forEach((n) => updated.add(n.id));
    setSeenIds(updated);
    try {
      localStorage.setItem(seenKey(user?.id), JSON.stringify([...updated]));
    } catch {
      // localStorage no disponible, se pierde el estado de "leído" al refrescar
    }
  };

  const filtered = useMemo(() => {
    if (tab === 1) return notifications.filter((n) => !seenIds.has(n.id));
    if (tab === 2) return notifications.filter((n) => seenIds.has(n.id));
    return notifications;
  }, [notifications, seenIds, tab]);

  const groups = useMemo(() => {
    const order = [];
    const map = new Map();
    filtered.forEach((n) => {
      const group = dateGroupLabel(n.created_at);
      if (!map.has(group)) {
        map.set(group, []);
        order.push(group);
      }
      map.get(group).push(n);
    });
    return order.map((group) => ({ group, items: map.get(group) }));
  }, [filtered]);

  return (
    <>
      <IconButton onClick={handleOpen} sx={{ color: "#0f172a" }}>
        <Badge badgeContent={unreadCount} color="primary">
          <NotificationsNoneIcon />
        </Badge>
      </IconButton>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        slotProps={{
          paper: {
            sx: {
              width: 400,
              maxHeight: 560,
              mt: 1,
              borderRadius: 3,
              boxShadow: "0 12px 32px rgba(15, 23, 42, 0.16)",
            },
          },
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", px: 2.5, pt: 2, pb: 1.5 }}>
          <Typography variant="subtitle1" fontWeight={800} color="#0f172a">
            Notice Board
          </Typography>
          <CloseButton size="small" onClick={handleClose}>
            <CloseIcon fontSize="small" />
          </CloseButton>
        </Box>

        <Tabs
          value={tab}
          onChange={(_, v) => setTab(v)}
          sx={{
            px: 2.5,
            minHeight: 36,
            borderBottom: "1px solid #e2e8f0",
            "& .MuiTab-root": { minHeight: 36, textTransform: "none", fontWeight: 700, color: "#64748b" },
            "& .Mui-selected": { color: "#0f172a !important" },
            "& .MuiTabs-indicator": { backgroundColor: "#0f172a" },
          }}
        >
          <Tab label="All" />
          <Tab label="Unread" />
          <Tab label="Read" />
        </Tabs>

        <Box sx={{ maxHeight: 440, overflowY: "auto" }}>
          {groups.length === 0 && (
            <Typography variant="body2" color="#94a3b8" sx={{ px: 2.5, py: 4, textAlign: "center" }}>
              No hay notificaciones
            </Typography>
          )}

          {groups.map(({ group, items }) => (
            <Box key={group}>
              <Typography
                variant="caption"
                sx={{ px: 2.5, pt: 1.5, pb: 0.5, display: "block", color: "#94a3b8", fontWeight: 700 }}
              >
                {group}
              </Typography>
              <List disablePadding>
                {items.map((n) => {
                  const isUnread = !seenIds.has(n.id);
                  return (
                    <ListItemButton
                      key={n.id}
                      onClick={() => {
                        handleClose();
                        navigate(`/edit-trip/${n.trip_id}`);
                      }}
                      sx={{
                        px: 2.5,
                        py: 1.25,
                        alignItems: "flex-start",
                        bgcolor: isUnread ? "#f0faf5" : "transparent",
                        "&:hover": { bgcolor: isUnread ? "#e6f6ee" : "#f8fafc" },
                      }}
                    >
                      <ListItemAvatar sx={{ minWidth: 44 }}>
                        <Avatar sx={{ bgcolor: "#e0e9fd", color: "#1d4ed8", width: 36, height: 36 }}>
                          <LocalShippingIcon fontSize="small" />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Typography variant="body2" fontWeight={800} color="#0f172a">
                            {`Viaje #${n.trip_id}`}
                          </Typography>
                        }
                        secondary={
                          <Typography variant="caption" color="#64748b" noWrap sx={{ display: "block" }}>
                            {n.Mensaje}
                          </Typography>
                        }
                      />
                      <Box sx={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 0.5, ml: 1 }}>
                        <Typography variant="caption" color="#94a3b8" whiteSpace="nowrap">
                          {relativeTime(n.created_at)}
                        </Typography>
                        {isUnread && (
                          <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: "#2563eb" }} />
                        )}
                      </Box>
                    </ListItemButton>
                  );
                })}
              </List>
              <Divider />
            </Box>
          ))}
        </Box>

        {isAdmin && (
          <Box sx={{ px: 2, py: 1.25 }}>
            <Button
              fullWidth
              size="small"
              startIcon={<SettingsIcon fontSize="small" />}
              sx={{ textTransform: "none", fontWeight: 700, color: "#0f172a" }}
              onClick={() => {
                handleClose();
                navigate("/notifications-manager");
              }}
            >
              Notificaciones manager
            </Button>
          </Box>
        )}
      </Popover>
    </>
  );
};

export default NotificationBell;
