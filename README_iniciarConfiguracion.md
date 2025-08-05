# 🏗️ Paso 1: `iniciarConfiguracion.gs` – Configuración Inicial del Proyecto

## 📘 Descripción
Este script es **el primero que debe ejecutarse** al instalar o migrar el sistema. Se encarga de crear la estructura de carpetas y hojas necesarias en Google Drive, y guarda sus IDs en `PropertiesService` para que el resto del sistema trabaje de forma dinámica, sin modificar `config.gs` manualmente.

---

## ⚙️ ¿Qué hace exactamente?

1. 🔎 Verifica si ya existe la estructura base en Drive (carpeta del proyecto, año actual, subcarpetas por módulo).
2. 📁 Si no existe, la crea así:

```
📁 ProyectoMedicaFratis
└── 📁 2025
    ├── 📁 ComprobantesPago
    ├── 📁 Sensores
    └── 📁 ReportesPorUsuario
        ├── 📁 inquilinodpto01
        ├── 📁 inquilinodpto02
        └── ...
```

3. 🧾 Crea hojas de cálculo necesarias (por ejemplo: historial de pagos y consumo diario).
4. 🧠 Guarda todos los IDs en `PropertiesService`.

---

## 📂 Estructura esperada en Drive

```
📁 ProyectoMedicaFratis
└── 📁 2025
    ├── 📁 ComprobantesPago
    ├── 📁 Sensores
    └── 📁 ReportesPorUsuario
        └── 📁 inquilinodptoXX → PDF mensual generado
```

---

## 📌 Variables guardadas (`PropertiesService`)

| Clave                             | Descripción                            |
|----------------------------------|----------------------------------------|
| `FOLDER_PROYECTO`                | Carpeta raíz "ProyectoMedicaFratis"    |
| `FOLDER_ANIO_ID`                 | Carpeta del año actual (ej: 2025)       |
| `FOLDER_COMPROBANTES`            | Carpeta de comprobantes de pago        |
| `FOLDER_SENSORES`                | Carpeta donde se guardan lecturas      |
| `FOLDER_REPORTES_USUARIOS`       | Carpeta base de todos los reportes     |
| `FOLDER_REPORTE_USUARIO_<id>`    | Subcarpeta específica por inquilino    |
| `SHEET_ID_CONSUMO`               | Hoja "consumo_diario" con lecturas     |
| `SHEET_ID_HISTORIAL_PAGOS`       | Hoja de historial de pagos             |

---

## 🔁 Diagrama de flujo (ASCII)

```
[Inicio ejecución]
       |
       v
¿Existe carpeta ProyectoMedicaFratis?
       |
   [Sí] -----> [No]
    |           |
    v           v
 ¿Existe año actual?     -->   Crear carpeta raíz + año actual
    |                         + subcarpetas (pagos, sensores, reportes)
 [Sí]                         + crear hojas de cálculo
    |                         + crear subcarpetas por usuario
    v
 Leer IDs de carpetas existentes
    |
    v
 Guardar/actualizar en PropertiesService
    |
    v
[F I N]
```

---

## 🔗 Entidad - Recurso

| Entidad         | Recurso (Drive)             |
|------------------|-----------------------------|
| Inquilino        | Carpeta `/ReportesPorUsuario/inquilinodptoXX/` |
| Reporte mensual  | PDF `reporte_YYYY-MM-inquilinodptoXX.pdf` |
| Sensor diario    | Hoja "consumo_diario" |
| Comprobante pago | Imagen o archivo en `/ComprobantesPago/` |

---

## ✅ Resultado en consola

```
✅ Estructura creada y propiedades guardadas.
📁 Carpeta ProyectoMedicaFratis
📄 Hoja consumo_diario
📄 Hoja historial_pagos
📁 ReportesPorUsuario/inquilinodpto01
📁 ReportesPorUsuario/inquilinodpto02
...
```