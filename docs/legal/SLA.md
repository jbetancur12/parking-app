# Acuerdo de Nivel de Servicio (SLA) - Aparca SaaS

**Versión:** 1.0  
**Fecha de Vigencia:** Enero 4, 2026  
**Última Actualización:** Enero 4, 2026

---

## 1. Introducción

Este Acuerdo de Nivel de Servicio ("SLA") define los niveles de servicio que Aparca SaaS ("Proveedor") se compromete a proporcionar a sus clientes ("Cliente") para el servicio de software como servicio (SaaS) Aparca.

**Este SLA es parte integral de los Términos y Condiciones de Uso.**

---

## 2. Definiciones

- **"Servicio"**: La plataforma Aparca SaaS accesible vía web.
- **"Disponibilidad"**: Porcentaje de tiempo que el Servicio está operativo y accesible.
- **"Tiempo de Actividad" (Uptime)**: Tiempo durante el cual el Servicio está disponible.
- **"Tiempo de Inactividad" (Downtime)**: Tiempo durante el cual el Servicio no está disponible.
- **"Mes de Servicio"**: Período de calendario de un mes.
- **"Mantenimiento Programado"**: Inactividad planificada y notificada con anticipación.
- **"Incidente"**: Evento que causa interrupción o degradación del Servicio.
- **"Tiempo de Respuesta"**: Tiempo desde que se reporta un incidente hasta la primera respuesta.
- **"Tiempo de Resolución"**: Tiempo desde que se reporta hasta que se resuelve un incidente.

---

## 3. Niveles de Servicio por Plan

### 3.1 Plan Básico ($49/mes)

| Métrica | Compromiso |
|---------|------------|
| **Disponibilidad Mensual** | 99.0% |
| **Tiempo de Respuesta** | < 48 horas |
| **Tiempo de Resolución (Crítico)** | < 72 horas |
| **Tiempo de Resolución (Alto)** | < 5 días |
| **Soporte** | Email |
| **Horario de Soporte** | Lun-Vie, 9am-6pm |
| **Mantenimiento Programado** | Hasta 8 horas/mes |

### 3.2 Plan Pro ($99/mes)

| Métrica | Compromiso |
|---------|------------|
| **Disponibilidad Mensual** | 99.5% |
| **Tiempo de Respuesta** | < 24 horas |
| **Tiempo de Resolución (Crítico)** | < 48 horas |
| **Tiempo de Resolución (Alto)** | < 3 días |
| **Soporte** | Email + WhatsApp |
| **Horario de Soporte** | Lun-Sáb, 8am-8pm |
| **Mantenimiento Programado** | Hasta 4 horas/mes |

### 3.3 Plan Enterprise (Personalizado)

| Métrica | Compromiso |
|---------|------------|
| **Disponibilidad Mensual** | 99.9% |
| **Tiempo de Respuesta** | < 2 horas |
| **Tiempo de Resolución (Crítico)** | < 4 horas |
| **Tiempo de Resolución (Alto)** | < 24 horas |
| **Soporte** | Email + WhatsApp + Teléfono |
| **Horario de Soporte** | 24/7/365 |
| **Mantenimiento Programado** | Hasta 2 horas/mes |
| **Gerente de Cuenta Dedicado** | Sí |

---

## 4. Cálculo de Disponibilidad

### 4.1 Fórmula

```
Disponibilidad (%) = (Tiempo Total - Tiempo de Inactividad No Programada) / Tiempo Total × 100
```

### 4.2 Tiempo de Inactividad Permitido

| Plan | Disponibilidad | Inactividad Permitida/Mes |
|------|----------------|---------------------------|
| Básico | 99.0% | ~7.2 horas |
| Pro | 99.5% | ~3.6 horas |
| Enterprise | 99.9% | ~43 minutos |

### 4.3 Exclusiones del Cálculo

**NO se cuenta como tiempo de inactividad:**

- Mantenimiento programado (notificado con 48h de anticipación)
- Problemas causados por el Cliente:
  - Uso indebido del Servicio
  - Modificaciones no autorizadas
  - Fallas en infraestructura del Cliente (on-premise)
- Factores fuera de nuestro control:
  - Fuerza mayor (desastres naturales, guerras, etc.)
  - Fallas de proveedores de internet del Cliente
  - Ataques DDoS masivos
  - Fallas de proveedores de infraestructura (AWS, Google Cloud)
- Suspensión por falta de pago
- Suspensión por violación de términos

---

## 5. Prioridades de Incidentes

### 5.1 Clasificación de Severidad

#### Crítico (P1)
**Definición:** El Servicio está completamente inaccesible o inutilizable.

