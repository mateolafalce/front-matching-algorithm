# Frontend of a Matching Algorithm

## Installation Options

### Option 1: Using Docker Compose (Recommended)

1. Clone the repository and navigate to the project folder:

```bash
git clone https://github.com/mateolafalce/front-matching-algorithm.git && cd front-matching-algorithm
```

2. Create a `.env` file in the root directory with your environment variables:

```bash
cp .env.example .env
# Edit .env with your configuration
```

3. Build and start the services:

```bash
docker-compose up --build
```

4. Access the application:
   - Frontend: http://localhost:5173
   - Backend: http://localhost:5000

5. To stop the services:

```bash
docker-compose down
```

**Additional Docker Commands:**

```bash
# Run in detached mode (background)
docker-compose up -d

# View logs
docker-compose logs -f

# Rebuild services
docker-compose build

# Stop and remove containers, networks
docker-compose down -v
```

### Option 2: Installation From Source

#### Backend

1. Clone the repository and navigate to the project folder:

```bash
git clone <repository-url> && cd front-matching-algorithm
```

2. Create and activate a virtual environment:

```bash
python3 -m venv venv && source venv/bin/activate
```

3. Install the dependencies:

```bash
pip install -r requirements.txt
```

4. Start the Flask application:

```bash
python app.py
```

#### Frontend

```bash
cd front
```

```bash
npm install && npm run dev
```