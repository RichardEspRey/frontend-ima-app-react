export const SECTION_LABEL_SX = {
  color: '#94a3b8', fontWeight: 700, letterSpacing: '0.08em', fontSize: '0.68rem',
};

export const CARD_SX = { p: 3, borderRadius: 2, border: '1px solid #e2e8f0' };

export const HEADER_ROW_SX = { bgcolor: '#fafbfc', borderBottom: '1px solid #e2e8f0' };

export const HEADER_CELL_SX = {
  fontWeight: 700, color: '#94a3b8', fontSize: '0.7rem',
  textTransform: 'uppercase', letterSpacing: '0.06em', borderBottom: 'none',
};

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

export const customSelectStyles = {
  control: (provided, state) => ({
    ...provided,
    minHeight: 40,
    borderRadius: 8,
    fontSize: '0.9rem',
    backgroundColor: '#fff',
    borderColor: state.isFocused ? '#0f172a' : '#cbd5e1',
    boxShadow: state.isFocused ? '0 0 0 1px #0f172a' : 'none',
    '&:hover': { borderColor: state.isFocused ? '#0f172a' : '#94a3b8' },
  }),
  placeholder: (provided) => ({ ...provided, color: '#94a3b8' }),
  menu: (provided) => ({ ...provided, zIndex: 9999, borderRadius: 8, overflow: 'hidden' }),
  option: (provided, state) => ({
    ...provided,
    fontSize: '0.9rem',
    backgroundColor: state.isSelected ? '#0f172a' : state.isFocused ? '#f1f5f9' : '#fff',
    color: state.isSelected ? '#fff' : '#334155',
  }),
};

export const DATEPICKER_CSS = `
  .expense-datepicker {
    padding: 8.5px 12px;
    border: 1px solid #cbd5e1;
    border-radius: 8px;
    width: 100%;
    font-size: 0.9rem;
    color: #334155;
    box-sizing: border-box;
    height: 40px;
    background: #fff;
    transition: border-color .15s, box-shadow .15s;
  }
  .expense-datepicker:focus {
    border-color: #0f172a;
    box-shadow: 0 0 0 1px #0f172a;
    outline: none;
  }
  .expense-datepicker-wrapper { width: 100%; display: block; }
  .expense-datepicker-popper { z-index: 20; }
`;

export const money = (v) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(v || 0));

export const moneyMXN = (v) =>
  new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(Number(v || 0));
