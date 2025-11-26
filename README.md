# Matching Algorithm - Frontend + Backend

Una aplicación full-stack para recomendar compañeros de juego en reservas de canchas basada en preferencias y historial de partidos. Frontend en React (Vite) y backend en Flask. Este repositorio contiene el frontend y el backend de un sistema de emparejamiento (matching) pensado para plataformas de reserva de canchas deportivas. El objetivo es recomendar a un usuario los mejores candidatos con quienes jugar una reserva, considerando tanto las preferencias (días, horarios, canchas, categoría) como el historial de partidos entre usuarios. Con esto se pueden generar rankings (top-x) por usuario o matrices de calor que visualicen la afinidad entre usuarios.

### Usar Docker Compose

1. Clona el repositorio y posicionate en la carpeta del proyecto:

```bash
git clone https://github.com/mateolafalce/front-matching-algorithm.git && cd front-matching-algorithm
```

2. Crea un archivo `.env` en la raíz (puedes partir de `.env.example` si existe):

```bash
cp .env.example .env
# Edita .env con la configuración necesaria
```

3. Levanta los servicios con Docker Compose:

```bash
docker-compose up --build
```

4. Accede a la aplicación:
   - Frontend: http://localhost:5173
   - Backend: http://localhost:5000

5. Para detener los servicios:

```bash
docker-compose down
```

Comandos útiles adicionales:

```bash
# Ejecutar en segundo plano
docker-compose up -d

# Ver logs
docker-compose logs -f

# Reconstruir servicios
docker-compose build

# Parar y eliminar contenedores, volúmenes
docker-compose down -v
```

### Desde la maquina

#### Backend

1. Crea y activa un entorno virtual en la raíz del proyecto:

```bash
python3 -m venv venv && source venv/bin/activate
```

2. Instala dependencias:

```bash
pip install -r back/requirements.txt
```

3. Ejecuta el backend (desde `back/`):

```bash
cd back
python app.py
```

#### Frontend

1. Instala dependencias y ejecuta el dev server:

```bash
cd front
npm install
npm run dev
```



