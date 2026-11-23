if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js').catch((error) => {
            actualizarMensajeEstado(`No se pudo activar el modo offline: ${error.message}`);
        });
    });
}

let eventoInstalacionDiferido = null;

window.addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault();
    eventoInstalacionDiferido = event;
    const btnInstalar = document.getElementById('btn-instalar');
    btnInstalar.hidden = false;
});

function actualizarMensajeEstado(mensaje) {
    document.getElementById('estado').textContent = mensaje;
}

let streamActual = null;
let modoCamaraActual = 'environment'; // 'environment' = trasera | 'user' = frontal

function detenerCamaraActiva() {
    if (streamActual) {
        streamActual.getTracks().forEach((track) => {
            track.stop();
        });
        streamActual = null;
    }
}

function iniciarCamara(modo) {
    detenerCamaraActiva();

    const restricciones = {
        video: { facingMode: modo },
        audio: false
    };

    return navigator.mediaDevices.getUserMedia(restricciones)
        .then((stream) => {
            streamActual = stream;
            const visorVideo = document.getElementById('visor-camara');
            visorVideo.srcObject = stream;
            document.getElementById('btn-alternar-camara').hidden = false;
            document.getElementById('btn-apagar-camara').hidden = false;
            actualizarMensajeEstado(`Cámara activa (${modo === 'environment' ? 'Trasera' : 'Frontal'})`);
        })
        .catch((error) => {
            if (error.name === 'NotAllowedError') {
                actualizarMensajeEstado('Permiso denegado. Habilita el acceso a la cámara en los ajustes de tu navegador.');
            } else if (error.name === 'NotFoundError') {
                actualizarMensajeEstado('No se detectó el sensor de cámara solicitado en este dispositivo.');
            } else {
                actualizarMensajeEstado(`Error al acceder al hardware: ${error.message}`);
            }
        });
}


if (/iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream) {
    document.getElementById('instrucciones-ios').hidden = false;
}

document.getElementById('btn-preparar-camara').addEventListener('click', () => {
    document.getElementById('aviso-permiso').hidden = false;
});

document.getElementById('btn-instalar').addEventListener('click', async () => {
    if (!eventoInstalacionDiferido) return;
    await eventoInstalacionDiferido.prompt();
    eventoInstalacionDiferido = null;
    document.getElementById('btn-instalar').hidden = true;
});

document.getElementById('btn-alternar-camara').addEventListener('click', () => {
    modoCamaraActual = (modoCamaraActual === 'environment') ? 'user' : 'environment';
    iniciarCamara(modoCamaraActual);
});

document.getElementById('btn-apagar-camara').addEventListener('click', () => {
    detenerCamaraActiva();
    actualizarMensajeEstado('Cámara apagada');
});

document.getElementById('btn-confirmar-permiso').addEventListener('click', () => {
    document.getElementById('aviso-permiso').hidden = true;
    iniciarCamara(modoCamaraActual);
});