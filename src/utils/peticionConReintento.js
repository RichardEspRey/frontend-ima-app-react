const INTENTOS = 3;
const ESPERA_BASE_MS = 400;

const esperar = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const postConReintento = async (url, formData, { intentos = INTENTOS, esperaBaseMs = ESPERA_BASE_MS } = {}) => {
    let ultimoError;

    for (let intento = 0; intento < intentos; intento++) {
        if (intento > 0) await esperar(esperaBaseMs * 2 ** (intento - 1));

        try {
            const respuesta = await fetch(url, { method: 'POST', body: formData });
            if (!respuesta.ok) throw new Error(`El servidor respondió ${respuesta.status}`);
            return await respuesta.json();
        } catch (error) {
            ultimoError = error;
        }
    }

    throw ultimoError;
};
