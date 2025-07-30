# 📘 README - Lógica completa del script main.gs (ejecución nocturna)

Este documento describe el comportamiento y flujo del script `main.gs`, ejecutado una vez al día durante la noche. Está diseñado para complementar a `main_continuo.gs`, asumiendo funciones más pesadas como el respaldo en Sheets, envío de correos y limpieza de datos.

---

## ✅ 1. Inicio y filtrado en main.gs

### 🧹 Paso 1.1:

`limpiarCache()` → borra temporales de Gmail para evitar datos obsoletos.

### 🔎 Paso 1.2:

`obtenerDatosBasicosInquilinos()` → carga todos los registros.

### 🔍 Paso 1.3:

Filtrar solo a los inquilinos cuya **fecha de pago sea ≤ 7 días** desde hoy. Omitir los que aún tienen más tiempo.

### 🟡 Paso 1.4:

A todos los seleccionados, sin importar su estado actual, se les actualiza:

```js
estadoPago = 'pendiente'
```

Esto fuerza que entren en “alerta” para monitoreo, correo y decisiones posteriores.

#### 🔸 Ejemplo:

```
inquilinodpto04 → fecha de pago: 2025-08-03 (faltan 4 días)
→ estadoPago = 'pendiente'

inquilinodpto09 → fecha de pago: 2025-08-11 (faltan 12 días)
→ OMITIDO
```

---

## ✅ 2. Envío de correos de advertencia (actualizado)

### 📬 ¿A quién se le envía?

De los inquilinos filtrados (fecha de pago ≤ 7 días):

- Si `estadoPago == 'pendiente'` → enviar **recordatorio**
- Si la **fecha de pago ya pasó** → enviar **aviso urgente**

### ✉️ ¿Qué incluye el correo?

- Nombre del inquilino
- Fecha de pago
- Días restantes o días de atraso
- Mensaje diferente según el caso:

### 🟡 Pendiente (aún no vencido)

```
inquilinodpto02
Fecha de pago: 2025-08-03
Hoy: 2025-07-30
Faltan: 4 días

→ Asunto: Recordatorio de pago
→ “Tu fecha de corte es el 3 de agosto. Aún tienes 4 días para realizar tu pago...”
```

### 🔴 Vencido (hoy > fecha de pago)

```
inquilinodpto06
Fecha de pago: 2025-07-28
Hoy: 2025-07-30

→ Asunto: URGENTE – Tu pago está vencido
→ “Tu pago debió realizarse el 28 de julio. Han pasado 2 días. Tu acceso puede ser restringido...”
```

---

## ✅ 3. Respaldar consumo diario (sensores)

### 📦 ¿Qué se hace?

Por cada inquilino procesado (sin importar su estado de pago):

1. Leer los valores actuales desde Firestore: → `inquilinos/id/consumoActual`

2. Registrar en Google Sheets (hoja: `consumo_diario`):

   - ID del inquilino
   - Nombre
   - Fecha (hoy)
   - Temperatura, humedad, gas, agua, humo

### 🗂️ ¿Por qué?

Para tener un historial diario que servirá después para gráficas y estadísticas mensuales.

#### 🔸 Ejemplo:

```
inquilinodpto04
consumoActual:
  - temperatura: 30.1°C
  - humedad: 45%
  - agua: 125 L
  - gas: 9 ppm
  - humo: 0

→ Nueva fila en el Sheet:
2025-07-30 | inquilinodpto04 | Francisco | 30.1 | 45 | 125 | 9 | 0
```

---

## ✅ 4. Limpieza de sensores (después de respaldar en Sheets)

### 🧹 ¿Qué hace `main.gs` en este paso?

- Extrae `consumoActual` desde Firestore por cada inquilino.
- Registra esos datos en la hoja de cálculo `consumo_diario` (paso 3).
- Elimina esos datos de Firestore, dejando el campo listo para las siguientes lecturas de `main_continuo`.
- **Opcional:** limpia también `telemetria_actual` en RTDB (si se quiere reiniciar).

### 📦 ¿Qué hace `main_continuo`?

- Cada 30 minutos, lee RTDB (`telemetria_actual`)
- Compara con Firestore `consumoActual`
- Si el valor es mayor, actualiza el acumulado en `consumoActual` (Firestore)
- **No toca Sheets**, ni borra datos

#### 🔸 Ejemplo:

```
RTDB (dpto04): agua = 120 L
Firestore (consumoActual): agua = 115 L
→ main_continuo actualiza a 120 L

Luego, en la noche:
main extrae consumoActual → lo guarda en Sheet
→ limpia consumoActual para empezar fresco mañana
```

---

## ✅ 5. Borrar correos antiguos (solo en main.gs)

### 🧺 ¿Qué hace este paso?

- Busca correos con asunto válido de pago
- Verifica si ya están respaldados en el Sheet
- Si tienen más de 30 días desde su recepción:
  - Moverlos a papelera (`moveToTrash()`)

### ❌ Eliminado de:

- `main_continuo.gs` → Ya no revisa correos antiguos ni los borra. Solo se encarga de detectar los nuevos.

#### 🔸 Ejemplo:

```
Correo:
Asunto: Comprobante de pago - Departamento dpto05
Fecha de recepción: 2025-06-29

Hoy: 2025-07-30 → han pasado 31 días
→ main.gs lo borra porque ya está respaldado
```

---

## ✅ 6. Programación del trigger (script aparte)

### ⚙️ ¿Qué hace este script?

Define el **disparador (**``**) que ejecuta **``** una vez al día**.

### 🕛 Frecuencia sugerida:

Después de la medianoche, por ejemplo, 12:15 a.m.

### 🔧 Código de programación:

```js
ScriptApp.newTrigger("main")
  .timeBased()
  .atHour(0)
  .everyDays(1)
  .create();
```

### 📍 Ubicación:

Este trigger debe configurarse desde un archivo separado (ej. `triggers.gs`).