**Ejemplos:**
- Sitio web caído completamente
- Base de datos inaccesible
- Error que impide login de todos los usuarios
- Pérdida de datos

**Tiempo de Respuesta:**
- Básico: 4 horas
- Pro: 2 horas
- Enterprise: 30 minutos

**Tiempo de Resolución:**
- Básico: 72 horas
- Pro: 48 horas
- Enterprise: 4 horas

#### Alto (P2)
**Definición:** Funcionalidad crítica afectada, pero hay workaround.

**Ejemplos:**
- Módulo de reportes no funciona
- Impresión de tickets falla
- Lentitud severa del sistema
- Error que afecta a múltiples usuarios

**Tiempo de Respuesta:**
- Básico: 24 horas
- Pro: 12 horas
- Enterprise: 2 horas

**Tiempo de Resolución:**
- Básico: 5 días
- Pro: 3 días
- Enterprise: 24 horas

#### Medio (P3)
**Definición:** Funcionalidad no crítica afectada.

**Ejemplos:**
- Error cosmético en UI
- Funcionalidad secundaria no funciona
- Problema que afecta a un solo usuario
- Solicitud de mejora menor

**Tiempo de Respuesta:**
- Básico: 48 horas
- Pro: 24 horas
- Enterprise: 4 horas

**Tiempo de Resolución:**
- Básico: 10 días
- Pro: 7 días
- Enterprise: 3 días

#### Bajo (P4)
**Definición:** Consultas generales, preguntas, solicitudes de información.

**Ejemplos:**
- Preguntas sobre uso
- Solicitudes de documentación
- Sugerencias de funcionalidades
- Capacitación

**Tiempo de Respuesta:**
- Básico: 72 horas
- Pro: 48 horas
- Enterprise: 8 horas

**Tiempo de Resolución:**
- Básico: 15 días
- Pro: 10 días
- Enterprise: 5 días

---

## 6. Mantenimiento Programado

### 6.1 Notificación

- **Mínimo 48 horas de anticipación** vía email
- **Publicación en panel de estado:** https://status.aparca.com
- **Descripción:** Qué se hará y duración estimada

### 6.2 Ventanas de Mantenimiento

**Preferidas:**
- Domingos: 2am - 6am (hora local del Cliente)
- Días festivos
- Horarios de baja demanda

**Duración Máxima:**
- Básico: 4 horas por evento
- Pro: 2 horas por evento
- Enterprise: 1 hora por evento

### 6.3 Mantenimiento de Emergencia

En caso de emergencia de seguridad:

- Puede realizarse sin notificación previa
- Notificación durante o inmediatamente después
- Se minimiza el impacto en lo posible

---

## 7. Monitoreo y Reportes

### 7.1 Monitoreo Continuo

Monitoreamos 24/7:

- Disponibilidad del servicio
- Tiempo de respuesta
- Errores de aplicación
- Uso de recursos
- Seguridad

### 7.2 Panel de Estado Público

**URL:** https://status.aparca.com

**Información disponible:**
- Estado actual del servicio
- Incidentes en curso
- Mantenimientos programados
- Historial de incidentes

### 7.3 Reportes de Disponibilidad

**Clientes Pro y Enterprise reciben:**

- Reporte mensual de disponibilidad
- Estadísticas de incidentes
- Métricas de rendimiento
- Tendencias y análisis

---

## 8. Créditos por Incumplimiento de SLA

### 8.1 Elegibilidad

Si la disponibilidad cae por debajo del compromiso:

| Disponibilidad Real | Crédito |
|---------------------|---------|
| 99.0% - 99.5% (Básico) | 5% |
| 98.0% - 99.0% (Básico) | 10% |
| < 98.0% (Básico) | 25% |
| 99.0% - 99.5% (Pro) | 10% |
| 98.5% - 99.0% (Pro) | 15% |
| < 98.5% (Pro) | 30% |
| 99.5% - 99.9% (Enterprise) | 15% |
| 99.0% - 99.5% (Enterprise) | 25% |
| < 99.0% (Enterprise) | 50% |

**Crédito = Porcentaje de la tarifa mensual**

### 8.2 Proceso de Reclamación

1. **Solicitud:** Enviar email a sla@aparca.com dentro de 30 días
2. **Información requerida:**
   - Mes afectado
   - Descripción del incidente
   - Evidencia (si está disponible)
3. **Verificación:** Revisamos logs y métricas (5 días hábiles)
4. **Aprobación:** Notificación de decisión
5. **Aplicación:** Crédito aplicado en próxima factura

### 8.3 Limitaciones

- **Máximo:** 50% de la tarifa mensual
- **Forma:** Solo como crédito en cuenta, no reembolso en efectivo
- **Exclusiones:** No aplica para tiempo de inactividad excluido (ver sección 4.3)

