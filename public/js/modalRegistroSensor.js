// public/js/modalRegistroSensor.js

function mostrarModalRegistroSensor() {
    // Inicializa el modal (si usas un framework)
    // Por ejemplo, con Materialize:
    // var modal = document.getElementById('modalRegistroSensor');
    // M.Modal.init(modal);
    // M.Modal.getInstance(modal).open();

    // Muestra el modal (si no usas un framework)
    document.getElementById('modalDepartamento').style.display = 'block';

    document.getElementById('generarCodigoBtn').addEventListener('click', async () => {
        const departamentoId = document.getElementById('departamentoId').value;
        const wifiSSID = document.getElementById('wifiSSID').value;
        const wifiPassword = document.getElementById('wifiPassword').value;

        // Obtener los sensores seleccionados
        const sensoresSeleccionados = Array.from(document.querySelectorAll('input[name="sensores"]:checked'))
            .map(checkbox => checkbox.value);

        try {
            // Llama a la Cloud Function para generar el código
            const generarCodigoArduino = firebase.functions().httpsCallable('generarCodigoArduino');
            const result = await generarCodigoArduino({
                departamentoId: departamentoId,
                wifiSSID: wifiSSID,
                wifiPassword: wifiPassword,
                sensores: sensoresSeleccionados
            });

            // Muestra el código en un nuevo modal o en la misma ventana
            mostrarCodigoArduino(result.data.codigoArduino);

            // Cierra el modal de registro
            document.getElementById('modalDepartamento').style.display = 'none';

        } catch (error) {
            console.error('Error al generar código:', error);
            alert('Error al generar código: ' + error.message);
        }
    });
}

function mostrarCodigoArduino(codigoArduino) {
    // Muestra el código en un nuevo modal o en la misma ventana
    // Puedes usar un <textarea> para que el usuario pueda copiar el código
    alert('Código Arduino:\n\n' + codigoArduino);
}

export { mostrarModalRegistroSensor };
