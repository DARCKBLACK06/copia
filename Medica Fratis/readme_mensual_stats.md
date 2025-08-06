# 📘 README - Script mensualStats.gs (Generación de reportes mensuales)

Este documento describe el propósito, flujo de trabajo y estructura del script `mensualStats.gs`, encargado de generar reportes mensuales por inquilino en formato PDF a partir de los datos acumulados de sensores y almacenarlos de forma organizada en Google Drive. También actualiza el archivo accesible desde el dashboard.

---

## ✅ Objetivo del script

Generar reportes estadísticos mensuales automáticos por inquilino con base en los registros diarios de sensores. Cada reporte incluye gráficas, análisis de consumo y sugerencias automáticas. Se almacena un historial y se actualiza el archivo disponible en el dashboard para descarga.

---

## 🕒 Frecuencia de ejecución

- Una vez al mes (ej. el día 1 de cada mes)
- Se recomienda ejecutarlo vía trigger nocturno (`triggers.gs`), o manualmente si se requiere generar un reporte inmediato.

---

## 📋 Flujo de trabajo

### 1. Leer registros del Sheet `consumo_diario`

- Filtrar por mes anterior (ej. si hoy es 1 de agosto → filtrar todo julio)
- Agrupar los registros por ID de inquilino

### 2. Procesar datos por inquilino

- Calcular para cada sensor:
  - **Total mensual**
  - **Promedio diario**
  - **Valor máximo del mes**

### 3. Generar archivo PDF

- Encabezado con nombre de empresa, fecha, logo
- Datos del inquilino (nombre, departamento, fecha de análisis)
- Gráficas de barras por sensor
- Sugerencias automáticas:
  - Si `humedad > 65%` promedio → “Recomendación: ventilar mejor el área”
  - Si `agua > 3000L` → “Posible uso excesivo o fuga”
  - Si `gas` o `humo` supera umbral → “Advertencia: revisar ventilación”

### 4. Manejo de archivos en Drive

- Mover el **reporte PDF anterior** (si existe) a:
  - `/reportes/respaldo/2025-07/`
- Guardar el **nuevo reporte** en:
  - `/reportes/actual/` o una carpeta pública fija
- Reemplazar archivo visible desde dashboard con la nueva versión

---

## 🧾 Contenido esperado del PDF

| Sección             | Detalles                                                    |
| ------------------- | ----------------------------------------------------------- |
| Encabezado          | Logo de la empresa, nombre, fecha de generación             |
| Datos del inquilino | Nombre completo, ID, departamento, período evaluado         |
| Gráficas            | De barras por sensor: agua, gas, humedad, temperatura, humo |
| Análisis textual    | Totales, promedios, máximos                                 |
| Sugerencias         | Comentarios automáticos con base en umbrales detectados     |
| Pie de página       | Contacto, mensaje institucional, marca de tiempo            |

---

## 📁 Estructura en Google Drive

```
📁 /reportes/
 ├── 📁 actual/              ← Contiene último PDF disponible para dashboard
 └── 📁 respaldo/
      ├── 📁 2025-07/
      ├── 📁 2025-06/
      └── etc...
```

---

## 🔐 Permisos y accesos

- El script debe tener permiso para:
  - Leer/escribir Google Sheets
  - Crear y mover archivos en Drive
  - Generar PDFs

---

## 🔧 Trigger sugerido en `triggers.gs`

```js
ScriptApp.newTrigger("mensualStats")
  .timeBased()
  .onMonthDay(1)
  .atHour(2)
  .create();
```

---

## 📌 Notas

- El reporte generado debe ser compatible con impresión (formato A4 vertical)
- Puede usarse Google Apps Script + HTML para generar PDFs personalizados
- El dashboard debe apuntar a la carpeta `/reportes/actual` para descarga directa

