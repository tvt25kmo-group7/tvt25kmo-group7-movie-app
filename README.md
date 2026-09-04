# TVT25KMO Group 7 Movie App

## Setup instructions

### Requirements

- Docker Desktop for local development
- Git
- An Ubuntu VM with Docker and Git installed for deployment

### Local setup

Clone the repository and enter the project directory:

```bash
git clone https://github.com/tvt25kmo-group7/tvt25kmo-group7-movie-app.git
cd tvt25kmo-group7-movie-app
```

Set the database variables before starting Docker Compose:

```bash
export DB_NAME=<your_database_name>
export DB_USER=<your_database_user>
export DB_PASSWORD=<your_database_password>
docker compose up -d --build
```

On PowerShell, use:

```powershell
$env:DB_NAME = "<your_database_name>"
$env:DB_USER = "<your_database_user>"
$env:DB_PASSWORD = "<your_database_password>"
docker compose up -d --build
```

The local services are available at:

- Frontend: http://localhost:5173
- Backend: http://localhost:5000
- PostgreSQL: localhost:5432

PostgreSQL data is stored in the Docker volume `postgres_movie_data`. Rebuilding or recreating the application containers does not delete the database. Do not remove this volume unless you intentionally want to delete the database.

### GitHub Actions deployment

The workflow in `.github/workflows/deploy.yml` runs only after a push to `main`.

In GitHub, open **Settings > Secrets and variables > Actions > New repository secret** and add:

| Name | Value |
| --- | --- |
| `SERVER_HOST` | The Ubuntu VM public IP address |
| `SSH_PRIVATE_KEY` | The private SSH key for the `ubuntu` user |
| `DB_NAME` | Your database name |
| `DB_USER` | Your database username |
| `DB_PASSWORD` | The PostgreSQL password |

Keep the database password in **Secrets**, not ordinary Variables. The workflow passes these values to the VM without storing them in the source code.

The VM must allow inbound TCP traffic for:

- `22` for SSH deployment
- `5173` for the frontend
- `5000` for the backend, if it must be accessed externally
- `5432` only if PostgreSQL must be accessed externally; otherwise keep it closed

After a merge or push to `main`, check the workflow in the repository's **Actions** tab. The deployed frontend address is:

```text
http://<VM_PUBLIC_IP>:5173
```

### Useful VM commands

```bash
docker ps
docker logs movie-db
docker logs movie-backend
docker logs movie-frontend
docker volume inspect postgres_movie_data
```

The deployment removes and rebuilds only the backend and frontend containers. The `movie-db` container and its `postgres_movie_data` volume are kept so existing database data remains available.