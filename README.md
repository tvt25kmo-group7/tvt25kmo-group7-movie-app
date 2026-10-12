# TVT25KMO Group 7 Movie App

Movie App is a full-stack web application for discovering movies and TV shows, managing favorites, publishing reviews and sharing media with movie groups.

Movie and TV show information is retrieved from TMDB. User accounts, favorites, reviews, groups and memberships are stored in PostgreSQL.

This application was developed as a group project by second-year Information and Communications Technology students from Group 7 (TVT25KMO) at Oulu University of Applied Sciences.

## How the Application Works

Visitors can browse currently playing movies, search for movies and TV shows, view media details, read reviews and browse available groups without creating an account.

Registered users can save favorites, publish reviews, share their favorite lists, create groups and request membership in existing groups. Accepted group members can view and share movies and TV shows within their groups.

Group owners can manage membership requests, remove members and delete their groups.

## Features

### Public Features

- Browse currently playing movies
- Search for movies and TV shows
- Filter and load additional search results
- View movie and TV show details
- Read reviews
- Browse available groups
- Open shared favorite lists
- Switch between light and dark themes

### Authenticated User Features

- Register and log in
- Restore the session using a refresh token
- View and manage favorites
- Create a shareable favorites link
- Publish movie and TV show reviews
- Create groups
- Request group membership
- View accepted group content
- Leave a group
- Share movies and TV shows with a group
- View profile information
- Delete the user account

### Group Owner Features

- View pending membership requests
- Approve or reject membership requests
- View current group members
- Remove members
- Delete the group

## Screenshots

### Search

![Movie and TV show search](Presentation/assets/screenshots/search.webp)

### Movie and TV Show Details

![Movie details](Presentation/assets/screenshots/details.webp)

### Group Page

![Group page](Presentation/assets/screenshots/group.webp)

Additional screenshots are available in the `Presentation/assets/screenshots/` directory.

## Design and Presentation

The original user interface was designed in Figma and adapted during implementation as the application features developed.

### Original UI Design

![Original Figma UI design](Presentation/assets/screenshots/figma-design.webp)

The project presentation is located in the `Presentation/` directory.

Start the presentation from the project root:

```bash
npx --yes serve Presentation -l 8080
```

Open [http://localhost:8080](http://localhost:8080).

Stop the presentation server with `Ctrl+C`.

Additional instructions are available in [Presentation/README.md](Presentation/README.md).

## Technology Stack

| Area | Technology |
| --- | --- |
| Frontend | React and Vite |
| Backend | Node.js HTTP server |
| Database | PostgreSQL |
| Authentication | JWT, refresh tokens and bcrypt |
| External data | TMDB API |
| Containers | Docker and Docker Compose |
| Testing | Jest and Supertest |
| CI/CD | GitHub Actions |
| UI design | Figma |

## Architecture

```text
React frontend
    |
    | HTTP / JSON
    v
Node.js backend
    |
    +---- PostgreSQL
    |
    +---- TMDB API
```

The frontend communicates with the backend through `/api` routes. TMDB requests are handled by the backend, so the TMDB API token is not exposed to the browser.

The backend follows a routes, services and models structure:

- routes handle URLs, HTTP methods, authentication and responses
- services contain validation and business logic
- models execute parameterized PostgreSQL queries

## Database Model

The application data is stored in PostgreSQL. The database model connects users with favorites, reviews, groups, group memberships and media shared with groups.

![Database ER diagram](Presentation/assets/screenshots/er-diagram.png)

The main database entities are:

- users
- favorites
- reviews
- groups
- group memberships
- group media

## Project Structure

```text
.
├── Backend/
│   ├── auth/
│   ├── helpers/
│   ├── migrations/
│   ├── models/
│   ├── routes/
│   ├── services/
│   ├── tests/
│   ├── app.js
│   └── schema.sql
├── Frontend/
│   └── src/
│       ├── components/
│       ├── context/
│       ├── pages/
│       ├── app.jsx
│       └── styles.css
├── Presentation/
├── .github/workflows/
└── docker-compose.yml
```

## Authentication

The application uses JWT access tokens and refresh tokens.

Access tokens are used to authenticate protected requests. Refresh tokens are stored in HttpOnly cookies and allow the frontend to restore an authenticated session.

Passwords are hashed with bcrypt before they are stored in the database.

Protected backend routes verify the authenticated user and enforce group membership and ownership permissions.

## Testing

The backend test suite uses Jest and Supertest.

Automated tests cover areas including:

- registration
- login and logout
- invalid credentials
- authentication errors
- user account deletion
- review creation and retrieval
- duplicate reviews
- request validation

Important application flows have also been verified manually through the user interface.

## Design and Presentation

The original user interface was designed in Figma and adapted during implementation as the application features developed.

The project presentation and additional screenshots are located in the `Presentation/` directory.

## Project Team

| Name | Role |
| --- | --- |
| Marianna Taavitsainen | Product Owner and Developer |
| Jani Rekinen | Scrum Master and Developer |
| Emil Koivunen | Developer |
| Joona Louhisalmi | Developer |

The developers shared responsibility for application design, implementation, testing, integration and documentation.