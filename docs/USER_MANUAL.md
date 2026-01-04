# 📖 Manual de Usuario - Aparca SaaS

**Versión 1.0** | Última actualización: Enero 2026

---

## 📋 Tabla de Contenidos

1. [Introducción](#introducción)
2. [Primeros Pasos](#primeros-pasos)
3. [Gestión de Parqueaderos](#gestión-de-parqueaderos)
4. [Clientes Mensuales](#clientes-mensuales)
5. [Servicios Adicionales](#servicios-adicionales)
6. [Reportes y Finanzas](#reportes-y-finanzas)
7. [Administración](#administración)
8. [Preguntas Frecuentes](#preguntas-frecuentes)

---

## 1. Introducción

### ¿Qué es Aparca?

Aparca es un sistema completo para gestionar parqueaderos que te permite:
- Registrar entradas y salidas de vehículos
- Administrar clientes mensuales
- Ofrecer servicios adicionales (lavado, tienda)
- Generar reportes financieros
- Controlar turnos y cuadre de caja

### Roles de Usuario

| Rol | Permisos |
|-----|----------|
| **Super Admin** | Control total del sistema, múltiples empresas |
| **Admin** | Gestión completa de su empresa y sedes |
| **Operador** | Operación diaria del parqueadero |

---

## 2. Primeros Pasos

### 2.1 Iniciar Sesión

1. Abre tu navegador y ve a la URL de Aparca
2. Ingresa tu **email** y **contraseña**
3. Haz clic en **"Iniciar Sesión"**

![Login](../assets/screenshots/login.png)

### 2.2 Seleccionar Sede

Si tienes acceso a múltiples sedes:

1. Después de iniciar sesión, verás la pantalla de selección
2. Haz clic en la sede donde trabajarás
3. El sistema te llevará al dashboard

### 2.3 Abrir Turno

⚠️ **IMPORTANTE:** Debes abrir un turno antes de registrar operaciones.

1. En el dashboard, haz clic en **"Abrir Turno"**
2. Ingresa el **monto base** (efectivo inicial en caja)
3. Haz clic en **"Confirmar"**

![Abrir Turno](../assets/screenshots/open-shift.png)

---

## 3. Gestión de Parqueaderos

### 3.1 Registrar Entrada de Vehículo

#### Paso a Paso:

1. Ve a **"Parqueadero"** en el menú lateral
2. Haz clic en el botón **"+ Nuevo Ingreso"**
3. Completa el formulario:
   - **Placa:** Ingresa la placa del vehículo (ej: ABC123)
   - **Tipo de Vehículo:** Selecciona Carro, Moto u Otro
   - **Plan:** Selecciona Por Hora o Por Día (si aplica)
4. Haz clic en **"Registrar Entrada"**
5. El sistema te preguntará si deseas imprimir el ticket
6. Haz clic en **"Imprimir"** o **"Cancelar"**

![Entrada Vehículo](../assets/screenshots/vehicle-entry.png)

#### Atajos de Teclado:
- `Ctrl + N`: Nuevo ingreso
- `Enter`: Confirmar
- `Esc`: Cancelar

### 3.2 Registrar Salida de Vehículo

#### Paso a Paso:

1. En la lista de vehículos, busca la placa
2. Haz clic en el botón **"Salida"** (ícono de puerta)
3. Revisa el **resumen de cobro**:
   - Placa
   - Tiempo de permanencia
   - Costo calculado
4. Selecciona **método de pago** (Efectivo o Transferencia)
5. **Opcional:** Aplica descuentos o convenios
6. Si es efectivo, ingresa el **dinero recibido**
7. El sistema calcula la **devuelta** automáticamente
8. Haz clic en **"Confirmar Salida"**
9. Imprime el recibo si lo deseas

![Salida Vehículo](../assets/screenshots/vehicle-exit.png)

#### Descuentos y Convenios:

**Descuento Manual:**
1. En la pantalla de salida, ingresa el monto de descuento
2. Escribe el motivo del descuento
3. El total se actualiza automáticamente

**Convenio:**
1. Selecciona el convenio de la lista desplegable
2. El descuento se aplica automáticamente
3. Puede ser por horas gratis, porcentaje o monto fijo

### 3.3 Reimprimir Ticket

1. Busca el vehículo en la lista
2. Haz clic en el ícono de **impresora**
3. El ticket se imprimirá nuevamente

### 3.4 Buscar Vehículo

- Usa la **barra de búsqueda** en la parte superior
- Escribe la placa (parcial o completa)
- Los resultados se filtran en tiempo real

### 3.5 Modo Offline

Si se cae el internet:

✅ **El sistema sigue funcionando**
- Puedes registrar entradas y salidas
- Las operaciones se guardan en una cola
- Cuando vuelva el internet, se sincronizan automáticamente

⚠️ **Limitaciones en modo offline:**
- No puedes ver reportes en tiempo real
- No se actualizan datos de otras sedes

---

## 4. Clientes Mensuales

### 4.1 Crear Cliente Mensual

1. Ve a **"Clientes Mensuales"**
2. Haz clic en **"+ Nuevo Cliente"**
3. Completa el formulario:
   - **Placa:** ABC123
   - **Nombre:** Juan Pérez
   - **Teléfono:** 3001234567
   - **Tipo de Vehículo:** Carro/Moto
   - **Tarifa Mensual:** $150,000
   - **Método de Pago:** Efectivo/Transferencia
4. Haz clic en **"Guardar"**
5. El sistema genera el recibo automáticamente

### 4.2 Renovar Mensualidad

1. En la lista de clientes, busca al cliente
2. Haz clic en **"Renovar"**
3. Confirma el monto (puedes modificarlo)
4. Selecciona método de pago
5. Haz clic en **"Confirmar Renovación"**
6. Imprime el recibo

### 4.3 Ver Historial de Pagos

1. Haz clic en **"Historial"** del cliente
2. Verás todos los pagos realizados
3. Puedes reimprimir cualquier recibo

### 4.4 Desactivar Cliente

1. Haz clic en el menú de opciones (⋮)
2. Selecciona **"Desactivar"**
3. Confirma la acción
4. El cliente pasa a estado "Inactivo"

### 4.5 Exportar a Excel

1. Haz clic en **"Exportar"**
2. Selecciona el filtro (Todos/Activos/Inactivos)
3. Se descarga un archivo Excel con todos los datos

---

## 5. Servicios Adicionales

### 5.1 Lavado de Vehículos

#### Registrar Servicio de Lavado:

1. Ve a **"Lavado"**
2. Haz clic en **"+ Nuevo Servicio"**
3. Completa:
   - **Placa:** ABC123
   - **Tipo de Servicio:** Básico/Completo/Premium
   - **Precio:** Se autocompleta según el servicio
4. Haz clic en **"Registrar"**
5. Imprime el recibo

#### Configurar Servicios:

1. Haz clic en **"Configurar Servicios"**
2. Agrega, edita o elimina tipos de lavado
3. Define precios para cada tipo

### 5.2 Punto de Venta (POS)

#### Realizar una Venta:

1. Ve a **"Ingresos"** → Pestaña **"POS"**
2. Selecciona productos haciendo clic en ellos
3. Los productos se agregan al carrito
4. Ajusta cantidades si es necesario
5. Selecciona método de pago
6. Haz clic en **"Confirmar Venta"**
7. Imprime el recibo

#### Gestionar Productos:

1. Ve a **"Inventario"**
2. Haz clic en **"+ Nuevo Producto"**
3. Completa:
   - **Nombre:** Coca-Cola
   - **Precio:** $3,000
   - **Stock:** 50
4. Haz clic en **"Guardar"**

---

## 6. Reportes y Finanzas

### 6.1 Cerrar Turno

⚠️ **IMPORTANTE:** Cierra el turno al final de tu jornada.

1. En el dashboard, haz clic en **"Cerrar Turno"**
2. Ingresa el **efectivo declarado** (lo que hay en caja)
3. Agrega **notas** si es necesario
4. Haz clic en **"Confirmar Cierre"**
5. El sistema muestra el **resumen del turno**:
   - Ingresos totales
   - Gastos
   - Efectivo esperado vs declarado
   - Diferencia (si hay)
6. Imprime el resumen

![Cerrar Turno](../assets/screenshots/close-shift.png)

### 6.2 Ver Transacciones

1. Ve a **"Transacciones"**
2. Usa los filtros:
   - **Fecha:** Hoy/Ayer/Rango personalizado
   - **Tipo:** Entrada/Salida/Mensualidad/etc.
   - **Método de Pago:** Efectivo/Transferencia
3. Exporta a Excel si lo necesitas

### 6.3 Historial de Turnos

1. Ve a **"Historial de Turnos"**
2. Selecciona el rango de fechas
3. Haz clic en un turno para ver detalles
4. Puedes reimprimir el resumen

### 6.4 Reportes Consolidados

1. Ve a **"Reportes"**
2. Selecciona el período:
   - Hoy
   - Ayer
   - Semana
   - Mes
   - Personalizado
3. El reporte muestra:
   - Ingresos por categoría
   - Gastos
   - Utilidad neta
   - Gráficas
4. Exporta a Excel

---

## 7. Administración

### 7.1 Gestión de Usuarios (Solo Admin)

#### Crear Usuario:

1. Ve a **"Usuarios"**
2. Haz clic en **"+ Nuevo Usuario"**
3. Completa:
   - **Nombre de usuario:** operador1
   - **Contraseña:** (mínimo 8 caracteres)
   - **Rol:** Operador/Admin
   - **Estado:** Activo/Inactivo
4. Haz clic en **"Guardar"**

#### Asignar Sedes:

1. Haz clic en **"Gestionar Sedes"** del usuario
2. Selecciona las sedes a las que tendrá acceso
3. Haz clic en **"Guardar"**

### 7.2 Configuración de Tarifas

1. Ve a **"Configuración"** → **"Tarifas"**
2. Selecciona el tipo de vehículo
3. Configura el modelo de tarifa:
   - **Por Minuto:** Precio por minuto
   - **Por Hora:** Precio por hora + fracción
   - **Por Bloques:** Define bloques de tiempo
4. Configura la **tarifa plena** (máximo por día)
5. Haz clic en **"Guardar"**

### 7.3 Convenios y Descuentos

1. Ve a **"Convenios"**
2. Haz clic en **"+ Nuevo Convenio"**
3. Completa:
   - **Nombre:** Empresa XYZ
   - **Tipo:** Horas Gratis/Porcentaje/Monto Fijo
   - **Valor:** 2 horas / 20% / $5,000
4. Haz clic en **"Guardar"**

### 7.4 Configuración de Impresión

1. Ve a **"Configuración"** → **"Impresión"**
2. Configura:
   - **Nombre del parqueadero**
   - **Dirección**
   - **Teléfono**
   - **NIT**
   - **Mostrar diálogo de impresión:** Sí/No
3. Haz clic en **"Guardar"**

---

## 8. Preguntas Frecuentes

### ¿Qué hago si olvidé mi contraseña?

1. En la pantalla de login, haz clic en **"¿Olvidaste tu contraseña?"**
2. Ingresa tu email
3. Recibirás un enlace para restablecerla

### ¿Puedo usar Aparca en mi celular?

Sí, Aparca es responsive y funciona en cualquier dispositivo. También puedes instalarlo como app:

1. En Chrome móvil, abre el menú (⋮)
2. Selecciona **"Agregar a pantalla de inicio"**
3. Ahora tienes Aparca como app nativa

### ¿Qué pasa si se va la luz?

Si tienes un UPS o batería de respaldo, el sistema sigue funcionando. Las operaciones se guardan localmente y se sincronizan cuando vuelva el internet.

### ¿Cómo corrijo un error en una transacción?

Contacta a tu administrador o soporte. Las transacciones no se pueden eliminar por seguridad, pero se pueden anular con autorización.

### ¿Puedo tener múltiples turnos abiertos?

No, solo puede haber un turno activo por sede a la vez. Debes cerrar el turno actual antes de abrir uno nuevo.

### ¿Cómo cambio el modo oscuro?

Haz clic en el ícono de luna/sol en la esquina superior derecha.

---

## 📞 Soporte

¿Necesitas ayuda?

- 📧 **Email:** soporte@aparca.com
- 💬 **WhatsApp:** +57 300 123 4567
- 📞 **Teléfono:** +57 (1) 234 5678
- 🌐 **Portal:** https://soporte.aparca.com

**Horario de atención:**
- Lunes a Viernes: 8am - 6pm
- Sábados: 9am - 1pm

---

## 📚 Recursos Adicionales

- [Videos Tutoriales](./VIDEOS.md)
- [Guía de Instalación](./INSTALLATION.md)
- [Preguntas Frecuentes Completas](./FAQ.md)

---

**¡Gracias por usar Aparca!** 🚗
