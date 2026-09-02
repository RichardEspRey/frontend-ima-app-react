import { createTheme } from "@mui/material/styles"
import { BORDE, COLOR, RADIO, SOMBRA, TIPO } from "../shared/ui/tokens"

/**
 * El tema de MUI, construido con los tokens de `shared/ui/tokens`.
 *
 * Es la pieza que homogeneiza la app sin tocar archivo por archivo. Hasta ahora
 * no había ningún tema, así que cada componente de MUI usaba sus valores por
 * omisión —el azul `#1976d2`, las esquinas de 4 px, los botones en MAYÚSCULAS— y
 * las pantallas que sí tenían un aspecto cuidado lo conseguían escribiendo el
 * color a mano en cada `sx`. De ahí que hubiera 1 212 colores sueltos.
 *
 * Con el tema puesto, una pantalla que no se haya migrado ya se ve de la familia
 * correcta: hereda la tipografía, el radio, los bordes y el color de marca. Los
 * `sx` sueltos siguen funcionando y siguen ganando, así que ponerlo no rompe
 * nada de lo que ya estaba bien.
 *
 * El color primario es la tinta oscura de las pantallas de referencia, no un
 * azul. Los colores con significado —error, aviso, éxito— sí se conservan
 * distintos: ahí el color es información, no decoración.
 */
export const tema = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: COLOR.TINTA,
      light: COLOR.TINTA_CLARA,
      dark: COLOR.TINTA,
      contrastText: COLOR.BLANCO,
    },
    secondary: { main: COLOR.APAGADO, contrastText: COLOR.BLANCO },
    success: { main: COLOR.EXITO, light: COLOR.EXITO_FONDO },
    error: { main: COLOR.PELIGRO, light: COLOR.PELIGRO_FONDO },
    warning: { main: COLOR.AVISO, light: COLOR.AVISO_FONDO },
    info: { main: COLOR.INFO, light: COLOR.INFO_FONDO },
    background: { default: COLOR.LIENZO, paper: COLOR.BLANCO },
    text: {
      primary: COLOR.TINTA,
      secondary: COLOR.APAGADO,
      disabled: COLOR.TENUE,
    },
    divider: COLOR.BORDE,
  },

  shape: { borderRadius: RADIO.NORMAL },

  typography: {
    fontFamily: TIPO.FAMILIA,
    h4: { fontWeight: 800, color: COLOR.TINTA },
    h5: { fontWeight: 700, color: COLOR.TINTA },
    h6: { fontWeight: 700, color: COLOR.TINTA },
    subtitle1: { fontWeight: 600 },
    subtitle2: { fontWeight: 600, color: COLOR.TEXTO_SUAVE },
    body2: { color: COLOR.TEXTO },
    overline: { ...TIPO.ETIQUETA, color: COLOR.TENUE },
    button: { textTransform: "none", fontWeight: 600 },
  },

  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: { backgroundColor: COLOR.LIENZO },
      },
    },

    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: { borderRadius: RADIO.NORMAL, paddingInline: 20 },
        containedPrimary: {
          "&:hover": { backgroundColor: COLOR.TINTA_CLARA, boxShadow: SOMBRA.FLOTANTE },
        },
        outlined: { borderColor: COLOR.BORDE_FUERTE, color: COLOR.TEXTO },
      },
    },

    MuiIconButton: {
      styleOverrides: { root: { borderRadius: RADIO.NORMAL } },
    },

    MuiPaper: {
      styleOverrides: {
        // MUI pinta un degradado sobre el papel elevado; aquí estorba, porque el
        // lenguaje de la app separa con bordes de 1 px, no con relieve.
        root: { backgroundImage: "none" },
        rounded: { borderRadius: RADIO.GRANDE },
      },
    },

    MuiDialog: {
      styleOverrides: {
        paper: { borderRadius: RADIO.GRANDE, overflow: "hidden" },
      },
    },

    MuiDialogTitle: {
      styleOverrides: {
        root: { fontWeight: 700, color: COLOR.TINTA, borderBottom: BORDE },
      },
    },

    MuiTableCell: {
      styleOverrides: {
        root: { borderBottomColor: COLOR.BORDE, color: COLOR.TEXTO },
        head: { ...TIPO.CABECERA_TABLA, color: COLOR.TENUE, backgroundColor: COLOR.CABECERA },
      },
    },

    MuiTableContainer: {
      styleOverrides: { root: { borderRadius: RADIO.NORMAL } },
    },

    MuiChip: {
      styleOverrides: {
        root: { fontWeight: 600, borderRadius: RADIO.CHICO },
        outlined: { borderColor: COLOR.BORDE },
      },
    },

    MuiOutlinedInput: {
      styleOverrides: {
        // Sin fondo: el color de la superficie lo decide quien coloca el campo.
        // Forzarlo aquí pintaba de blanco los campos que van sobre un panel
        // oscuro —el buscador del Tracking— y su texto blanco desaparecía.
        root: {
          borderRadius: RADIO.NORMAL,
          "& fieldset": { borderColor: COLOR.BORDE },
          "&:hover fieldset": { borderColor: COLOR.BORDE_FUERTE },
        },
      },
    },

    MuiInputLabel: {
      styleOverrides: { root: { color: COLOR.APAGADO } },
    },

    MuiTabs: {
      styleOverrides: { root: { minHeight: 40 } },
    },

    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: "none",
          fontWeight: 600,
          minHeight: 40,
          color: COLOR.APAGADO,
          "&.Mui-selected": { color: COLOR.TINTA },
        },
      },
    },

    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          backgroundColor: COLOR.TINTA,
          fontSize: "0.75rem",
          borderRadius: RADIO.CHICO,
        },
      },
    },

    MuiMenu: {
      styleOverrides: {
        paper: { borderRadius: RADIO.NORMAL, boxShadow: SOMBRA.MENU, border: BORDE },
      },
    },

    MuiDivider: {
      styleOverrides: { root: { borderColor: COLOR.BORDE } },
    },

    MuiAlert: {
      styleOverrides: { root: { borderRadius: RADIO.NORMAL } },
    },

    MuiLinearProgress: {
      styleOverrides: { root: { borderRadius: RADIO.CHICO, height: 6 } },
    },
  },
})
