# Smart Agriculture Management System - Frontend

A modern, responsive web application for managing agricultural operations with AI-powered irrigation recommendations.

## Features

- **Farmer Management**: Complete CRUD operations for farmer profiles
- **Smart Recommendations**: AI-powered irrigation recommendations based on weather data
- **Alert System**: SMS notifications and alert management
- **Admin Dashboard**: Comprehensive analytics and system monitoring
- **Responsive Design**: Optimized for mobile, tablet, and desktop devices

## Technology Stack

- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **React Query** for data fetching and caching
- **React Router** for navigation
- **React Hook Form** for form management
- **Lucide React** for icons
- **Axios** for API communication

## Getting Started

### Prerequisites

- Node.js 16+ 
- npm or yarn
- Backend API running on port 9090

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm start
```

3. Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

### Building for Production

```bash
npm run build
```

This builds the app for production to the `build` folder.

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/            # Basic UI components (Button, Card, etc.)
│   └── Layout.tsx     # Main layout component
├── pages/             # Page components
│   ├── Dashboard.tsx
│   ├── Farmers.tsx
│   ├── FarmerDetails.tsx
│   ├── Recommendations.tsx
│   ├── Alerts.tsx
│   ├── Admin.tsx
│   └── NotFound.tsx
├── services/          # API service layer
│   └── api.ts
├── types/             # TypeScript type definitions
│   └── index.ts
├── utils/             # Utility functions
│   ├── cn.ts         # Class name utility
│   └── format.ts     # Formatting utilities
├── App.tsx            # Main app component
└── index.tsx         # App entry point
```

## API Integration

The frontend integrates with the backend API running on port 9090. Key endpoints include:

- **Farmers**: `/v1/farmers`
- **Recommendations**: `/v1/recommendations`
- **Alerts**: `/v1/alerts`
- **Admin**: `/v1/admin`

## Features Overview

### Dashboard
- System overview with key metrics
- Weather information for different farms
- Recent alerts and recommendations
- Quick action buttons

### Farmer Management
- List all registered farmers
- Add new farmers with location and crop information
- Edit farmer details
- View individual farmer profiles
- Filter and search functionality

### Recommendations
- AI-powered irrigation recommendations
- Weather-based suggestions
- Water savings tracking
- Recommendation history

### Alert System
- SMS notification management
- Alert status tracking
- Test alert functionality
- Bulk alert operations

### Admin Dashboard
- System metrics and analytics
- Water savings reports
- Location and crop distribution
- Data export functionality
- System health monitoring

## Responsive Design

The application is built with a mobile-first approach:

- **Mobile**: Single column layout with collapsible navigation
- **Tablet**: Two-column layout with sidebar navigation
- **Desktop**: Full layout with persistent sidebar

## Styling

The application uses Tailwind CSS with a custom design system:

- **Primary Colors**: Blue theme for main actions
- **Secondary Colors**: Gray scale for text and backgrounds
- **Status Colors**: Green (success), Yellow (warning), Red (error)
- **Typography**: Inter font family
- **Spacing**: Consistent spacing scale
- **Components**: Reusable component library

## Development

### Available Scripts

- `npm start` - Start development server
- `npm test` - Run tests
- `npm run build` - Build for production
- `npm run eject` - Eject from Create React App

### Code Style

- TypeScript for type safety
- ESLint for code quality
- Prettier for code formatting
- Component-based architecture
- Custom hooks for reusable logic

## Deployment

The application can be deployed to any static hosting service:

- **Vercel**: Connect your GitHub repository
- **Netlify**: Drag and drop the build folder
- **AWS S3**: Upload build files to S3 bucket
- **GitHub Pages**: Deploy from GitHub Actions

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.