---

## 9. Soporte Técnico

### 9.1 Canales de Soporte

| Canal | Básico | Pro | Enterprise |
|-------|--------|-----|------------|
| Email | ✅ | ✅ | ✅ |
| WhatsApp | ❌ | ✅ | ✅ |
| Teléfono | ❌ | ❌ | ✅ |
| Chat en vivo | ❌ | ❌ | ✅ |
| Gerente de cuenta | ❌ | ❌ | ✅ |

### 9.2 Idiomas de Soporte

- Español (principal)
- Inglés (disponible)

### 9.3 Alcance del Soporte

**Incluido:**
- Resolución de problemas técnicos
- Guía de uso del software
- Asistencia con configuración
- Reporte de bugs
- Consultas sobre funcionalidades

**No incluido (servicios adicionales):**
- Personalización del software
- Desarrollo de integraciones
- Capacitación extendida
- Consultoría de procesos
- Migración de datos

---

## 10. Seguridad y Backups

### 10.1 Seguridad

**Compromisos:**
- Encriptación SSL/TLS (datos en tránsito)
- Encriptación en reposo (base de datos)
- Firewalls y protección DDoS
- Auditorías de seguridad trimestrales
- Cumplimiento con estándares de la industria

### 10.2 Backups

| Aspecto | Básico | Pro | Enterprise |
|---------|--------|-----|------------|
| Frecuencia | Diario | Diario | Cada 6 horas |
| Retención | 7 días | 30 días | 90 días |
| Ubicación | Misma región | Multi-región | Multi-región + On-site |
| Restauración | 24 horas | 12 horas | 4 horas |
| Pruebas | Mensual | Semanal | Diario |

### 10.3 Recuperación ante Desastres

**RTO (Recovery Time Objective):**
- Básico: 24 horas
- Pro: 12 horas
- Enterprise: 4 horas

**RPO (Recovery Point Objective):**
- Básico: 24 horas
- Pro: 12 horas
- Enterprise: 1 hora

---

## 11. Actualizaciones y Mejoras

### 11.1 Actualizaciones de Seguridad

- Aplicadas inmediatamente
- Pueden causar breve interrupción
- Notificación posterior

### 11.2 Actualizaciones Funcionales

**Menores:**
- Correcciones de bugs
- Mejoras de rendimiento
- Aplicadas automáticamente

**Mayores:**
- Nuevas funcionalidades
- Cambios de UI
- Notificación previa de 7 días

### 11.3 Roadmap de Producto

- Clientes Enterprise tienen acceso al roadmap
- Pueden influir en prioridades
- Actualizaciones trimestrales

---

## 12. Escalamiento de Incidentes

### 12.1 Proceso de Escalamiento

**Nivel 1 - Soporte Técnico:**
- Primera línea de atención
- Resolución de problemas comunes

**Nivel 2 - Ingeniería:**
- Problemas técnicos complejos
- Escalado automático si no se resuelve en:
  - Crítico: 2 horas
  - Alto: 8 horas

**Nivel 3 - Gerencia:**
- Incidentes críticos prolongados
- Problemas que afectan a múltiples clientes
- Decisiones de negocio

### 12.2 Contacto de Escalamiento

**Clientes Enterprise:**
- Gerente de cuenta dedicado
- Línea directa de escalamiento
- Acceso a CTO para incidentes críticos

---

## 13. Modificaciones al SLA

### 13.1 Derecho a Modificar

Nos reservamos el derecho de modificar este SLA con:

- **30 días de notificación previa**
- Publicación en sitio web
- Email a todos los clientes

### 13.2 Mejoras

Mejoras al SLA (mayor disponibilidad, mejor soporte) se aplican inmediatamente.

### 13.3 Reducciones

Reducciones requieren:

- Notificación de 60 días
- Opción de cancelar sin penalización

---

## 14. Contacto

### 14.1 Soporte General

- **Email:** soporte@aparca.com
- **WhatsApp:** +57 300 123 4567
- **Portal:** https://soporte.aparca.com

### 14.2 Reclamaciones de SLA

- **Email:** sla@aparca.com
- **Asunto:** "Reclamación SLA - [Mes]"

### 14.3 Emergencias (Solo Enterprise)

- **Teléfono 24/7:** +57 300 999 9999
- **Email Crítico:** emergencia@aparca.com

---

## 15. Aceptación

Al contratar el Servicio, usted acepta este SLA y sus términos.

---

**APARCA SAAS - ACUERDO DE NIVEL DE SERVICIO**  
**Versión 1.0 - Enero 2026**

**Para consultas: sla@aparca.com**
