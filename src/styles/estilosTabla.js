export const PAGE_SHELL_SX = { p: { xs: 2, md: 4 }, minHeight: '100vh', bgcolor: '#f8fafc' };

export const SECTION_LABEL_SX = {
  color: '#94a3b8', fontWeight: 700, letterSpacing: '0.08em', fontSize: '0.68rem',
};

export const PAGE_OVERLINE_SX = {
  ...SECTION_LABEL_SX, letterSpacing: '0.12em', fontSize: '0.7rem', lineHeight: 1,
};

export const PAGE_TITLE_SX = { mt: 0.25 };

export const CARD_SX = { p: 3, borderRadius: 2, border: '1px solid #e2e8f0' };

export const HEADER_ROW_SX = { bgcolor: '#fafbfc', borderBottom: '1px solid #e2e8f0' };

export const HEADER_CELL_SX = {
  fontWeight: 700, color: '#94a3b8', fontSize: '0.7rem',
  textTransform: 'uppercase', letterSpacing: '0.06em', borderBottom: 'none',
};

export const TABLE_CONTAINER_SX = {
  border: '1px solid #e2e8f0', borderRadius: 2, overflowX: 'auto',
};

export const PAGINATION_BOX_SX = {
  bgcolor: 'white', border: '1px solid #e2e8f0', borderTop: 'none',
  borderBottomLeftRadius: 8, borderBottomRightRadius: 8,
};

export const PAGINATION_SX = {
  color: '#475569',
  '.MuiTablePagination-selectLabel, .MuiTablePagination-displayedRows': { fontSize: '0.8rem' },
};

export const TABS_WRAPPER_SX = {
  mb: 3, display: 'inline-flex', bgcolor: '#f1f5f9', borderRadius: 2.5, p: 0.5,
};

export const TAB_SX = {
  minHeight: 36, minWidth: 0, px: 2.5, py: 1, borderRadius: 2,
  fontWeight: 600, fontSize: '0.85rem', textTransform: 'none',
  color: '#64748b', transition: 'background-color 0.15s, color 0.15s',
  '&.Mui-selected': { bgcolor: '#0f172a', color: '#fff' },
};

export const CHIP_SX = {
  height: 22, fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.04em',
  textTransform: 'none',
};

export const CHIP_OK_SX = {
  ...CHIP_SX, bgcolor: '#f0fdf4', color: '#15803d', border: '1px solid #bbf7d0',
};

export const CHIP_DANGER_SX = {
  ...CHIP_SX, bgcolor: '#fef2f2', color: '#b91c1c', border: '1px solid #fecaca',
};

export const ICON_BTN_SX = {
  border: '1px solid #e2e8f0', bgcolor: '#fff', color: '#475569',
  '&:hover': { bgcolor: '#f8fafc', borderColor: '#cbd5e1' },
};

export const CELL_STRONG_SX = { color: '#0f172a', fontWeight: 600 };
export const CELL_SX = { color: '#334155' };
export const CELL_MUTED_SX = { color: '#475569' };

export const DARK_BTN_SX = {
  bgcolor: '#0f172a', fontWeight: 700, borderRadius: 2, px: 3, py: 1.1,
  textTransform: 'none', boxShadow: 'none', transition: 'all 0.15s',
  '&:hover': { bgcolor: '#1e293b', boxShadow: '0 6px 16px rgba(15,23,42,0.22)' },
  '&.Mui-disabled': { bgcolor: '#cbd5e1', color: '#fff' },
};

export const GHOST_BTN_SX = {
  bgcolor: 'white', borderColor: '#cbd5e1', color: '#334155',
  fontWeight: 600, textTransform: 'none', borderRadius: 2, px: 2.5, py: 1.1,
};

export const INPUT_SX = { borderRadius: 2 };
