
## API Endpoints

All API endpoints are prefixed with `/api`.

### Authentication

| Method | Endpoint             | Description           |
| :----- | :------------------- | :-------------------- |
| `POST` | `/api/auth/register` | Register a new user   |
| `POST` | `/api/auth/login`    | Log in a user         |

### Tables

| Method | Endpoint            | Description           |
| :----- | :------------------ | :-------------------- |
| `POST` | `/api/tables/check` | Check available tables |

### Reservations

| Method | Endpoint            | Description           |
| :----- | :------------------ | :-------------------- |
| `POST` | `/api/reservations` | Create a new reservation |
| `GET`  | `/api/reservations` | Get all reservations  |