# Google OAuth2 Authentication Setup

This guide explains how to set up Google OAuth2 authentication for the Smart Agriculture Management System.

## Backend Configuration

### 1. Database Setup
The backend is configured to use PostgreSQL with the following credentials:
- **Password**: `Nazarboy2005`
- **Database**: Supabase PostgreSQL instance

### 2. Google OAuth2 Configuration
The following Google OAuth2 credentials are already configured:

```properties
# Google OAuth2 Configuration
spring.security.oauth2.client.registration.google.client-id=1077945709935-l5tcsn6el2b1rqh51l229aja2klio170.apps.googleusercontent.com
spring.security.oauth2.client.registration.google.client-secret=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
spring.security.oauth2.client.registration.google.scope=openid,profile,email
spring.security.oauth2.client.registration.google.redirect-uri=http://localhost:3000/auth/callback/google
```

### 3. JWT Configuration
JWT tokens are configured with:
- **Secret**: Configurable via `JWT_SECRET` environment variable
- **Expiration**: 24 hours (86400000 ms)

## Frontend Configuration

### 1. Authentication Flow
1. User clicks "Continue with Google" on login page
2. Redirects to backend OAuth2 endpoint: `http://localhost:9090/oauth2/authorization/google`
3. Google OAuth2 flow completes
4. Backend redirects to frontend with JWT token: `http://localhost:3000/auth/callback?token=JWT_TOKEN&success=true`
5. Frontend stores token and redirects to dashboard

### 2. Protected Routes
All routes except `/login` are protected and require authentication:
- **Dashboard**: `/` - Requires authentication
- **Farmers**: `/farmers` - Requires authentication
- **Recommendations**: `/recommendations` - Requires authentication
- **Alerts**: `/alerts` - Requires authentication
- **Admin**: `/admin` - Requires authentication + ADMIN role

### 3. User Management
- User information is stored in localStorage
- JWT token is automatically included in API requests
- Token refresh is handled automatically
- Logout clears all stored authentication data

## Getting Started

### 1. Start the Backend
```bash
cd agriculture-backend
mvn spring-boot:run
```
Backend will run on `http://localhost:9090`

### 2. Start the Frontend
```bash
cd agriculture-frontend
npm install
npm start
```
Frontend will run on `http://localhost:3000`

### 3. Access the Application
1. Navigate to `http://localhost:3000`
2. You'll be redirected to the login page
3. Click "Continue with Google" to authenticate
4. After successful authentication, you'll be redirected to the dashboard

## Features

### Authentication Features
- ✅ Google OAuth2 integration
- ✅ JWT token-based authentication
- ✅ Automatic token refresh
- ✅ Protected routes
- ✅ Role-based access control (USER/ADMIN)
- ✅ User profile management
- ✅ Secure logout

### Security Features
- ✅ CORS configuration for cross-origin requests
- ✅ JWT token validation
- ✅ Automatic token expiration handling
- ✅ Secure HTTP-only cookie support (configurable)
- ✅ CSRF protection disabled for API endpoints

## API Endpoints

### Authentication Endpoints
- `GET /v1/auth/me` - Get current user information
- `POST /v1/auth/refresh` - Refresh JWT token
- `POST /v1/auth/logout` - Logout user
- `GET /v1/auth/login/google` - Get Google OAuth2 login URL

### OAuth2 Endpoints
- `GET /oauth2/authorization/google` - Initiate Google OAuth2 flow
- `GET /login/oauth2/code/google` - OAuth2 callback (handled by Spring Security)

## User Roles

### USER Role
- Access to dashboard, farmers, recommendations, and alerts
- Cannot access admin panel

### ADMIN Role
- All USER permissions
- Access to admin panel with system metrics and analytics
- Data export capabilities

## Troubleshooting

### Common Issues

1. **CORS Errors**
   - Ensure backend CORS configuration includes frontend URL
   - Check that both servers are running on correct ports

2. **Token Expiration**
   - Tokens expire after 24 hours
   - Automatic refresh is handled by the frontend
   - Manual refresh available via API

3. **Google OAuth2 Issues**
   - Verify Google OAuth2 credentials are correct
   - Check redirect URI configuration
   - Ensure Google Cloud Console project is properly configured

4. **Database Connection**
   - Verify database password is correct: `Nazarboy2005`
   - Check Supabase connection settings
   - Ensure database is accessible

### Development Mode
For development, you can use the "Demo Login" button which creates a mock authentication token for testing purposes.

## Production Deployment

### Environment Variables
Set the following environment variables for production:

```bash
# Database
DB_PASSWORD=your-production-password

# JWT
JWT_SECRET=your-secure-jwt-secret

# Google OAuth2
GOOGLE_CLIENT_ID=your-production-client-id
GOOGLE_CLIENT_SECRET=your-production-client-secret
GOOGLE_REDIRECT_URI=https://yourdomain.com/auth/callback/google
```

### Security Considerations
- Use strong JWT secrets in production
- Configure proper CORS origins
- Use HTTPS in production
- Regularly rotate OAuth2 credentials
- Monitor authentication logs

## Support

For issues or questions regarding authentication setup, please check:
1. Backend logs for authentication errors
2. Browser console for frontend errors
3. Network tab for API request/response details
4. Google Cloud Console for OAuth2 configuration
