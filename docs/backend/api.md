
## API Endpoints

### Users
- `GET /api/users` - Get all users
- `GET /api/users/:username` - Get specific user
- `POST /api/users` - Create new user
- `PUT /api/users/:username` - Update user
- `PATCH /api/users/:username/health` - Update pet health
- `DELETE /api/users/:username` - Delete user

### Chores
- `GET /api/chores` - Get all chores
- `GET /api/chores/:id` - Get specific chore
- `POST /api/chores` - Create new chore
- `PUT /api/chores/:id` - Update chore
- `PATCH /api/chores/:id/complete` - Mark chore progress
- `PATCH /api/chores/:id/reset` - Reset chore progress
- `DELETE /api/chores/:id` - Delete chore

### Health Check
- `GET /api/health` - Server status check
