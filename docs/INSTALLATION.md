# 🔧 Guía de Instalación - Aparca SaaS

Esta guía te llevará paso a paso para instalar Aparca en tu servidor.

---

## 📋 Requisitos Previos

### Hardware Mínimo
- **CPU:** 2 cores
- **RAM:** 4 GB
- **Disco:** 20 GB SSD
- **Red:** 10 Mbps

### Hardware Recomendado (Producción)
- **CPU:** 4+ cores
- **RAM:** 8+ GB
- **Disco:** 50+ GB SSD
- **Red:** 100 Mbps

### Software Requerido
- **Sistema Operativo:** Ubuntu 20.04+ / Debian 11+ / Windows Server 2019+
- **Node.js:** v18.x o superior
- **PostgreSQL:** v14.x o superior
- **Nginx:** v1.18+ (opcional, recomendado para producción)
- **Docker:** v20.10+ (opcional, para instalación con Docker)

---

## 🚀 Opción 1: Instalación con Docker (Recomendado)

### Paso 1: Instalar Docker y Docker Compose

#### En Ubuntu/Debian:
```bash
# Actualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Instalar Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Verificar instalación
docker --version
docker-compose --version
```

#### En Windows:
1. Descargar [Docker Desktop](https://www.docker.com/products/docker-desktop)
2. Instalar y reiniciar
3. Verificar en PowerShell: `docker --version`

### Paso 2: Clonar el Repositorio

```bash
# Clonar proyecto
git clone https://github.com/yourusername/aparca.git
cd aparca
```

### Paso 3: Configurar Variables de Entorno

```bash
# Copiar archivo de ejemplo
cp .env.example .env

# Editar configuración
nano .env  # o usar tu editor favorito
```

**Configuración mínima requerida:**

```env
# Base de Datos
DATABASE_HOST=postgres
DATABASE_PORT=5432
DATABASE_USER=aparca
DATABASE_PASSWORD=TuPasswordSeguro123!
DATABASE_NAME=aparca_db

# JWT
JWT_SECRET=TuSecretoSuperSeguro123!ChangeThis

# URLs
VITE_API_URL=http://localhost:3001/api
CLIENT_URL=http://localhost:5173

# Email (Opcional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu-email@gmail.com
SMTP_PASS=tu-password-app

# Entorno
NODE_ENV=production
```

### Paso 4: Levantar Servicios

```bash
# Construir y levantar contenedores
docker-compose up -d

# Ver logs
docker-compose logs -f

# Verificar que todo esté corriendo
docker-compose ps
```

### Paso 5: Inicializar Base de Datos

```bash
# Ejecutar migraciones
docker-compose exec server npm run migration:run

# Crear usuario super admin inicial
docker-compose exec server npm run seed:admin
```

### Paso 6: Acceder a la Aplicación

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:3001/api
- **Landing Page:** http://localhost:4321

**Credenciales iniciales:**
- Email: `admin@aparca.com`
- Password: `Admin123!`

⚠️ **IMPORTANTE:** Cambia la contraseña inmediatamente después del primer login.

---

## 🛠️ Opción 2: Instalación Manual

### Paso 1: Instalar Node.js

#### Ubuntu/Debian:
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
node --version  # Debe ser v18.x+
```

#### Windows:
1. Descargar desde [nodejs.org](https://nodejs.org)
2. Instalar versión LTS
3. Verificar: `node --version`

### Paso 2: Instalar PostgreSQL

#### Ubuntu/Debian:
```bash
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

#### Windows:
1. Descargar desde [postgresql.org](https://www.postgresql.org/download/windows/)
2. Instalar con configuración por defecto
3. Recordar la contraseña del usuario `postgres`

### Paso 3: Crear Base de Datos

```bash
# Conectar a PostgreSQL
sudo -u postgres psql

# Crear usuario y base de datos
CREATE USER aparca WITH PASSWORD 'TuPasswordSeguro123!';
CREATE DATABASE aparca_db OWNER aparca;
GRANT ALL PRIVILEGES ON DATABASE aparca_db TO aparca;
\q
```

### Paso 4: Clonar y Configurar Backend

```bash
# Clonar proyecto
git clone https://github.com/yourusername/aparca.git
cd aparca/server

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
nano .env
```

**Configurar `.env` del servidor:**
```env
PORT=3001
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=aparca
DATABASE_PASSWORD=TuPasswordSeguro123!
DATABASE_NAME=aparca_db
JWT_SECRET=TuSecretoSuperSeguro123!
NODE_ENV=production
```

```bash
# Ejecutar migraciones
npm run migration:run

# Crear super admin
npm run seed:admin

# Iniciar servidor
npm run build
npm run start

# O con PM2 (recomendado)
npm install -g pm2
pm2 start dist/index.js --name aparca-api
pm2 save
pm2 startup
```

### Paso 5: Configurar Frontend

```bash
cd ../client

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
nano .env
```

**Configurar `.env` del cliente:**
```env
VITE_API_URL=http://localhost:3001/api
```

```bash
# Build para producción
npm run build

# Servir con servidor estático
npm install -g serve
serve -s dist -l 5173

# O con PM2
pm2 serve dist 5173 --name aparca-client --spa
pm2 save
```

### Paso 6: Configurar Nginx (Opcional pero Recomendado)

```bash
sudo apt install nginx

# Crear configuración
sudo nano /etc/nginx/sites-available/aparca
```

**Contenido del archivo:**
```nginx
server {
    listen 80;
    server_name tu-dominio.com;

    # Frontend
    location / {
        proxy_pass http://localhost:5173;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Activar sitio
sudo ln -s /etc/nginx/sites-available/aparca /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

---

## 🔐 Configuración de SSL (HTTPS)

### Con Certbot (Let's Encrypt - Gratis)

```bash
# Instalar Certbot
sudo apt install certbot python3-certbot-nginx

# Obtener certificado
sudo certbot --nginx -d tu-dominio.com

# Renovación automática
sudo certbot renew --dry-run
```

---

## 📊 Configuración de Backups Automáticos

### Script de Backup (PostgreSQL)

```bash
# Crear script
sudo nano /usr/local/bin/backup-aparca.sh
```

**Contenido:**
```bash
#!/bin/bash
BACKUP_DIR="/var/backups/aparca"
DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p $BACKUP_DIR

# Backup de base de datos
pg_dump -U aparca aparca_db | gzip > $BACKUP_DIR/db_$DATE.sql.gz

# Eliminar backups antiguos (más de 30 días)
find $BACKUP_DIR -name "db_*.sql.gz" -mtime +30 -delete

echo "Backup completado: $DATE"
```

```bash
# Dar permisos
sudo chmod +x /usr/local/bin/backup-aparca.sh

# Programar en crontab (diario a las 2 AM)
sudo crontab -e
# Agregar: 0 2 * * * /usr/local/bin/backup-aparca.sh
```

---

## 🔍 Verificación de Instalación

### Checklist Post-Instalación

- [ ] Backend responde en `/api/health`
- [ ] Frontend carga correctamente
- [ ] Login funciona con credenciales de super admin
- [ ] Base de datos tiene tablas creadas
- [ ] Backups automáticos configurados
- [ ] SSL/HTTPS activo (producción)
- [ ] PM2 configurado para auto-restart
- [ ] Nginx funcionando correctamente
- [ ] Logs accesibles y rotando

### Comandos de Verificación

```bash
# Verificar backend
curl http://localhost:3001/api/health

# Verificar base de datos
psql -U aparca -d aparca_db -c "SELECT COUNT(*) FROM users;"

# Verificar PM2
pm2 list
pm2 logs

# Verificar Nginx
sudo nginx -t
sudo systemctl status nginx

# Verificar disco
df -h

# Verificar memoria
free -h
```

---

## 🆘 Solución de Problemas Comunes

### Error: "Cannot connect to database"

```bash
# Verificar que PostgreSQL esté corriendo
sudo systemctl status postgresql

# Verificar credenciales en .env
cat server/.env | grep DATABASE

# Probar conexión manual
psql -U aparca -d aparca_db -h localhost
```

### Error: "Port 3001 already in use"

```bash
# Encontrar proceso usando el puerto
sudo lsof -i :3001

# Matar proceso
sudo kill -9 <PID>

# O cambiar puerto en .env
```

### Error: "npm install fails"

```bash
# Limpiar cache
npm cache clean --force

# Eliminar node_modules
rm -rf node_modules package-lock.json

# Reinstalar
npm install
```

### Frontend no carga

```bash
# Verificar que VITE_API_URL esté correcto
cat client/.env

# Rebuild
cd client
npm run build

# Verificar permisos
ls -la dist/
```

---

## 📞 Soporte

Si tienes problemas durante la instalación:

- 📧 Email: soporte@aparca.com
- 💬 WhatsApp: +57 300 123 4567
- 📚 Documentación: https://docs.aparca.com

---

## ✅ Próximos Pasos

Después de instalar:

1. [Configuración Inicial](./CONFIGURATION.md)
2. [Manual de Usuario](./USER_MANUAL.md)
3. [Seguridad y Mejores Prácticas](./SECURITY.md)
4. [Monitoreo y Mantenimiento](./MAINTENANCE.md)

---

**¡Felicidades! Aparca está instalado y listo para usar.** 🎉
