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

The UI communicates with the Spring Boot backend (`http://localhost:8080/api/v1`):

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/v1/facilities` | Fetch all community facilities & amenities |
| `POST` | `/api/v1/facilities/reservations` | Reserve a facility with conflict prevention |
| `PATCH` | `/api/v1/facilities/reservations/{id}/status` | Staff/Admin approval or rejection (`APPROVED` / `REJECTED`) |
| `POST` | `/api/v1/visitors` | Pre-register expected guest & issue clearance |
| `PATCH` | `/api/v1/visitors/{id}/check-in` | Security gate check-in with arrival timestamp |
| `POST` | `/api/v1/announcements` | Broadcast notice targeted by role |
| `GET` | `/api/v1/announcements?role={role}` | Fetch announcements targeted to active caller role |

*Group 4 feature APIs retain their existing demo fallbacks. Authentication and Group 2 operations require the live gateway/services and surface failures without generating mock credentials or synthetic property/lease records.*

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


## Group 2 integration

The shared frontend now follows the current property-unit and lease-occupancy feature-branch contracts.

- Configure `VITE_API_BASE_URL` to the gateway base URL, default `http://localhost:8080/api/v1`.
- API permissions come from the signed-in JWT's `roles` claim. Demo personas do not grant API access.
- Units use UUID `unitId`, numeric `ownershipUnitId`, `floorId`, `unitTypeId`, `unitNumber`, and `status`.
- Unit creation sends `{ floorId, unitTypeId, unitNumber }`. The form selects a persisted floor from the building response.
- Inventory is grouped by floor ID. Building responses expose the floor-to-building association.
- Unit status is informational. The lease service changes availability; there is no public manual status endpoint.
- Ownership lookup/assignment retains numeric unit references; the unit detail displays its `ownershipUnitId`.
- Managers can page/filter leases, inspect status history, register the tenant's physical move-in under an active lease, and record move-out.
- Residents/Tenants view their own occupancy history and retrieve a lease by its UUID. Owners retrieve their owned unit's lease history by unit UUID.
- Building reads require `ADMIN` or `TENANT`; creation requires `ADMIN` or `PROPERTY_MANAGER`. Property managers can access creation without issuing a forbidden directory request.

### Verification

```sh
npm ci
npm run test:group2
npm run build
```

The Group 2 checks use mocked HTTP responses to verify payloads, paths, UUID rendering, pagination and role behavior. They do not replace authenticated integration tests against the running gateway and services.

### Gateway/backend prerequisites

The Gateway routes and downstream port defaults for Group 2 are configured locally. Full live integration still requires real JWT keys, a running Gateway, and confirmed Group 1 validation endpoints and roles. Group 3/4 workflows need their agreed contracts.
