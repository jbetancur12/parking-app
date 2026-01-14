# Blue-Green Zero-Downtime Deployment

Este directorio contiene la configuración para despliegues sin downtime usando la estrategia Blue-Green.

## 📁 Estructura

```
├── docker-compose.blue-green.yml  # Compose con profiles blue/green
├── nginx/
│   ├── nginx.conf                  # Config principal de NGINX
│   └── conf.d/
│       └── default.conf            # Upstream blue/green
├── scripts/
│   ├── deploy-blue.sh              # Despliega versión BLUE
│   ├── deploy-green.sh             # Despliega versión GREEN
│   └── switch-traffic.sh           # Cambia tráfico automáticamente
```

## 🚀 Primer Deploy (Setup Inicial)

```bash
# 1. Iniciar infraestructura + BLUE
docker compose -f docker-compose.blue-green.yml up -d postgres client nginx
docker compose -f docker-compose.blue-green.yml --profile blue up -d server-blue

# 2. Verificar health
curl http://localhost/health
```

## 🔄 Deploys Subsiguientes

### Si BLUE está activo → Despliega GREEN

```bash
# 1. Construir y levantar green
./scripts/deploy-green.sh

# 2. Verificar que green funciona
docker logs parking_server_green

# 3. Cambiar tráfico a green
./scripts/switch-traffic.sh green

# 4. Apagar blue (opcional, después de verificar)
docker compose -f docker-compose.blue-green.yml --profile blue stop server-blue
```

### Si GREEN está activo → Despliega BLUE

```bash
./scripts/deploy-blue.sh
./scripts/switch-traffic.sh blue
docker compose -f docker-compose.blue-green.yml --profile green stop server-green
```

## 🔙 Rollback Instantáneo

Si algo falla después del switch:

```bash
./scripts/switch-traffic.sh blue  # o green, dependiendo cuál era el anterior
```

## ⚙️ Configuración de Dominios

Edita `nginx/conf.d/default.conf`:

```nginx
server {
    server_name api.TU-DOMINIO.com;  # Cambiar aquí
    ...
}
```

## 📊 Healthcheck

El endpoint `/health` devuelve:

```json
{
  "status": "healthy",
  "timestamp": "2024-01-13T21:00:00.000Z",
  "version": "1.0.0"
}
```

## ⚠️ Notas Importantes

1. **NGINX reload, NUNCA restart**: `nginx -s reload` mantiene conexiones activas
2. **RAM**: Durante el deploy ambos backends corren (~2x RAM temporal)
3. **Migraciones**: Si hay cambios de DB, aplícalos ANTES del switch
4. **Logs**: Siempre revisa logs antes de cambiar tráfico
