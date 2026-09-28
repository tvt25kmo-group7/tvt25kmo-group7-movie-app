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

Create a file named `Backend/.env`. Add the following variables and replace
the example values with your own:

```dotenv
DB_NAME=moviedb
DB_USER=your_database_user
DB_PASSWORD=your_database_password
TMDB_API_TOKEN=your_tmdb_api_token
JWT_SECRET_KEY=your_first_random_secret
JWT_REFRESH_SECRET=your_second_random_secret
```

**Generate the two JWT secrets separately.** Run this command in a terminal:

```bash
node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"
```

Copy its output into `JWT_SECRET_KEY`. Run the **same command again** and copy
the new output into `JWT_REFRESH_SECRET`. The two values must be different.

These are signing secrets, not user tokens. The backend creates access and
refresh tokens automatically when a user logs in. Never commit `Backend/.env`
or share the secrets.

Start the application from the project root:

```bash
docker compose --env-file Backend/.env up -d --build
```

The local services are available at:

- Frontend: http://localhost:5173
- Backend: http://localhost:5000
- PostgreSQL: localhost:5433

**Existing database:** If your `users` table was created before refresh tokens
were introduced, run the following SQL statement against that database:

```sql
ALTER TABLE users
ADD COLUMN IF NOT EXISTS refresh_token TEXT;
```

The updated `Backend/schema.sql` contains this column for databases created
using the new schema. Do not delete an existing database to add the column.

PostgreSQL data is stored in the Docker volume `postgres_movie_data`.
Rebuilding application containers does not delete that data. Do not remove
the volume unless you intentionally want to delete the database.

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
| `TMDB_API_TOKEN` | TMDB api password |

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



The deployment removes and rebuilds only the backend and frontend containers. The `movie-db` container and its `postgres_movie_data` volume are kept so existing database data remains available.


## Git Branching Model

- Create a short-lived branch for each Jira item.
- Name branches using the Jira key, for example `SCRUM-42`.
- Each task branch must contain changes for only one Jira item.
- Create task branches from the latest `integration` branch.
- Rebase task branches onto the latest `integration` branch before merging.
- Use squash merge for pull requests.
- Pull requests into `integration` do not require approval, but automated checks must pass.
- Delete task branches after merging.
- Protect `main` from direct pushes.
- Code must be reviewed and tested before merging `integration` into `main`.
- Automated checks must pass before merging into `main`.