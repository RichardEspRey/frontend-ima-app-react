// src/services/printService.js

/**
 * Convierte un valor numérico a formato de moneda USD ($).
 * Se exporta para uso en el componente principal.
 */
export const money = (v) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    currencyDisplay: "symbol",
  }).format(Number(v || 0));

/**
 * Genera el HTML estructurado para el reporte de resumen de viaje.
 * @param {object} data Objeto completo del viaje.
 * @param {object} totals Totales calculados.
 * @returns {string} HTML completo para la impresión.
 */
export const generatePrintHtml = (data, totals) => {
  // --- Etapas HTML ---
  const stagesHtml = data.stages
    .map(
      (s) => `
        <div style="border: 1px solid #ddd; padding: 10px; margin-bottom: 10px; border-radius: 5px; font-size: 14px;">
            <h4 style="margin: 0 0 5px 0; color: #3C48E1;">${s.title}</h4>
            ${
              s.stageType !== "emptyMileage"
                ? `
                <div style="background: #f0f0f0; padding: 8px; font-size: 12px;">
                    <strong>Compañía:</strong> ${s.company}<br/>
                    <strong>Rate:</strong> ${money(s.rate_tarifa)}
                </div>
            `
                : `
                <div style="background: #e3f2fd; border: 1px solid #90caf9; padding: 8px; font-size: 12px; color: #1565c0;">
                    <strong>Millaje Vacío:</strong> ${s.millas_pc_miler} mi (PC*Miler)
                </div>
            `
            }
        </div>
    `
    )
    .join("");

  // --- Resumen Financiero HTML ---
  const summaryRows = [
    {
      label: "Total Invoice (Rates Sumados)",
      value: totals.invoice,
      color: "#666",
    },
    { label: "Diesel (Cargas)", value: totals.diesel, color: "#2e7d32" },
    {
      label: "Expenses (Gastos Misceláneos)",
      value: totals.expenses,
      color: "#2e7d32",
    },
    {
      label: "Driver Pay (Dato Manual)",
      value: data.driverPayManual,
      color: "#bf360c",
    },
    { label: "TOTAL GANANCIA / PÉRDIDA", value: totals.total, isTotal: true },
  ];

  const summaryHtml = summaryRows
    .map(
      (row) => `
        <tr style="${
          row.isTotal ? "font-weight: bold; background: #f0f0f0;" : ""
        }">
            <td style="border: 1px solid #ccc; padding: 8px; width: 60%; color: ${
              row.color || "#333"
            };">
                ${row.label}
            </td>
            <td style="border: 1px solid #ccc; padding: 8px; text-align: right; width: 20%; color: ${
              row.color || "#333"
            };">
                ${money(row.value)}
            </td>
        </tr>
    `
    )
    .join("");

  // --- Estructura Final del Documento ---
  return `
        <style>
            /* Estilos básicos para la impresión (Se inyectan en el PDF) */
            body { font-family: Arial, sans-serif; margin: 0; padding: 0; }
            h1 { color: #3C48E1; border-bottom: 2px solid #3C48E1; padding-bottom: 5px; font-size: 1.8em;}
            h2 { color: #666; font-size: 1.4em; border-bottom: 1px solid #eee; padding-bottom: 5px; margin-top: 20px;}
            table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 14px;}
            td { border: 1px solid #ccc; padding: 8px; }
        </style>
        <div style="padding: 20px; max-width: 800px; margin: 0 auto;">
            <h1>Resumen de Viaje #${data.trip_number}</h1>
            <p><strong>Conductor:</strong> ${data.driver}</p>
            <p><strong>Fecha de Creación:</strong> ${data.created}</p>
            
            <h2>Etapas del Viaje</h2>
            ${stagesHtml}

            <h2>Resumen Financiero</h2>
            <table><tbody>${summaryHtml}</tbody></table>
        </div>
    `;
};

/**
 * FUNCIÓN CLAVE: Llama a la API global de htmldocs.
 */
export const printTripSummary = (data, totals) => {
  // Verificación de la inyección global
  if (typeof htmldocs === "undefined" || !htmldocs.print) {
    alert(
      "Error: La librería de impresión (htmldocs) no se cargó correctamente en el <head>."
    );
    console.error(
      "La variable global htmldocs no existe. Verifique el tag <script> en index.html."
    );
    return;
  }

  const htmlContent = generatePrintHtml(data, totals);

  // USANDO LA VARIABLE GLOBAL:
  htmldocs
    .print({
      html: htmlContent,
      title: `Resumen de Viaje ${data.trip_number}`,
      output: "open", // Abrir en una nueva ventana para vista previa
    })
    .catch((error) => {
      console.error("Error al generar el documento con HTMLDOCS:", error);
      alert("Error al generar el reporte.");
    });
};
