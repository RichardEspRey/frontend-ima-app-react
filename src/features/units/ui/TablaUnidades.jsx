import { useState } from "react"
import {
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Tooltip,
  Typography,
} from "@mui/material"
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline"
import EditOutlinedIcon from "@mui/icons-material/EditOutlined"
import MoreVertIcon from "@mui/icons-material/MoreVert"

import { ESTADO_CONDUCTOR, estadoConductor } from "../../../entities/unit"
import { EstadoDocumento } from "./EstadoDocumento"

const LARGO_MAXIMO_ENCABEZADO = 12

/**
 * El menú de acciones de un conductor.
 *
 * Un conductor no se borra: se da de baja, y por eso su acción vive en un menú
 * en lugar de en un botón de basura como en camiones y cajas.
 *
 * @param {object} props Propiedades del componente.
 * @param {object} props.unidad El conductor de la fila.
 * @param {Function} props.onEditar Abre su expediente.
 * @param {Function} props.onDarDeBaja Abre el formulario de baja.
 * @returns {object} El menú renderizado.
 */
function AccionesConductor({ unidad, onEditar, onDarDeBaja }) {
  const [ancla, setAncla] = useState(null)
  const cerrar = () => setAncla(null)

  return (
    <>
      <IconButton size="small" onClick={(evento) => setAncla(evento.currentTarget)}>
        <MoreVertIcon />
      </IconButton>
      <Menu anchorEl={ancla} open={Boolean(ancla)} onClose={cerrar}>
        <MenuItem
          onClick={() => {
            cerrar()
            onEditar(unidad)
          }}
        >
          <EditOutlinedIcon sx={{ mr: 1, fontSize: "small" }} /> Editar
        </MenuItem>
        {estadoConductor(unidad) === ESTADO_CONDUCTOR.ACTIVO && (
          <MenuItem
            onClick={() => {
              cerrar()
              onDarDeBaja(unidad)
            }}
            sx={{ color: "error.main" }}
          >
            <DeleteOutlineIcon sx={{ mr: 1, fontSize: "small" }} /> Dar de Baja
          </MenuItem>
        )}
      </Menu>
    </>
  )
}

/**
 * El contenido de una celda fija, según lo que declare la columna.
 *
 * @param {object} props Propiedades del componente.
 * @param {object} props.columna La columna del descriptor.
 * @param {object} props.unidad La unidad de la fila.
 * @returns {object} La celda renderizada.
 */
function CeldaFija({ columna, unidad }) {
  if (columna.tipo === "estado") {
    const estado = estadoConductor(unidad)
    return (
      <Chip
        label={estado}
        color={estado === ESTADO_CONDUCTOR.ACTIVO ? "success" : "error"}
        size="small"
        variant="outlined"
        sx={{ fontWeight: 600 }}
      />
    )
  }

  const valor = unidad?.[columna.clave]
  if (columna.principal) {
    return (
      <Typography variant="body2" fontWeight={800} color="#0f172a">
        {valor}
      </Typography>
    )
  }

  return <>{valor || "-"}</>
}

/**
 * La tabla del expediente de un tipo de unidad.
 *
 * Las columnas fijas las declara el descriptor del tipo; las demás salen de los
 * requisitos configurados, que cambian sin tocar código.
 *
 * @param {object} props Propiedades del componente.
 * @param {object} props.descriptor El descriptor del tipo de unidad.
 * @param {Array} props.unidades Las unidades a listar, ya filtradas.
 * @param {Array} props.requisitos Los requisitos visibles, una columna cada uno.
 * @param {Function} props.onEditar Abre el expediente de una unidad.
 * @param {Function} [props.onEliminar] Borra una unidad; camiones y cajas.
 * @param {Function} [props.onDarDeBaja] Da de baja; solo conductores.
 * @returns {object} La tabla renderizada.
 */
