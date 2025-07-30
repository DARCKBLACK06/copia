# 📘 README - Estructura y conexión entre scripts GAS

Este documento describe la entidad-relación entre los scripts del sistema, explicando su propósito, interacción y distribución funcional.

---

## ✅ Paso 1 – Lista de scripts base

```plaintext
📁 Scripts en el proyecto:

1. config.gs
2. firestore.gs
3. gmail.gs
4. main_continuo.gs
5. main.gs
6. triggers.gs
7. utils.gs
```

---

## ✅ Paso 2 – Rol de cada script (resumen general)

| Script             | Rol principal                                                                |
| ------------------ | ---------------------------------------------------------------------------- |
| `config.gs`        | Contiene configuraciones globales (colecciones, nombres, IDs, constantes).   |
| `firestore.gs`     | Lógica de lectura/escritura en Firestore y RTDB.                             |
| `gmail.gs`         | Manejo de Gmail: buscar comprobantes, limpiar correos.                       |
| `main_continuo.gs` | Verifica pagos, actualiza estados y registra sensores cada 30 min.           |
| `main.gs`          | Envío de correos, respaldo de datos y limpieza diaria (ejecución nocturna).  |
| `triggers.gs`      | Define y administra los disparadores automáticos para main y main_continuo.  |
| `utils.gs`         | Funciones auxiliares: fecha actual, días restantes, logs formateados, etc.   |

---

## ✅ Paso 3 – Conexiones entre scripts

### 🔄 Conexiones desde `main_continuo.gs`

Este script se ejecuta cada 30 minutos.

- Llama a `utils.gs` → `getFechaActual()`, `calcularDiasRestantes()`, logs
- Llama a `firestore.gs` →
  - `obtenerDatosBasicosInquilinos()`
  - `actualizarEstadoPago()`
  - `actualizarCerradura()`
  - `actualizarFechaPago()`
  - `actualizarConsumoSensor()`
- Llama a `gmail.gs` → `obtenerCorreosDePago(nombre, correo, fecha)`

❌ Ya no llama a:
- respaldo en Sheets
- limpieza de correos antiguos

---

### 🔄 Conexiones desde `main.gs`

Este script se ejecuta una vez al día por la noche.

- Llama a `utils.gs` → fechas, logs, calcular días restantes
- Llama a `firestore.gs` →
  - `obtenerDatosBasicosInquilinos()`
  - `leerConsumoActual()`
  - `eliminarConsumoActual()`
- Llama a `gmail.gs` →
  - `enviarCorreoAdvertencia()`
  - `borrarCorreosAntiguos()`
- Llama a `config.gs` → rutas como `sheetID`, nombres de colecciones, etc.

---

### 🔄 Conexiones desde `triggers.gs`

- Programa ejecución diaria de `main()` → `.everyDays(1)`
- Programa ejecución continua de `main_continuo()` → `.everyMinutes(30)`

---

## 🧩 Diagrama de relación entre scripts

```
                   +-----------------+
                   |   triggers.gs   |
                   +-----------------+
                           |
             Schedulers    |               (cada 30 min)
                           |------------------------------+
                           |                              |
                     +-------------+               +-------------------+
                     |  main.gs     |               | main_continuo.gs  |
                     +-------------+               +-------------------+
                           |                              |
        +------------------+------------+        +--------+---------+
        |                               |        |                  |
        v                               v        v                  v
 +--------------+              +--------------+    +--------------+    +--------------+
 |  firestore.gs| <----------- |  gmail.gs    |    |  gmail.gs    |    |  utils.gs    |
 +--------------+              +--------------+    +--------------+    +--------------+
        |                              ▲                  ▲                   ▲
        |  Lectura/Actualización       |  Buscar correos  |  Buscar correos   |  Fechas, días
        |  Firestore y RTDB            |  Enviar avisos   |  validar pago     |  formateo logs
        |                              |  Borrar antiguos |                   |
        v                              |                  |                   |
+---------------+                     +-------------------+-------------------+
|  config.gs    | ← parámetros globales (sheetId, colNames, rutas, etc.)      |
+---------------+
```

---

## 📋 RESUMEN DE RELACIONES CLAVE

| Script          | Llama a...                    | Para...                                                 |
|----------------|-------------------------------|----------------------------------------------------------|
| `main.gs`       | `firestore`, `gmail`, `utils` | Filtrar, enviar correos, respaldar sensores, limpiar     |
| `main_continuo` | `firestore`, `gmail`, `utils` | Validar pagos, actualizar cerradura, registrar sensores  |
| `triggers`      | `main`, `main_continuo`       | Programar triggers horarios                              |
| `firestore.gs`  | — (solo llamado)              | Leer/escribir Firestore y RTDB                           |
| `gmail.gs`      | — (solo llamado)              | Buscar correos, enviar correos, borrar correos antiguos  |
| `utils.gs`      | — (solo llamado)              | Fechas, días restantes, formateo                         |
| `config.gs`     | — (solo leído)                | Constantes y rutas comunes                               |

