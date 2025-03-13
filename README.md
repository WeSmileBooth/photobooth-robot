# WeSmile Photobooth

A Vue.js based photobooth application with real-time WebSocket communication between devices using ngrok for tunneling.

## Features

- QR code generation for mobile device connections
- WebSocket communication for real-time updates
- Responsive UI for various display sizes
- Camera integration for capturing photos
- Firebase integration for storage and authentication
- Docker support for easy deployment

## Prerequisites

- [Node.js](https://nodejs.org/) (v18 or later)
- [Docker](https://www.docker.com/) and [Docker Compose](https://docs.docker.com/compose/) (for containerized deployment)
- Firebase project with storage enabled
- Ngrok account for tunneling

## Project Structure

```
photobooth-robot/
├── dist/                 # Built application (created during build)
├── public/               # Static assets
├── src/                  # Source files
│   ├── components/       # Vue components
│   │   └── displays/     # Display components for different states
│   ├── services/         # Service modules
│   ├── stores/           # Pinia stores
│   └── App.vue           # Main application component
├── .env                  # Environment variables (create from .env.example)
├── docker-compose.yml    # Docker Compose configuration
├── Dockerfile            # Docker build instructions
├── package.json          # Project dependencies
├── server.js             # Express server with WebSocket
└── vite.config.js        # Vite configuration
```

## Environment Variables

Create a `.env` file in the project root (see `.env.example` for a template). The following variables are required:

| Variable                            | Description                                                             |
| ----------------------------------- | ----------------------------------------------------------------------- |
| `VITE_FIREBASE_API_KEY`             | Firebase API key for authentication                                     |
| `VITE_FIREBASE_AUTH_DOMAIN`         | Firebase authentication domain                                          |
| `VITE_FIREBASE_PROJECT_ID`          | Firebase project ID                                                     |
| `VITE_FIREBASE_STORAGE_BUCKET`      | Firebase storage bucket URL                                             |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Firebase messaging sender ID                                            |
| `VITE_FIREBASE_APP_ID`              | Firebase application ID                                                 |
| `VITE_FIREBASE_MEASUREMENT_ID`      | Firebase measurement ID for analytics                                   |
| `VITE_MOBILE_APP_URL`               | URL of the mobile application                                           |
| `VITE_SERVER_URL`                   | URL of the server (typically http://0.0.0.0:5040 for local development) |
| `VITE_API`                          | API endpoint URL for backend services                                   |
| `NGROK_AUTHTOKEN`                   | Your ngrok authentication token for tunneling                           |

## Development Setup

### Local Development

1. Clone the repository:

   ```bash
   git clone https://github.com/your-username/photobooth-robot.git
   cd photobooth-robot
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Create a `.env` file with your configuration (use `.env.example` as a template).

4. Start the development server:

   ```bash
   npm run dev
   ```

5. In a separate terminal, start the Express server:

   ```bash
   node server.js
   ```

6. Open your browser to the URL shown in the terminal (typically http://localhost:5173).

### Building for Production

To build the application for production:

```bash
npm run build
```

This will create a `dist` directory with the compiled application.

## Docker Deployment

### Build and Run with Docker Compose

1. Build the Docker image:

   ```bash
   docker-compose build
   ```

2. Start the container:

   ```bash
   docker-compose up -d
   ```

3. Access the application at http://localhost:5040

### Docker Management Commands

- View logs:

  ```bash
  docker-compose logs -f
  ```

- Stop containers:

  ```bash
  docker-compose down
  ```

- Rebuild without cache:
  ```bash
  docker-compose build --no-cache
  ```

## Accessing the Application

- The main photobooth application is accessible at http://localhost:5040 (when running with Docker)
- The WebSocket server is available at the same address
- The QR code in the application will allow mobile devices to connect to the photobooth

## Troubleshooting

### Common Issues

- **CORS Errors**: Make sure the Express server has CORS enabled
- **WebSocket Connection Failures**: Check ngrok tunnel status and authentication
- **Camera Access Denied**: Ensure your app is running in a secure context (HTTPS or localhost)
- **Missing Environment Variables**: Verify all required variables are in the `.env` file

### Docker Specific Issues

- **Container Won't Start**: Check logs with `docker-compose logs`
- **Port Conflicts**: Change the external port in docker-compose.yml if port 5040 is in use
- **Build Failures**: Try rebuilding without cache using `docker-compose build --no-cache`

## License

[MIT License](LICENSE)

## Acknowledgements

- Vue.js team for the amazing framework
- ngrok for simplifying tunneling
- Firebase for backend services
