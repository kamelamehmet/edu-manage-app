# Run the project

This repository contains two services:

- backend: a PocketBase binary located in `backend/pocketbase`
- frontend: a Vite React app in `frontend/`

To run both at once from the project root (requires Node & npm):

```bash
cd /home/kamelamehmet/edu-manage-app
npm install
npm run start
```

This uses the root `start` script which runs the backend and frontend in parallel using `concurrently`.

If you prefer to run them separately:

Backend (terminal 1):
```bash
cd backend
./pocketbase serve
```

Frontend (terminal 2):
```bash
cd frontend
npm install
npm run dev
```

If the backend pocketbase binary is not executable, make it so with:
```bash
chmod +x backend/pocketbase
```
