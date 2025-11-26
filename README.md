# Matching Algorithm — Frontend + Backend

Una aplicación full-stack para recomendar compañeros de juego en reservas de canchas basada en preferencias y historial de partidos. Frontend en React (Vite) y backend en Flask.

## Descripción larga

Este repositorio contiene el frontend y el backend de un sistema de emparejamiento (matching) pensado para plataformas de reserva de canchas deportivas. El objetivo es recomendar a un usuario los mejores candidatos con quienes jugar una reserva, considerando tanto las preferencias (días, horarios, canchas, categoría) como el historial de partidos entre usuarios.

Componentes principales:
- Backend (carpeta `back/`): API REST desarrollada con Flask. Expone rutas para usuarios, preferencias, datos estáticos y reservas. Incluye un seeder para poblar datos de ejemplo.
- Frontend (carpeta `front/`): aplicación en React + Vite que ofrece una interfaz para gestionar usuarios, ver teoría del algoritmo, y reservar canchas.

Algoritmo de emparejamiento (resumen):

- Para cada par de usuarios (i, j) se calcula un puntaje A(i, j) = α × S(i, j) + β × J(i, j).
   - S(i, j): similitud de preferencias (normalizada entre 0 y 1), basada en una distancia euclidiana sobre dimensiones como días, horarios, canchas y categoría.
   - J(i, j): factor basado en el historial de partidos, J(i, j) = g(i, j) / g(i) donde g(i, j) son los partidos entre i y j, y g(i) el total de partidos de i.
   - α y β son pesos con α + β = 1. Inicialmente pueden tomarse igualitarios (α = β = 0.5), pero se propone un ajuste automático mediante optimización (minimizar error cuadrático medio sobre datos reales de elecciones) usando un simple paso de gradiente para actualizar β (y α = 1 − β).

Con esto se pueden generar rankings (top-x) por usuario o matrices de calor que visualicen la afinidad entre usuarios.


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



