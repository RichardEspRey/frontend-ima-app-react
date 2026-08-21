import { useState } from 'react';
import {
  Box, Paper, Typography, Stack, Chip, Divider, Dialog,
  DialogContent, IconButton, Button, ButtonBase
} from '@mui/material';
import RouteOutlinedIcon from '@mui/icons-material/RouteOutlined';
import SignpostOutlinedIcon from '@mui/icons-material/SignpostOutlined';
import FoundationOutlinedIcon from '@mui/icons-material/FoundationOutlined';
import MenuBookOutlinedIcon from '@mui/icons-material/MenuBookOutlined';
import FactCheckOutlinedIcon from '@mui/icons-material/FactCheckOutlined';
import NoCrashOutlinedIcon from '@mui/icons-material/NoCrashOutlined';
import TireRepairOutlinedIcon from '@mui/icons-material/TireRepairOutlined';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import CloseIcon from '@mui/icons-material/Close';

import logoWhite from '../assets/images/logo_white.png';

// Las 6 tarjetas van en una sola retícula para que el número de columnas
// siempre divida exacto a 6 y no quede ninguna huérfana a media fila.
// El sidebar ocupa 280px fijos: por debajo de `lg` las 3 columnas darían
// tarjetas de menos de 250px.
const MOSAIC_SX = {
  display: 'grid',
  gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' },
  gap: { xs: 2, lg: 2.5 },
};

const SECTION_LABEL_SX = {
  color: '#94a3b8', fontWeight: 700, letterSpacing: '0.08em', fontSize: '0.68rem',
};
const CARD_SX = {
  p: { xs: 2.5, lg: 3 }, borderRadius: 2, border: '1px solid #e2e8f0',
  height: '100%', display: 'flex', flexDirection: 'column',
};
const BODY_SX = {
  color: '#475569', lineHeight: 1.65, fontSize: '0.875rem',
};
const ICON_BOX_SX = {
  width: 38, height: 38, borderRadius: 2, display: 'inline-flex',
  alignItems: 'center', justifyContent: 'center', flexShrink: 0,
};
const CLOSE_BTN_SX = {
  bgcolor: '#0f172a', fontWeight: 700, borderRadius: 2, px: 3,
  textTransform: 'none', boxShadow: 'none',
  '&:hover': { bgcolor: '#1e293b', boxShadow: '0 6px 16px rgba(15,23,42,0.22)' },
};

const CardHeader = ({ icon, accent, tint, eyebrow, title }) => (
  <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 1.5 }}>
    <Box sx={{ ...ICON_BOX_SX, bgcolor: tint, color: accent }}>{icon}</Box>
    <Box sx={{ minWidth: 0 }}>
      <Typography variant="overline" sx={SECTION_LABEL_SX}>{eyebrow}</Typography>
      <Typography variant="h6" fontWeight={800} color="#0f172a" letterSpacing="-0.02em" sx={{ lineHeight: 1.2 }}>
        {title}
      </Typography>
    </Box>
  </Stack>
);

const PolicyCard = ({ icon, accent, tint, title, teaser, onClick }) => (
  <ButtonBase
    onClick={onClick}
    sx={{
      width: '100%', height: '100%', textAlign: 'left', borderRadius: 2,
      display: 'block', transition: 'transform 0.15s',
      '&:hover': { transform: 'translateY(-3px)' },
      '&:hover .policy-paper': { borderColor: accent, boxShadow: '0 10px 24px rgba(15,23,42,0.10)' },
      '&:hover .policy-cta': { color: accent, gap: 1.25 },
      '&:focus-visible .policy-paper': { borderColor: accent, outline: `2px solid ${accent}`, outlineOffset: 2 },
    }}
  >
    <Paper
      elevation={0}
      className="policy-paper"
      sx={{ ...CARD_SX, transition: 'border-color 0.15s, box-shadow 0.15s' }}
    >
      <CardHeader icon={icon} accent={accent} tint={tint} eyebrow="Política" title={title} />

      <Typography sx={{ ...BODY_SX, flexGrow: 1 }}>{teaser}</Typography>

      <Stack
        direction="row" alignItems="center" gap={0.75}
        className="policy-cta"
        sx={{ mt: 1.5, color: '#94a3b8', fontWeight: 700, fontSize: '0.78rem', transition: 'color 0.15s, gap 0.15s' }}
      >
        Leer completa <ArrowForwardIcon sx={{ fontSize: 15 }} />
      </Stack>
    </Paper>
  </ButtonBase>
);

