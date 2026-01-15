# Guía de Migraciones de MikroORM

## 📋 Configuración Completada

### ✅ Lo que se instaló/configuró:

1. **Paquetes NPM:**
   - `@mikro-orm/migrations@6.6.4`
   - Todos los paquetes @mikro-orm actualizados a 6.6.4

2. **Configuración:**
   - `mikro-orm.config.ts` - Agregada sección `migrations`
   - `package.json` - Agregados scripts de migración

3. **Scripts NPM disponibles:**
   ```json
   "migration:create": "mikro-orm migration:create"
   "migration:up": "mikro-orm migration:up"
   "migration:down": "mikro-orm migration:down"
   "migration:pending": "mikro-orm migration:pending"
   ```

4. **Migración inicial creada:**
   - `Migration20260115003959.ts` - Contiene TODO el esquema actual

---

## 🚀 Cómo Usar (Flujo Normal Futuro)

### 1. Hacer cambios a una entidad

Ejemplo: Agregar un campo `email` a `User.ts`:

```typescript
@Property()
email!: string;
```

### 2. Crear la migración

```bash
npm run migration:create
```

Esto genera automáticamente un archivo como `Migration20260115123456.ts` con los cambios SQL necesarios.

### 3. Revisar la migración generada

Abre el archivo y revisa que el SQL sea correcto.

### 4. Aplicar la migración

**En desarrollo:**
```bash
npm run migration:up
```

**En producción (VPS):**
```bash
docker exec -it parking_server npm run migration:up
```

---

## 🔧 Situación Actual (Base de Datos Existente)

### Problema

- La base de datos YA EXISTE con todas las tablas
- La migración inicial contiene todo el esquema (incluyendo `notes` como TEXT)
- Pero en la BD actual, `notes` es VARCHAR(255)

### Solución para Produccion

**¡IMPORTANTE!** Las migraciones ahora se ejecutan automáticamente en el workflow de CI/CD.

Cada vez que hagas push a `main`, el workflow:
1. Hace pull del código
2. **Ejecuta `npm run migration:up`** (esto es nuevo)
3. Hace `docker compose up -d --build`

#### Paso 1: Marcar migración inicial como ejecutada

Solo la **PRIMERA VEZ**, debes marcar la migración inicial como ejecutada en producción:

```bash
# Conectarse a Postgres
docker exec -it parking_db psql -U postgres -d parking_db

# Crear tabla de migraciones si no existe
CREATE TABLE IF NOT EXISTS mikro_orm_migrations (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255),
    executed_at TIMESTAMPTZ DEFAULT now()
);

# Marcar la migración inicial como ejecutada
INSERT INTO mikro_orm_migrations (name) 
VALUES ('Migration20260115003959');

# Salir
\q
```

#### Paso 2: Futuras migraciones

**Ya no necesitas hacer nada manualmente!** 

Cuando crees una nueva migración y hagas push a `main`:
- GitHub Actions la ejecutará automáticamente
- Si falla, el deployment se detiene
- Si pasa, continúa con el deploy

#### ¿Qué pasa si el esquema ya está al día?

**No hay problema!** `npm run migration:up` simplemente dice "No pending migrations" y continúa. 
**Nunca falla** si no hay nada que migrar.

### Para Desarrollo Local

Si estás en desarrollo local, puedes:

**Opción A - Recrear la BD:**
```bash
# Borrar y recrear
npm run migration:up
```

**Opción B - Igual que producción:**
Seguir los pasos 1-3 de arriba pero usando tu PostgreSQL local.

---

## 📝 Comandos Útiles

### Ver migraciones pendientes
```bash
npm run migration:pending
```

### Revertir última migración
```bash
npm run migration:down
```

### Crear migración con nombre específico
```bash
npm run migration:create -- --name=add-email-to-users
```

---

## 🎯 Workflow Futuro (Después de Setup Inicial)

### Para cualquier cambio al esquema:

1. Modificar la entidad TypeScript
2. `npm run migration:create`
3. Revisar el SQL generado
4. `npm run migration:up` (dev)
5. Commit la migración al repo
6. En prod: `docker exec -it parking_server npm run migration:up`

### Importante

⚠️ **NUNCA** modifiques el esquema directamente en la BD en producción
⚠️ **SIEMPRE** crea migraciones para cambios
⚠️ **NUNCA** ejecutes `schema:update` o `schema:drop` en producción

---

## 🐛 Troubleshooting

### "No changes required, schema is up-to-date"

Significa que las entidades coinciden con la BD. Si esperas cambios:
- Verifica que modificaste la entidad
- Asegúrate de que guardaste el archivo
- MikroORM solo detecta cambios declarados en entidades

### "Bad @mikro-orm/xxx version"

Todos los paquetes @mikro-orm deben estar en la misma versión:
```bash
npm list @mikro-orm/core @mikro-orm/cli @mikro-orm/postgresql @mikro-orm/migrations
```

Actualizar todos a la misma versión:
```bash
npm install @mikro-orm/core@X.X.X @mikro-orm/cli@X.X.X ...
```

### Migración falla en producción

1. Ver logs: `docker logs parking_server`
2. Conectarse a BD y verificar manualmente
3. Si es necesario, revertir: `npm run migration:down`

---

## 📚 Recursos

- [MikroORM Migrations Docs](https://mikro-orm.io/docs/migrations)
- [Migration CLI Commands](https://mikro-orm.io/docs/migrations#migration-cli)
