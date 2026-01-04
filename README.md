# 🅿️ Aparca - Sistema de Gestión de Parqueaderos SaaS

> **Plataforma multi-tenant profesional para la gestión completa de parqueaderos, lavaderos y puntos de venta.**

[![Versión](https://img.shields.io/badge/version-1.0.0-blue.svg)](https://github.com/yourusername/aparca)
[![Licencia](https://img.shields.io/badge/license-Commercial-green.svg)](./LICENSE.md)
[![Estado](https://img.shields.io/badge/status-Production%20Ready-success.svg)]()

---

## 📋 Tabla de Contenidos

- [¿Qué es Aparca?](#qué-es-aparca)
- [Características Principales](#características-principales)
- [¿Para Quién es?](#para-quién-es)
- [Tecnologías](#tecnologías)
- [Inicio Rápido](#inicio-rápido)
- [Documentación](#documentación)
- [Planes y Precios](#planes-y-precios)
- [Soporte](#soporte)
- [Licencia](#licencia)

---

## 🎯 ¿Qué es Aparca?

**Aparca** es una solución SaaS completa para la gestión de parqueaderos que permite a empresas de cualquier tamaño:

- ✅ Gestionar múltiples sedes desde una sola plataforma
- ✅ Controlar entradas y salidas de vehículos en tiempo real
- ✅ Administrar clientes mensuales y servicios adicionales
- ✅ Generar reportes financieros detallados
- ✅ Operar en modo offline cuando no hay internet
- ✅ Imprimir tickets y recibos automáticamente

### 🎥 Video Demo
[Ver Demo en YouTube](https://youtube.com/demo) *(Próximamente)*

---

## ⭐ Características Principales

### 🚗 Gestión de Parqueaderos
- **Entrada/Salida Rápida:** Registro de vehículos en segundos
- **Múltiples Tarifas:** Por minuto, hora, bloques o día
- **Tipos de Vehículo:** Carros, motos, y otros
- **Búsqueda Inteligente:** Encuentra vehículos por placa al instante
- **Impresión Automática:** Tickets de entrada y recibos de salida

### 💳 Clientes Mensuales
- **Gestión Completa:** Alta, renovación y seguimiento
- **Pagos Flexibles:** Efectivo o transferencia
- **Historial Detallado:** Todos los pagos registrados
- **Alertas de Vencimiento:** Notificaciones automáticas
- **Exportación a Excel:** Reportes personalizados

### 🧼 Servicios Adicionales
- **Lavado de Vehículos:** Gestión de servicios de lavado
- **Punto de Venta (POS):** Venta de productos adicionales
- **Inventario:** Control de productos y servicios
- **Convenios:** Descuentos para empresas aliadas

### 📊 Reportes y Finanzas
- **Turnos con Cuadre de Caja:** Control total del efectivo
- **Reportes Consolidados:** Ingresos, gastos y utilidades
- **Historial de Transacciones:** Búsqueda y filtros avanzados
- **Exportación:** Excel para análisis externo
- **Gráficas en Tiempo Real:** Dashboard ejecutivo

### 🏢 Multi-Tenancy
- **Múltiples Empresas:** Una plataforma, infinitas empresas
- **Múltiples Sedes:** Cada empresa puede tener varias sedes
- **Aislamiento Total:** Datos 100% separados por empresa
- **Gestión Centralizada:** Super admin controla todo

### 👥 Control de Acceso
- **Roles Definidos:** Super Admin, Admin, Operador
- **Permisos Granulares:** Control por funcionalidad
- **Asignación por Sede:** Usuarios específicos por ubicación
- **Auditoría Completa:** Registro de todas las acciones

### 🌐 Modo Offline
- **Operación Sin Internet:** Funciona aunque se caiga la conexión
- **Sincronización Automática:** Al recuperar internet
- **Cola de Operaciones:** Nada se pierde
- **PWA:** Instala como app nativa

### 🎨 Experiencia de Usuario
- **Modo Oscuro:** Protege la vista de tus operadores
- **Responsive:** Funciona en PC, tablet y móvil
- **Atajos de Teclado:** Operación ultra-rápida
- **Notificaciones:** Toasts informativos en tiempo real

---

## 👥 ¿Para Quién es?

### 🏢 Empresas de Parqueaderos
- Parqueaderos públicos
- Centros comerciales
- Edificios corporativos
- Aeropuertos y terminales

### 🚗 Lavaderos de Vehículos
- Lavaderos express
- Centros de estética automotriz
- Estaciones de servicio

### 🏪 Negocios Mixtos
- Parqueadero + Lavado
- Parqueadero + Tienda
- Servicios integrados

### 💼 Administradores de Múltiples Sedes
- Cadenas de parqueaderos
- Franquicias
- Grupos empresariales

---

## 🛠️ Tecnologías

### Frontend
- **React 18** + **TypeScript** - UI moderna y type-safe
- **Vite** - Build tool ultra-rápido
- **Tailwind CSS** - Diseño profesional
- **PWA** - Instalable como app nativa
- **Offline First** - Funciona sin internet

### Backend
- **Node.js** + **Express** - API REST robusta
- **TypeORM** - ORM type-safe
- **PostgreSQL** - Base de datos empresarial
- **JWT** - Autenticación segura
- **WebSockets** - Sincronización en tiempo real

### Infraestructura
- **Docker** - Despliegue consistente
- **Nginx** - Reverse proxy
- **PM2** - Process manager
- **Backups Automáticos** - Seguridad de datos

---

## 🚀 Inicio Rápido

### Opción 1: Instalación con Docker (Recomendado)

```bash
# Clonar repositorio
git clone https://github.com/yourusername/aparca.git
cd aparca

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus configuraciones

# Levantar servicios
docker-compose up -d

# Acceder a la aplicación
# Frontend: http://localhost:5173
# Backend: http://localhost:3001
```

### Opción 2: Instalación Manual

Ver [Guía de Instalación Completa](./docs/INSTALLATION.md)

### Credenciales Iniciales

```
Super Admin:
Email: admin@aparca.com
Password: Admin123!

(Cambiar inmediatamente después del primer login)
```

---

## 📚 Documentación

### Para Usuarios
- 📖 [Manual de Usuario](./docs/USER_MANUAL.md) - Guía completa paso a paso
- 🎥 [Videos Tutoriales](./docs/VIDEOS.md) - Aprende visualmente
- ❓ [Preguntas Frecuentes (FAQ)](./docs/FAQ.md)

### Para Administradores
- 🔧 [Guía de Instalación](./docs/INSTALLATION.md)
- ⚙️ [Configuración Avanzada](./docs/CONFIGURATION.md)
- 🔐 [Seguridad y Backups](./docs/SECURITY.md)
- 📊 [Monitoreo y Mantenimiento](./docs/MAINTENANCE.md)

### Para Desarrolladores
- 🏗️ [Arquitectura](./docs/ARCHITECTURE.md)
- 🔌 [API Documentation](./docs/API.md)
- 🧪 [Testing](./docs/TESTING.md)
- 🤝 [Contribución](./CONTRIBUTING.md)

---

## 💰 Planes y Precios

### 🌱 Plan Básico - $49/mes
- 1 Sede
- 2 Usuarios
- Gestión de parqueadero
- Reportes básicos
- Soporte por email

### 🚀 Plan Pro - $99/mes
- 3 Sedes
- 5 Usuarios
- Todas las funcionalidades
- Clientes mensuales
- Lavado y POS
- Soporte prioritario

### 🏢 Plan Enterprise - Personalizado
- Sedes ilimitadas
- Usuarios ilimitados
- White-labeling
- API personalizada
- Soporte 24/7
- Capacitación incluida

[Ver Comparación Completa](https://aparca.com/pricing)

---

## 🆘 Soporte

### Canales de Soporte

- 📧 **Email:** soporte@aparca.com
- 💬 **WhatsApp:** +57 300 123 4567
- 📞 **Teléfono:** +57 (1) 234 5678
- 🌐 **Portal:** https://soporte.aparca.com

### Horarios de Atención

- **Plan Básico:** Lunes a Viernes, 9am - 6pm
- **Plan Pro:** Lunes a Sábado, 8am - 8pm
- **Plan Enterprise:** 24/7

### Tiempo de Respuesta

- **Crítico:** < 2 horas
- **Alto:** < 4 horas
- **Medio:** < 24 horas
- **Bajo:** < 48 horas

---

## 📄 Licencia

Este software es **propiedad comercial**. Ver [LICENSE.md](./LICENSE.md) para detalles.

### Términos de Uso
- [Términos y Condiciones](./docs/legal/TERMS.md)
- [Política de Privacidad](./docs/legal/PRIVACY.md)
- [Acuerdo de Nivel de Servicio (SLA)](./docs/legal/SLA.md)

---

## 🌟 Casos de Éxito

> "Aparca nos ayudó a digitalizar nuestros 5 parqueaderos. Ahora tenemos control total en tiempo real."
> 
> **— Juan Pérez, Gerente de Operaciones, ParqueoMax**

> "El modo offline fue clave para nosotros. Nunca perdemos una transacción."
>
> **— María González, Dueña, Lavadero Express**

---

## 🔒 Seguridad y Cumplimiento

- ✅ Encriptación SSL/TLS
- ✅ Backups diarios automáticos
- ✅ Autenticación JWT
- ✅ Cumplimiento GDPR
- ✅ Auditoría completa
- ✅ Protección DDoS

---

## 🗺️ Roadmap

### Q1 2026
- [ ] App móvil nativa (iOS/Android)
- [ ] Integración con cámaras LPR
- [ ] Dashboard analytics avanzado

### Q2 2026
- [ ] API pública
- [ ] Webhooks
- [ ] Integraciones (Stripe, PayPal)

### Q3 2026
- [ ] IA para predicción de ocupación
- [ ] Sistema de reservas online
- [ ] App para clientes

---

## 📞 Contacto

**Aparca SaaS**

- 🌐 Website: https://aparca.com
- 📧 Email: contacto@aparca.com
- 📱 WhatsApp: +57 300 123 4567
- 📍 Dirección: Calle 123 #45-67, Bogotá, Colombia

---

## ⚡ Demo en Vivo

¿Quieres probarlo antes de comprar?

👉 [Solicitar Demo Gratuita](https://aparca.com/demo)

---

<div align="center">

**Hecho con ❤️ en Colombia**

[Website](https://aparca.com) • [Documentación](./docs) • [Soporte](https://soporte.aparca.com) • [Blog](https://blog.aparca.com)

</div>