export function TablaUnidades({
  descriptor,
  unidades = [],
  requisitos = [],
  onEditar,
  onEliminar,
  onDarDeBaja,
}) {
  const [pagina, setPagina] = useState(0)
  const [porPagina, setPorPagina] = useState(10)

  // Buscar o borrar puede dejar menos páginas de las que había. Sin acotar, la
  // tabla se queda en una página que ya no existe y se ve vacía aunque haya
  // resultados: pasaba al escribir en el buscador desde la página 2.
  const ultimaPagina = Math.max(0, Math.ceil(unidades.length / porPagina) - 1)
  const paginaActual = Math.min(pagina, ultimaPagina)

  const visibles = unidades.slice(paginaActual * porPagina, paginaActual * porPagina + porPagina)
  const columnas = descriptor.columnas.length + requisitos.length + 1

  return (
    <Paper elevation={0} sx={{ border: "1px solid #e2e8f0", borderRadius: 3, overflow: "hidden" }}>
      <TableContainer sx={{ overflowX: "auto" }}>
        <Table size="small">
          <TableHead sx={{ bgcolor: "#f1f5f9" }}>
            <TableRow>
              {descriptor.columnas.map((columna) => (
                <TableCell
                  key={columna.clave}
                  sx={{ fontWeight: 700, color: "#475569", minWidth: columna.ancho }}
                >
                  {columna.etiqueta}
                </TableCell>
              ))}
              {requisitos.map((requisito) => (
                <TableCell
                  key={requisito.key_name}
                  align="center"
                  sx={{ fontWeight: 700, color: "#475569", whiteSpace: "nowrap" }}
                >
                  <Tooltip title={requisito.label}>
                    <span>
                      {requisito.label.length > LARGO_MAXIMO_ENCABEZADO
                        ? `${requisito.label.substring(0, LARGO_MAXIMO_ENCABEZADO)}...`
                        : requisito.label}
                    </span>
                  </Tooltip>
                </TableCell>
              ))}
              <TableCell align="center" sx={{ fontWeight: 700, color: "#475569", minWidth: 90 }}>
                Acciones
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {visibles.map((unidad) => (
              <TableRow key={unidad[descriptor.campoId]} hover>
                {descriptor.columnas.map((columna) => (
                  <TableCell key={columna.clave}>
                    <CeldaFija columna={columna} unidad={unidad} />
                  </TableCell>
                ))}

                {requisitos.map((requisito) => (
                  <TableCell key={requisito.key_name} align="center" sx={{ maxWidth: 100 }}>
                    <EstadoDocumento
                      requisito={requisito}
                      documento={unidad.docs?.[requisito.key_name]}
                    />
                  </TableCell>
                ))}

                <TableCell align="center" sx={{ whiteSpace: "nowrap" }}>
                  {descriptor.conBaja ? (
                    <AccionesConductor
                      unidad={unidad}
                      onEditar={onEditar}
                      onDarDeBaja={onDarDeBaja}
                    />
                  ) : (
                    <>
                      <IconButton size="small" color="primary" onClick={() => onEditar(unidad)}>
                        <EditOutlinedIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => onEliminar(unidad[descriptor.campoId])}
                      >
                        <DeleteOutlineIcon />
                      </IconButton>
                    </>
                  )}
                </TableCell>
              </TableRow>
            ))}

            {unidades.length === 0 && (
              <TableRow>
                <TableCell colSpan={columnas} align="center" sx={{ py: 4 }}>
                  <Typography color="text.secondary">{descriptor.etiquetas.vacio}</Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        component="div"
        count={unidades.length}
        page={paginaActual}
        onPageChange={(evento, nueva) => setPagina(nueva)}
        rowsPerPage={porPagina}
        onRowsPerPageChange={(evento) => {
          setPorPagina(Number.parseInt(evento.target.value, 10))
          setPagina(0)
        }}
        rowsPerPageOptions={[10, 25, 50]}
        labelRowsPerPage={descriptor.etiquetas.porPagina}
        labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
      />
    </Paper>
  )
}
