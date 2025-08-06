# 📘 README - Lógica completa del script main\_continuo.gs

Este documento describe paso a paso la lógica general del script `main_continuo.gs`, ejecutado cada 30 minutos. Aquí se presenta su funcionamiento actualizado, eliminando funciones que fueron trasladadas a `main.gs`.

---

## ✅ 1. FUNCIONAMIENTO ESPERADO (fase inicial)

### Inicio (trigger cada 30 min)

* `limpiarCache()` → limpia temporales (Gmail)
* `obtenerDatosBasicosInquilinos()` → carga los 41 inquilinos

### Filtrar inquilinos, conservar solo si cumple alguna de estas:

* Fecha de pago ≤ 7 días
* Modo manual personalizado (con expiración activa)

### Para los no seleccionados, log:

```
⏩ Inquilino inquilinodptoXX omitido: fuera de ventana y en modo automático.
```

### Ventaja del nuevo filtrado

Evita procesar innecesariamente usuarios que no requieren acción, haciendo el script más rápido y eficiente.

### 🧪 Ejemplo con 41 inquilinos

* 30 inquilinos tienen fecha de pago > 7 días y están en modo automático → se omiten
* 5 inquilinos tienen fecha de pago en los próximos 7 días → se procesan
* 3 inquilinos están en modo manual personalizado (con expiración futura) → se procesan
* 2 están en modo manual indefinido → se omiten
* 1 tiene datos corruptos → se ignora con advertencia

### 🔢 Resultado:

* Solo 8-9 inquilinos procesados en cada ejecución.
* Script más rápido.
* Menos consultas a Firestore y RTDB.
* Menor riesgo de timeout o errores.

---

## ✅ 2. Evaluar modo de control (por cada inquilino filtrado)

### 🔹 Caso A: `modoControl == 'manual_personalizado'`

* Si `manualExpira` ya expiró:

  * Cambiar `modoControl` a `'automatico'`
  * Eliminar `manualExpira`
  * Evaluar estado de pago:

    * Si está pagado → cerradura = encendido
    * Si está vencido → cerradura = apagado, estadoPago = 'no pagado'

#### Ejemplo:

```
inquilinodpto02
Fecha de pago: 2025-07-28
manualExpira: 2025-07-30 12:00
Hora actual: 12:30
→ Se cambia a automático y se apaga la cerradura si no pagó.
```

### 🔹 Caso B: `modoControl == 'manual_indefinido'`

* No se hace nada. Requiere intervención manual.

#### Ejemplo:

```
inquilinodpto07
Estado: no pagado
modoControl: manual_indefinido
→ No se evalúa.
```

### 🔹 Caso C: `modoControl == 'automatico'`

* Continuar a evaluación por fecha de pago y comprobantes.

#### Ejemplo:

```
inquilinodpto03
Fecha de pago: 2025-08-05
Hoy: 2025-07-30
→ Faltan 6 días → pasa a lógica de pago.
```

---

## ✅ 3. Evaluar estado de pago (solo si está en modo automático)

### 🔹 Caso A: Hay comprobante de pago en Gmail

* Validar remitente y asunto
* Si es válido:

  * `estadoPago = 'pagado'`
  * `cerradura = 'encendido'`
  * `fechaPago += 1 mes`
  * Saltar lógica de pendiente/no pagado

#### Ejemplo:

```
inquilinodpto05
Fecha de pago: 2025-08-01
Correo recibido el 2025-07-29
→ Se marca como pagado y se extiende a 2025-09-01
```

### 🔹 Caso B: No hay comprobante y faltan ≤ 7 días

* `estadoPago = 'pendiente'`
* `cerradura = 'encendido'`

#### Ejemplo:

```
inquilinodpto06
Fecha de pago: 2025-08-02
Hoy: 2025-07-30
→ Se marca como pendiente, pero puede entrar
```

### 🔹 Caso C: No hay comprobante y fecha ya vencida

* `estadoPago = 'no pagado'`
* `cerradura = 'apagado'`

#### Ejemplo:

```
inquilinodpto08
Fecha de pago: 2025-07-28
Hoy: 2025-07-30
→ Cerradura apagada automáticamente
```

---

## ✅ 4. Aplicar actualizaciones (solo si hubo cambios)

### Campos a actualizar:

* `estadoPago` → Firestore
* `cerradura` → Firestore y RTDB
* `fechaPago` → solo si hubo comprobante válido

### 📈 Ejemplo:

```
inquilinodpto09
Estado anterior: 'pendiente'
Hoy: fecha vencida sin comprobante
→ Cambia a 'no pagado', cerradura apagada
```

---

## ✅ 5. Capturar lecturas de sensores (cada 30 min)

* Leer valores de `telemetria_actual` en RTDB
* Comparar con `consumoActual` en Firestore
* Si son mayores → actualizar

#### Ejemplo:

```
inquilinodpto01
RTDB: agua = 135 L, Firestore: agua = 120 L
→ Firestore se actualiza a 135 L
```

---

## 🚫 Funciones eliminadas de main\_continuo y migradas a main.gs

* Guardar respaldo de comprobantes en Sheets
* Enviar correos de advertencia o urgencia
* Respaldar y limpiar datos de sensores en Sheets
* Borrar correos antiguos (mayores a 30 días)
* Generar estadísticas mensuales

