import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  IconButton,
  Badge,
  Popover,
  Box,
  Typography,
  Tabs,
  Tab,
  List,
  ListItemButton,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Divider,
  Button,
  IconButton as CloseButton,
} from "@mui/material";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import CloseIcon from "@mui/icons-material/Close";
import SettingsIcon from "@mui/icons-material/Settings";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import LightbulbIcon from "@mui/icons-material/Lightbulb";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import EventIcon from "@mui/icons-material/Event";
import CampaignIcon from "@mui/icons-material/Campaign";

// Datos dummy — a futuro esto vendrá del endpoint de notificaciones.
const DUMMY_NOTIFICATIONS = [
  {
    id: 1,
    group: "New",
    type: "payment",
    title: "Upcoming Fee Payment",
    description: "Your semester fee is due on June 1st....",
    time: "12 min ago",
    unread: true,
  },
  {
    id: 2,
    group: "New",
    type: "quiz",
    title: "New Quiz Available",
    description: "Quiz on Chapter 5 is now available. Du...",
    time: "25 min ago",
    unread: true,
  },
  {
    id: 3,
    group: "Yesterday",
    type: "assignment",
    title: "New Assignment Posted",
    description: "Submit your essay on 'Climate Change...",
    time: "1 days ago",
    unread: false,
  },
  {
    id: 4,
    group: "Yesterday",
    type: "assignment",
    title: "New Assignment Posted",
    description: "Submit your essay on 'Climate Change...",
    time: "1 days ago",
    unread: false,
  },
  {
    id: 5,
    group: "Yesterday",
    type: "quiz",
    title: "New Quiz Available",
    description: "Quiz on Chapter 5 is now available. Du...",
    time: "1 days ago",
    unread: false,
  },
  {
    id: 6,
    group: "May 25, 24",
    type: "deadline",
    title: "Deadline Reminder",
    description: "Submit your lab report by May 20th.",
    time: "May 25, 24",
    unread: false,
  },
  {
    id: 7,
    group: "May 25, 24",
    type: "announcement",
    title: "New Announcement",
    description: "Your semester fee is due on June 1st....",
    time: "May 25, 24",
    unread: false,
  },
];

const ICON_STYLES = {
  payment: { icon: AccountBalanceWalletIcon, bg: "#fdf1e7", color: "#b5651d" },
  quiz: { icon: LightbulbIcon, bg: "#fef3e2", color: "#f0a500" },
  assignment: { icon: MenuBookIcon, bg: "#fef3e2", color: "#e07a1f" },
  deadline: { icon: EventIcon, bg: "#fde8e8", color: "#e53e3e" },
  announcement: { icon: CampaignIcon, bg: "#e6f7ee", color: "#1a9d5b" },
};

const TABS = ["All", "Unread", "Read"];

const NotificationBell = () => {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const [tab, setTab] = useState(0);

  const open = Boolean(anchorEl);
  const unreadCount = DUMMY_NOTIFICATIONS.filter((n) => n.unread).length;

  const filtered = useMemo(() => {
    if (tab === 1) return DUMMY_NOTIFICATIONS.filter((n) => n.unread);
    if (tab === 2) return DUMMY_NOTIFICATIONS.filter((n) => !n.unread);
    return DUMMY_NOTIFICATIONS;
  }, [tab]);

  const groups = useMemo(() => {
    const order = [];
    const map = new Map();
    filtered.forEach((n) => {
      if (!map.has(n.group)) {
        map.set(n.group, []);
        order.push(n.group);
      }
      map.get(n.group).push(n);
    });
    return order.map((group) => ({ group, items: map.get(group) }));
  }, [filtered]);

  return (
    <>
      <IconButton onClick={(e) => setAnchorEl(e.currentTarget)} sx={{ color: "#0f172a" }}>
        <Badge badgeContent={unreadCount} color="primary">
          <NotificationsNoneIcon />
        </Badge>
      </IconButton>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={() => setAnchorEl(null)}
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
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", px: 2.5, pt: 2, pb: 1 }}>
          <Typography variant="subtitle1" fontWeight={800} color="#0f172a">
            Notice Board
          </Typography>
          <CloseButton size="small" onClick={() => setAnchorEl(null)}>
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
          {TABS.map((label) => (
            <Tab key={label} label={label} />
          ))}
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
                  const style = ICON_STYLES[n.type];
                  const Icon = style.icon;
                  return (
                    <ListItemButton
                      key={n.id}
                      sx={{
                        px: 2.5,
                        py: 1.25,
                        alignItems: "flex-start",
                        bgcolor: n.unread ? "#f0faf5" : "transparent",
                        "&:hover": { bgcolor: n.unread ? "#e6f6ee" : "#f8fafc" },
                      }}
                    >
                      <ListItemAvatar sx={{ minWidth: 44 }}>
                        <Avatar sx={{ bgcolor: style.bg, color: style.color, width: 36, height: 36 }}>
                          <Icon fontSize="small" />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Typography variant="body2" fontWeight={800} color="#0f172a">
                            {n.title}
                          </Typography>
                        }
                        secondary={
                          <Typography variant="caption" color="#64748b" noWrap sx={{ display: "block" }}>
                            {n.description}
                          </Typography>
                        }
                      />
                      <Box sx={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 0.5, ml: 1 }}>
                        <Typography variant="caption" color="#94a3b8" whiteSpace="nowrap">
                          {n.time}
                        </Typography>
                        {n.unread && (
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

        <Divider />
        <Box sx={{ px: 2, py: 1.25 }}>
          <Button
            fullWidth
            size="small"
            startIcon={<SettingsIcon fontSize="small" />}
            sx={{ textTransform: "none", fontWeight: 700, color: "#0f172a" }}
            onClick={() => {
              setAnchorEl(null);
              navigate("/notifications-manager");
            }}
          >
            Notificaciones manager
          </Button>
        </Box>
      </Popover>
    </>
  );
};

export default NotificationBell;
