# AMS Community Service Frontend UI / UX

Frontend module for the **Community Service (Group 4)** domain of the **Apartment Management System (AMS)**.

Built in strict adherence to:
- [`AMS_REACT_PROJECT_STANDARDS.md`](../AMS_REACT_PROJECT_STANDARDS.md)
- [`AMS_UI_DESIGN_SYSTEM.md`](../AMS_UI_DESIGN_SYSTEM.md) — Option 1: Professional / Corporate

---

## 🎨 Visual Design System (Corporate / Professional)

The UI uses the approved **Option 1 — Professional / Corporate** color tokens:
- **Primary Navy (`#1E3A5F`)**: Main brand anchor, sidebar navigation, major headings, and identity.
- **Secondary Slate (`#4E6D8A`)**: Supporting controls, secondary text, metadata, and visual hierarchy.
- **Accent Teal (`#2F8B8B`)**: Action buttons, active navigation indicators, links, and highlights.
- **Background Light Gray (`#F5F7FA`)**: Main application canvas and spacious card surroundings.
- **Text Charcoal (`#1F2937`)**: High-contrast, accessible typography.
- **Surface White (`#FFFFFF`)**: Crisp, elevated card surfaces and data tables.
- **Semantic Status Indicators**: Distinguishable badges for `Approved` (green), `Pending` (amber), `Rejected` (red), and `Expected` (blue).

---

## 🏗️ Architecture & Standards Compliance

```text
src/
├── app/
│   ├── store/             # Redux Toolkit store, typed hooks, root reducer
│   ├── router/            # Centralized AppRouter, ProtectedRoute, routeConfig
│   └── App.tsx            # Redux Provider and Router entry
│
├── components/
│   ├── ui/                # Shared generic UI components (no business logic)
│   │   ├── Button/
│   │   ├── Input/
│   │   ├── Select/
│   │   ├── Modal/
│   │   ├── Table/
│   │   ├── Card/
│   │   ├── Badge/
│   │   ├── Spinner/
│   │   └── EmptyState/
│   ├── layout/            # Shared structural layout components
│   │   ├── AppLayout/
│   │   ├── Sidebar/
│   │   ├── Header/
│   │   └── PageContainer/
│   └── feedback/          # Shared feedback components
│       ├── Alert/
│       ├── ErrorMessage/
│       └── LoadingState/
│
├── features/              # Domain-driven feature modules
│   ├── auth/              # Active persona / role session management
│   ├── dashboard/         # KPI statistics, quick actions, activity timeline
│   ├── facilities/        # Directory, bookings ledger, approvals & conflict check
│   ├── visitors/          # Pre-registration, security check-in, digital QR passes
│   └── announcements/     # Role-targeted circulars and publishing modal
│
├── services/
│   ├── api/               # Centralized Axios client & mock fallback simulator
│   └── storage/           # Token and session storage
│
├── constants/
│   ├── routes.ts          # Centralized route constants
│   └── roles.ts           # Role definitions & preset users
│
└── styles/
    ├── tokens.css         # CSS design tokens matching AMS UI Design System
    └── globals.css        # Clean CSS reset, Google Fonts typography, utilities
```

---

## ⚡ Backend Endpoints Supported

The UI communicates with the Spring Boot backend (`http://localhost:8085/api/v1`):

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/v1/facilities` | Fetch all community facilities & amenities |
| `POST` | `/api/v1/facilities/reservations` | Reserve a facility with conflict prevention |
| `PATCH` | `/api/v1/facilities/reservations/{id}/status` | Staff/Admin approval or rejection (`APPROVED` / `REJECTED`) |
| `POST` | `/api/v1/visitors` | Pre-register expected guest & issue clearance |
| `PATCH` | `/api/v1/visitors/{id}/check-in` | Security gate check-in with arrival timestamp |
| `POST` | `/api/v1/announcements` | Broadcast notice targeted by role |
| `GET` | `/api/v1/announcements?role={role}` | Fetch announcements targeted to active caller role |

*Note: The frontend includes a seamless Fallback Simulator / Demo mode. When the local backend or database is offline, the app operates smoothly with pre-loaded mock data and in-memory updates, and will connect to the live backend once started on port 8085.*

---

## 🚀 Running the Application

From the `community-service-ui` directory:

```bash
# Install dependencies
npm install

# Start development server (runs on port 3000)
npm run dev

# Build for production
npm run build
```