const PolicyDialogHeader = ({ icon, accent, tint, title, onClose }) => (
  <Stack direction="row" alignItems="flex-start" spacing={2} sx={{ mb: 2.5 }}>
    <Box sx={{ ...ICON_BOX_SX, width: 46, height: 46, bgcolor: tint, color: accent }}>{icon}</Box>
    <Box sx={{ flexGrow: 1, minWidth: 0 }}>
      <Typography variant="overline" sx={SECTION_LABEL_SX}>IMA EXPRESS LLC</Typography>
      <Typography variant="h5" fontWeight={800} color="#0f172a" letterSpacing="-0.02em" sx={{ lineHeight: 1.2 }}>
        {title}
      </Typography>
    </Box>
    <IconButton onClick={onClose} sx={{ color: '#94a3b8', mt: -0.5, mr: -1 }}>
      <CloseIcon />
    </IconButton>
  </Stack>
);

export const Welcome = () => {
  const [openPolicy, setOpenPolicy] = useState(null);
  const closePolicy = () => setOpenPolicy(null);

  return (
    /* Sin padding ni minHeight: DashboardLayout ya los aplica y es quien hace scroll. */
    <Box>

      <Paper
        elevation={0}
        sx={{
          p: { xs: 2.5, sm: 3, lg: 4 }, mb: { xs: 2, lg: 2.5 }, borderRadius: 3,
          position: 'relative', overflow: 'hidden',
          background: 'linear-gradient(120deg, #0f172a 0%, #1e293b 55%, #334155 100%)',
        }}
      >
        <Box
          sx={{
            position: 'absolute', top: -120, right: -80, width: 380, height: 380, borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(148,163,184,0.22) 0%, rgba(15,23,42,0) 70%)',
            pointerEvents: 'none',
          }}
        />
        <Box sx={{ position: 'relative' }}>
          <Box
            component="img"
            src={logoWhite}
            alt="IMA EXPRESS"
            sx={{ height: { xs: 26, sm: 30, lg: 34 }, mb: { xs: 1.5, lg: 2 }, objectFit: 'contain' }}
          />
          <Typography
            variant="overline"
            sx={{ color: 'rgba(226,232,240,0.65)', fontWeight: 700, letterSpacing: '0.12em', fontSize: '0.68rem', display: 'block', lineHeight: 1 }}
          >
            Quiénes somos
          </Typography>
          <Typography
            variant="h3"
            fontWeight={800}
            letterSpacing="-0.02em"
            sx={{ color: '#fff', mt: 0.75, fontSize: { xs: '1.45rem', sm: '1.65rem', lg: '1.9rem' } }}
          >
            Bienvenido a IMA EXPRESS
          </Typography>
          <Typography
            sx={{ color: 'rgba(226,232,240,0.75)', mt: 0.75, maxWidth: 680, lineHeight: 1.55, fontSize: '0.875rem' }}
          >
            Nuestra misión, visión y valores, y las políticas que guían cada una de
            nuestras operaciones en México y Estados Unidos. Toca una política para leerla completa.
          </Typography>
        </Box>
      </Paper>

      <Box sx={MOSAIC_SX}>

        <Paper elevation={0} sx={CARD_SX}>
          <CardHeader
            icon={<RouteOutlinedIcon />}
            accent="#4338ca"
            tint="#eef2ff"
            eyebrow="Nuestro propósito"
            title="Misión"
          />
          <Typography sx={BODY_SX}>
            Brindar servicios de transporte de carga seguros, confiables y eficientes, generando
            valor para nuestros clientes, colaboradores y socios comerciales mediante un servicio
            profesional y de calidad.
          </Typography>
        </Paper>

        <Paper elevation={0} sx={CARD_SX}>
          <CardHeader
            icon={<SignpostOutlinedIcon />}
            accent="#0f766e"
            tint="#f0fdfa"
            eyebrow="Hacia dónde vamos"
            title="Visión"
          />
          <Typography sx={BODY_SX}>
            Ser una empresa de transporte donde las personas se sientan motivadas a dar lo mejor,
            construyendo relaciones sólidas con clientes y proveedores para generar valor mutuo y
            alcanzar un crecimiento sostenible.
          </Typography>
        </Paper>

        <Paper elevation={0} sx={CARD_SX}>
          <CardHeader
            icon={<FoundationOutlinedIcon />}
            accent="#b45309"
            tint="#fef3c7"
            eyebrow="Lo que nos define"
            title="Valores"
          />
          <Stack direction="row" flexWrap="wrap" gap={0.75} sx={{ mb: 1.5 }}>
            {['Seguridad', 'Responsabilidad', 'Honestidad', 'Compromiso', 'Trabajo en equipo', 'Calidad'].map((valor) => (
              <Chip
                key={valor}
                label={valor}
                size="small"
                sx={{
                  fontWeight: 700, fontSize: '0.72rem', bgcolor: '#f1f5f9',
                  color: '#334155', border: '1px solid #e2e8f0',
                }}
              />
            ))}
          </Stack>
          <Typography sx={BODY_SX}>
            En IMA EXPRESS creemos en la seguridad, responsabilidad, honestidad, compromiso, trabajo
            en equipo y calidad. Estos valores guían nuestra forma de trabajar, nuestras decisiones
            y la manera en que construimos relaciones con nuestros colaboradores, clientes y socios
            comerciales.
          </Typography>
        </Paper>

        <PolicyCard
          icon={<MenuBookOutlinedIcon />}
          accent="#4338ca"
          tint="#eef2ff"
          title="Política General"
          teaser="Nuestro compromiso con un servicio seguro, puntual y transparente, en cumplimiento con las leyes de México y Estados Unidos."
          onClick={() => setOpenPolicy('general')}
        />

        <PolicyCard
          icon={<FactCheckOutlinedIcon />}
          accent="#b45309"
          tint="#fef3c7"
          title="Política de Calidad"
          teaser="Cómo aseguramos un servicio confiable y consistente que cumpla con los requisitos y expectativas de nuestros clientes."
          onClick={() => setOpenPolicy('calidad')}
        />

        <PolicyCard
          icon={<NoCrashOutlinedIcon />}
          accent="#0f766e"
          tint="#f0fdfa"
          title="Política de Seguridad"
          teaser="Las reglas que previenen accidentes y reducen riesgos en cada viaje, incluido el anexo de mantenimiento de unidades."
          onClick={() => setOpenPolicy('seguridad')}
        />

      </Box>

      <Dialog open={openPolicy === 'general'} onClose={closePolicy} maxWidth="md" fullWidth scroll="paper" PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogContent sx={{ p: { xs: 3, md: 4.5 } }}>
          <PolicyDialogHeader icon={<MenuBookOutlinedIcon />} accent="#4338ca" tint="#eef2ff" title="Política General" onClose={closePolicy} />
          <Divider sx={{ borderColor: '#f1f5f9', mb: 2.5 }} />

          <Typography sx={{ ...BODY_SX, fontSize: '0.925rem', mb: 2.5 }}>
            IMA EXPRESS LLC se compromete a proporcionar servicios de transporte de carga de manera
            segura, puntual, profesional, responsable y transparente, cumpliendo con las leyes,
            regulaciones y requisitos aplicables en México y Estados Unidos. La empresa establecerá
            y mantendrá los controles y procedimientos necesarios para asegurar que sus operaciones
            se desarrollen de manera consistente, ordenada y responsable.
          </Typography>

          <Typography sx={{ ...BODY_SX, fontSize: '0.925rem' }}>
            IMA EXPRESS LLC trabajará continuamente para proteger la integridad de la mercancía, los
            colaboradores, los equipos, los clientes y la información que se encuentre bajo su
            responsabilidad. Asimismo, promoverá una cultura de mejora continua en todas sus
            operaciones, fomentando la toma de decisiones responsable, la comunicación efectiva, el
            cumplimiento de los requisitos aplicables y el uso adecuado de los recursos de la
            empresa.
          </Typography>

          <Stack direction="row" justifyContent="flex-end" sx={{ mt: 3.5 }}>
            <Button onClick={closePolicy} variant="contained" sx={CLOSE_BTN_SX}>Cerrar</Button>
          </Stack>
        </DialogContent>
      </Dialog>

      <Dialog open={openPolicy === 'calidad'} onClose={closePolicy} maxWidth="md" fullWidth scroll="paper" PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogContent sx={{ p: { xs: 3, md: 4.5 } }}>
          <PolicyDialogHeader icon={<FactCheckOutlinedIcon />} accent="#b45309" tint="#fef3c7" title="Política de Calidad" onClose={closePolicy} />
          <Divider sx={{ borderColor: '#f1f5f9', mb: 2.5 }} />

          <Typography sx={{ ...BODY_SX, fontSize: '0.925rem', mb: 2.5 }}>
            IMA EXPRESS LLC está comprometida con proporcionar servicios de transporte que cumplan
            de manera consistente con los requisitos y expectativas de nuestros clientes. Para
            nosotros, la calidad significa ofrecer un servicio confiable, puntual, profesional y
            seguro, acompañado de una comunicación adecuada durante las diferentes etapas del
            proceso de transporte.
          </Typography>

          <Typography sx={{ ...BODY_SX, fontSize: '0.925rem' }}>
            La empresa evaluará y mejorará continuamente sus procesos con el objetivo de reducir
            incidentes, retrasos, fallas en el servicio y reclamaciones de los clientes. Se
            promoverá una cultura de responsabilidad y mejora continua en la que cada colaborador
            comprenda el impacto que tiene su trabajo en la calidad del servicio y en la
            satisfacción del cliente. Nuestro objetivo es establecer y mantener relaciones
            comerciales de largo plazo mediante el cumplimiento de nuestros compromisos y la
            prestación constante de un servicio de transporte confiable.
          </Typography>

          <Stack direction="row" justifyContent="flex-end" sx={{ mt: 3.5 }}>
            <Button onClick={closePolicy} variant="contained" sx={CLOSE_BTN_SX}>Cerrar</Button>
          </Stack>
        </DialogContent>
      </Dialog>

      <Dialog open={openPolicy === 'seguridad'} onClose={closePolicy} maxWidth="md" fullWidth scroll="paper" PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogContent sx={{ p: { xs: 3, md: 4.5 } }}>
          <PolicyDialogHeader icon={<NoCrashOutlinedIcon />} accent="#0f766e" tint="#f0fdfa" title="Política de Seguridad" onClose={closePolicy} />
          <Divider sx={{ borderColor: '#f1f5f9', mb: 2.5 }} />

          <Typography sx={{ ...BODY_SX, fontSize: '0.925rem', mb: 2.5 }}>
            La seguridad es una prioridad fundamental para IMA EXPRESS LLC y debe estar presente en
            todas nuestras operaciones. La empresa está comprometida con prevenir accidentes y
            reducir riesgos mediante la capacitación del personal, la correcta operación de las
            unidades, el cumplimiento de las regulaciones aplicables y la mejora continua de
            nuestros procesos.
          </Typography>

          <Typography sx={{ ...BODY_SX, fontSize: '0.925rem' }}>
            Todos los operadores deberán realizar las inspecciones correspondientes antes, durante y
            después de cada viaje, reportar inmediatamente cualquier falla o condición insegura,
            respetar los límites de velocidad, utilizar el cinturón de seguridad y cumplir con las
            Horas de Servicio aplicables. Queda prohibido conducir bajo los efectos del alcohol,
            drogas o cualquier sustancia que pueda afectar la capacidad del operador. Cuando se
            opere en Estados Unidos, deberán cumplirse las regulaciones federales aplicables,
            incluyendo HOS y ELD cuando corresponda.
          </Typography>

          <Box sx={{ mt: 3.5, p: 3, borderRadius: 2, bgcolor: '#fafbfc', border: '1px solid #e2e8f0' }}>
            <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 2 }}>
              <Box sx={{ ...ICON_BOX_SX, bgcolor: '#f0fdfa', color: '#0f766e' }}>
                <TireRepairOutlinedIcon />
              </Box>
              <Box>
                <Typography variant="overline" sx={SECTION_LABEL_SX}>Anexo</Typography>
                <Typography variant="subtitle1" fontWeight={700} color="#0f172a" sx={{ lineHeight: 1.2 }}>
                  Seguridad y Mantenimiento
                </Typography>
              </Box>
            </Stack>

            <Typography sx={{ ...BODY_SX, mb: 2 }}>
              El mantenimiento adecuado de nuestras unidades es parte esencial de la seguridad de IMA
              EXPRESS LLC. Mantener los vehículos en buenas condiciones mecánicas permite prevenir
              riesgos, reducir fallas durante los viajes y proteger al operador, la mercancía y a
              terceros. Por esta razón, las actividades de mantenimiento preventivo y correctivo
              deberán realizarse de manera oportuna y mantenerse debidamente documentadas.
            </Typography>

            <Typography sx={{ ...BODY_SX, mb: 2 }}>
              IMA EXPRESS LLC realizará inspecciones y servicios de mantenimiento de manera
              programada, dando especial atención a componentes críticos como llantas, frenos,
              suspensión, luces, sistemas eléctricos y motor. Cualquier unidad que presente una
              condición que pueda representar un riesgo deberá ser retirada de operación hasta ser
              inspeccionada y, cuando corresponda, reparada y autorizada para regresar al servicio.
            </Typography>

            <Typography sx={BODY_SX}>
              El objetivo de estas acciones es prevenir incidentes, reducir fallas en carretera,
              mejorar la disponibilidad de la flotilla y garantizar operaciones seguras y confiables.
            </Typography>
          </Box>

          <Stack direction="row" justifyContent="flex-end" sx={{ mt: 3.5 }}>
            <Button onClick={closePolicy} variant="contained" sx={CLOSE_BTN_SX}>Cerrar</Button>
          </Stack>
        </DialogContent>
      </Dialog>
    </Box>
  );
};
