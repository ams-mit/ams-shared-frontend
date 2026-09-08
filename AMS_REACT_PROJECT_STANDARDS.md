# AMS React Frontend — Project Structure & Coding Standards

## Purpose

This document defines the required frontend engineering practices for the Apartment Management System (AMS).

The goal is to keep the React + TypeScript application maintainable as four teams contribute feature modules to the same shared frontend repository.

The application must be treated as **one product**, not as four separate frontend projects.

The assignment requires one shared React application using TypeScript and Redux, with teams owning feature modules inside the shared codebase and following a consistent component library/design system.

---

# 1. Core Principles

The frontend must follow these principles:

1. **Use reusable components.**
2. **Organize code by feature/domain, not by dumping everything into one folder.**
3. **Keep components small and focused.**
4. **Separate UI, business logic, API communication, and state management.**
5. **Avoid duplicated code.**
6. **Keep shared components genuinely shared.**
7. **Use TypeScript properly; avoid `any` unless there is a documented reason.**
8. **Keep API calls out of presentation components where practical.**
9. **Keep feature modules independent and clearly owned.**
10. **Do not introduce a different architecture or coding style for each team.**
11. **Follow the shared AMS design system.**
12. **Prefer simple solutions over unnecessary abstractions.**

---

# 2. Recommended Project Structure

Use a feature-oriented structure similar to:

```text
src/
│
├── app/
│   ├── store/
│   │   ├── index.ts
│   │   ├── hooks.ts
│   │   └── rootReducer.ts
│   │
│   ├── router/
│   │   ├── AppRouter.tsx
│   │   ├── ProtectedRoute.tsx
│   │   └── routeConfig.tsx
│   │
│   └── App.tsx
│
├── assets/
│   ├── images/
│   └── icons/
│
├── components/
│   ├── ui/
│   │   ├── Button/
│   │   ├── Input/
│   │   ├── Select/
│   │   ├── Modal/
│   │   ├── Table/
│   │   ├── Card/
│   │   ├── Badge/
│   │   ├── Spinner/
│   │   └── EmptyState/
│   │
│   ├── layout/
│   │   ├── AppLayout/
│   │   ├── Sidebar/
│   │   ├── Header/
│   │   └── PageContainer/
│   │
│   └── feedback/
│       ├── Alert/
│       ├── ErrorMessage/
│       └── LoadingState/
│
├── features/
│   │
│   ├── auth/
│   │   ├── api/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── store/
│   │   ├── types/
│   │   ├── validation/
│   │   └── index.ts
│   │
│   ├── users/
│   │   ├── api/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── store/
│   │   ├── types/
│   │   └── index.ts
│   │
│   ├── residents/
│   │   ├── api/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── hooks/
│   │   ├── types/
│   │   └── index.ts
│   │
│   ├── owners/
│   │   ├── api/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── hooks/
│   │   ├── types/
│   │   └── index.ts
│   │
│   ├── staff/
│   │   ├── api/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── hooks/
│   │   ├── types/
│   │   └── index.ts
│   │
│   └── dashboard/
│       ├── components/
│       ├── pages/
│       ├── api/
│       └── types/
│
├── services/
│   ├── api/
│   │   ├── client.ts
│   │   ├── interceptors.ts
│   │   └── apiTypes.ts
│   │
│   └── storage/
│       └── tokenStorage.ts
│
├── hooks/
│   ├── useDebounce.ts
│   └── usePagination.ts
│
├── utils/
│   ├── date.ts
│   ├── format.ts
│   └── permissions.ts
│
├── constants/
│   ├── routes.ts
│   └── roles.ts
│
├── styles/
│   ├── globals.css
│   └── tokens.css
│
└── types/
    ├── common.ts
    └── api.ts
```

This is a guideline rather than a requirement that every feature must contain every folder. **Do not create empty folders just to follow the diagram.**

---

# 3. Feature-Based Organization

Feature/domain code should live inside `features/`.

For example:

```text
features/
└── residents/
    ├── api/
    │   └── residentApi.ts
    ├── components/
    │   ├── ResidentForm.tsx
    │   ├── ResidentTable.tsx
    │   └── ResidentStatusBadge.tsx
    ├── pages/
    │   ├── ResidentsPage.tsx
    │   └── ResidentDetailsPage.tsx
    ├── hooks/
    │   └── useResidents.ts
    ├── types/
    │   └── resident.types.ts
    ├── validation/
    │   └── residentValidation.ts
    └── index.ts
```

Do **not** do this:

```text
components/
├── ResidentForm.tsx
├── OwnerForm.tsx
├── StaffForm.tsx
├── ResidentTable.tsx
├── OwnerTable.tsx
├── LoginForm.tsx
├── UserTable.tsx
├── BookingTable.tsx
├── MaintenanceForm.tsx
├── ...
```

That structure becomes difficult to maintain as the application grows.

---

# 4. Shared Components vs Feature Components

There are two different categories of components.

## Shared components

These are generic components that can be reused by multiple features.

Examples:

```text
components/ui/Button
components/ui/Input
components/ui/Modal
components/ui/Table
components/ui/Card
components/ui/Badge
components/ui/Spinner
```

A shared component should not contain apartment-specific business logic.

Good:

```tsx
<Button variant="primary">
  Create Resident
</Button>
```

Bad:

```tsx
<ResidentCreationButton />
```

if the component is simply a styled generic button.

---

## Feature components

These contain domain-specific behaviour.

Examples:

```text
features/residents/components/ResidentForm.tsx
features/residents/components/ResidentTable.tsx
features/auth/components/LoginForm.tsx
```

A feature component may use shared components:

```tsx
<ResidentForm>
  <Input />
  <Select />
  <Button />
</ResidentForm>
```

---

# 5. Component Responsibility

Each component should have one clear responsibility.

Bad:

```text
Dashboard.tsx
 ├── fetches users
 ├── fetches invoices
 ├── calculates arrears
 ├── manages authentication
 ├── renders sidebar
 ├── renders tables
 ├── renders charts
 ├── handles every modal
 └── contains 1000+ lines of JSX
```

Better:

```text
DashboardPage
 ├── DashboardHeader
 ├── OccupancySummary
 ├── BillingSummary
 ├── MaintenanceSummary
 └── RecentRequests
```

The page coordinates the feature; smaller components handle individual UI responsibilities.

---

# 6. Pages vs Components

## Pages

Pages represent route-level screens.

Examples:

```text
ResidentsPage
ResidentDetailsPage
LoginPage
UserManagementPage
DashboardPage
```

Pages should primarily compose components and coordinate the screen.

## Components

Components represent reusable pieces of a screen.

Examples:

```text
ResidentTable
ResidentForm
ResidentStatusBadge
SearchBar
Pagination
```

Do not put an entire application workflow into a single page component.

---

# 7. API Communication

API communication should be separated from UI components.

Avoid:

```tsx
function ResidentsPage() {
  useEffect(() => {
    fetch("http://localhost:8080/api/residents")
      .then(...)
  }, []);

  // hundreds of lines of UI...
}
```

Prefer:

```text
features/residents/api/residentApi.ts
```

and then:

```tsx
const { data, loading, error } = useResidents();
```

The API layer should handle:

- Endpoint paths
- Request parameters
- Request bodies
- Response types
- API-specific error handling
- API client usage

---

# 8. Central API Client

Do not create a new HTTP client in every feature.

Use one shared API client:

```text
services/api/client.ts
```

For example:

```ts
export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
});
```

Authentication handling, common headers, and common interceptors should be centralized where possible.

Feature-specific API functions should remain inside the relevant feature:

```text
features/residents/api/residentApi.ts
features/auth/api/authApi.ts
features/users/api/userApi.ts
```

---

# 9. Redux State Management

The assignment requires Redux.

Use Redux for **shared/application state**, not for every piece of local component state.

Good Redux candidates:

- Authenticated user
- JWT/authentication state
- User roles/permissions
- Global application state
- State that genuinely needs to be shared across multiple areas

Local UI state should normally remain local:

```tsx
const [isModalOpen, setIsModalOpen] = useState(false);
```

Do not put every input field, modal state, or temporary UI flag into Redux.

Recommended structure:

```text
app/store/
    index.ts
    hooks.ts

features/auth/store/
    authSlice.ts

features/users/store/
    userSlice.ts
```

Use typed Redux hooks rather than repeatedly using untyped Redux APIs.

---

# 10. Business Logic

Business logic should not be buried inside JSX.

Bad:

```tsx
{users.filter(u => u.status === "ACTIVE")
  .filter(u => u.role === "TENANT")
  .sort(...)
  .map(...)}
```

For complicated logic, move it into:

- A hook
- A utility
- A selector
- A service
- A feature-specific helper

depending on what the logic actually represents.

Keep JSX focused on presentation.

---

# 11. Custom Hooks

Use custom hooks when logic is reused or when a component would otherwise become difficult to read.

Examples:

```text
useAuth()
useResidents()
usePagination()
useDebounce()
usePermissions()
```

Good:

```tsx
const { user, roles, isAuthenticated } = useAuth();
```

Avoid creating hooks for trivial one-line operations just for the sake of abstraction.

---

# 12. TypeScript Rules

Avoid:

```ts
const data: any = response.data;
```

Prefer:

```ts
interface Resident {
  id: number;
  name: string;
  status: ResidentStatus;
}
```

and:

```ts
const data: Resident[] = response.data;
```

Use shared types for API contracts where appropriate.

Recommended:

```text
features/residents/types/resident.types.ts
```

Do not duplicate the same interface in five components.

---

# 13. Naming Conventions

Use consistent naming.

### Components

PascalCase:

```text
ResidentForm.tsx
UserTable.tsx
PageHeader.tsx
```

### Hooks

camelCase with `use`:

```text
useAuth.ts
useResidents.ts
usePagination.ts
```

### Utilities

camelCase:

```text
formatCurrency.ts
formatDate.ts
validateEmail.ts
```

### Types

Use meaningful names:

```ts
Resident
ResidentStatus
CreateResidentRequest
UpdateResidentRequest
```

Avoid meaningless names:

```ts
Data
Info
Thing
Obj
Stuff
```

---

# 14. File Size

Do not allow components to grow indefinitely.

If a component becomes difficult to understand, split it.

There is no magic line-count limit, but a component containing several unrelated responsibilities or hundreds of lines of JSX is a strong signal that it should be refactored.

Do not split components purely to reduce line count. Split them when they have a meaningful responsibility that can be understood independently.

---

# 15. Avoid Duplicate Components

Before creating a component, check whether an equivalent shared component already exists.

Bad:

```text
features/residents/components/ResidentButton.tsx
features/owners/components/OwnerButton.tsx
features/staff/components/StaffButton.tsx
```

when all three are simply styled buttons.

Use:

```text
components/ui/Button/
```

However, do not force unrelated business components into shared components just because they look visually similar.

---

# 16. Avoid "God Components"

Never create components that do everything.

Warning signs:

- Fetches multiple unrelated APIs
- Contains many unrelated `useState` calls
- Contains large amounts of business logic
- Contains multiple unrelated forms
- Controls multiple unrelated modals
- Contains hundreds of lines of JSX
- Is difficult to test
- Changes frequently because many features depend on it

Refactor into smaller components and feature services/hooks.

---

# 17. Do Not Put Everything in `utils`

This is a common bad architecture:

```text
utils/
├── auth.ts
├── users.ts
├── residents.ts
├── billing.ts
├── maintenance.ts
├── booking.ts
├── api.ts
├── validation.ts
└── everything-else.ts
```

`utils` should contain genuinely generic helpers.

Domain-specific logic belongs inside the relevant feature.

For example:

```text
features/residents/utils/
```

is preferable to putting resident-specific logic into the global `utils/`.

---

# 18. Route Organization

Keep route definitions centralized.

Example:

```text
app/router/
├── AppRouter.tsx
├── ProtectedRoute.tsx
└── routeConfig.tsx
```

Use route constants instead of scattering raw route strings everywhere.

For example:

```ts
export const ROUTES = {
  LOGIN: "/login",
  DASHBOARD: "/dashboard",
  RESIDENTS: "/residents",
  USERS: "/admin/users",
};
```

---

# 19. Authentication and Authorization

Authentication state should be centralized.

The frontend must respect the backend's authorization rules.

Frontend role-based navigation is useful for UX, but **frontend hiding is not a security mechanism**.

For example:

```text
Tenant
 └── UI hides /admin/users

Backend
 └── Still rejects unauthorized request with 403
```

Never assume that hiding a button or route makes an operation secure.

---

# 20. Environment Variables

Do not hard-code environment-specific URLs.

Bad:

```ts
const API_URL = "http://localhost:8080";
```

Prefer:

```text
VITE_API_BASE_URL
```

Example:

```ts
const API_URL = import.meta.env.VITE_API_BASE_URL;
```

Never commit:

- Passwords
- JWT secrets
- API keys
- Access tokens
- Real credentials
- Other secrets

Use `.env.example` for documenting required variables without exposing values.

---

# 21. Error and Loading States

Every API-driven screen should consider:

```text
Loading
Success
Empty
Error
```

Example:

```text
Loading residents...
        ↓
Residents loaded
        ↓
No residents found
        OR
Failed to load residents
```

Do not leave users staring at a blank screen when an API fails.

Use shared components where possible:

```text
LoadingState
ErrorMessage
EmptyState
```

---

# 22. Forms and Validation

Form validation should be consistent.

Do not manually implement different validation rules for the same field in different screens.

For example, email validation should not be different between:

```text
Create User
Create Resident
Edit Profile
```

Use shared validation utilities or the project's chosen form-validation library.

Forms should provide:

- Clear labels
- Validation feedback
- Required-field indication where appropriate
- Disabled/loading state during submission
- Clear success/error feedback

---

# 23. Styling

All features must follow the AMS Design System.

Use the shared color tokens:

```text
Primary:    #1E3A5F
Secondary:  #4E6D8A
Accent:     #2F8B8B
Background: #F5F7FA
Text:       #1F2937
```

Do not create a separate visual theme for each feature or team.

Prefer shared styling primitives/tokens over random values.

Avoid excessive inline styling:

```tsx
<div style={{ color: "#1E3A5F", marginTop: "13px" }}>
```

Prefer reusable classes, design tokens, or the project's established styling approach.

---

# 24. Accessibility

All UI components should consider accessibility.

At minimum:

- Use semantic HTML.
- Use labels for form controls.
- Buttons should be actual `<button>` elements.
- Links should be actual links.
- Images need appropriate `alt` text.
- Keyboard navigation must work.
- Focus states must remain visible.
- Do not rely only on color to communicate status.
- Maintain adequate contrast.

Accessibility should be built into shared components so feature teams do not have to reinvent it.

---

# 25. Imports

Keep imports organized and avoid unnecessary deep relative paths.

Prefer configured aliases if the project supports them:

```ts
import { Button } from "@/components/ui/Button";
```

instead of:

```ts
import { Button } from "../../../../components/ui/Button";
```

Use consistent import ordering according to the project's linting configuration.

---

# 26. Barrel Exports

Use `index.ts` files selectively.

Example:

```text
components/ui/Button/
├── Button.tsx
└── index.ts
```

Then:

```ts
import { Button } from "@/components/ui/Button";
```

Do not create massive global barrel files that export hundreds of unrelated modules if they create circular dependencies or make dependency relationships unclear.

---

# 27. Testing

Components and feature logic should be testable.

Prioritize testing:

- Authentication behaviour
- Permission/role behaviour
- Form validation
- Important business rules
- API error handling
- Critical user workflows
- Reusable components with meaningful behaviour

Do not write tests that merely confirm trivial implementation details.

Tests should focus on observable behaviour.

---

# 28. Git and Team Collaboration

Because multiple teams contribute to the same frontend:

- Do not directly push to the main branch.
- Use feature branches.
- Create pull requests.
- Keep commits focused.
- Do not mix unrelated features in one PR.
- Review shared component changes carefully.
- Do not silently modify shared components in a way that breaks another team.
- Communicate breaking UI/API changes before merging.

Example branch names:

```text
feature/G1-resident-profile
feature/G1-login
feature/G2-unit-management
fix/G1-role-navigation
refactor/shared-table
```

---

# 29. Team Ownership

The four AMS teams own different domains, but the frontend remains one shared application.

The assignment's domain allocation is:

```text
Group 1 → Identity, access, residents, user relationships
Group 2 → Property, units, leases, occupancy
Group 3 → Billing, utilities, payments
Group 4 → Operations, maintenance, facilities, visitors, communications
```

Each team should keep its domain code organized under the appropriate feature modules.

Shared infrastructure such as:

```text
components/
app/
services/
styles/
```

must be treated as shared code.

Changes to shared infrastructure should be reviewed carefully because they can affect every team.

---

# 30. Cross-Team Feature Integration

Do not create separate applications such as:

```text
group1-frontend/
group2-frontend/
group3-frontend/
group4-frontend/
```

The assignment requires one shared React application.

Instead:

```text
shared-frontend/
└── src/
    ├── app/
    ├── components/
    ├── features/
    │   ├── auth/
    │   ├── residents/
    │   ├── property/
    │   ├── billing/
    │   └── operations/
    └── services/
```

The user should experience this as one coherent AMS.

---

# 31. Dependency Direction

Keep dependencies flowing in a predictable direction.

A useful rule:

```text
Pages
  ↓
Feature Components / Hooks
  ↓
Feature API / Services
  ↓
Shared API Client
```

Shared UI components should **not** depend on specific business features.

For example:

```text
Button
  ✗ depends on Resident
  ✗ depends on Billing
  ✗ depends on Maintenance

Button
  ✓ depends only on generic UI concerns
```

This prevents circular dependencies and keeps shared components reusable.

---

# 32. Refactoring Rule

Do not accept bad structure just because "it works."

If a feature works but introduces:

- duplicated components
- duplicated API clients
- huge files
- hard-coded values
- unnecessary `any`
- business logic inside JSX
- feature logic inside global utilities
- inconsistent styling

refactor it before extending the same pattern to other features.

Fix architectural problems early. They become much more expensive once four teams depend on them.

---

# 33. Definition of Done — Frontend

A frontend feature should generally not be considered complete until:

- The feature works against the correct API.
- TypeScript has no unjustified `any` usage.
- Components follow the project structure.
- Reusable UI is extracted where appropriate.
- No unnecessary duplication was introduced.
- Loading, error, and empty states are handled where applicable.
- Validation is implemented where required.
- Role/permission behaviour is respected.
- The AMS design system is followed.
- Responsive behaviour is considered.
- Accessibility basics are satisfied.
- Relevant tests are present.
- No secrets or credentials are committed.
- The code passes the project's lint/build/test checks.
- The feature is reviewed and merged through a pull request.

---

# 34. Quick Decision Guide

Before creating a file, ask:

### "Is this reusable across features?"

If yes:

```text
components/
```

### "Is this specific to one business feature?"

If yes:

```text
features/<feature>/
```

### "Is this application-wide infrastructure?"

If yes:

```text
app/
services/
```

### "Is this a generic helper?"

If yes:

```text
utils/
```

### "Is this domain-specific helper logic?"

Put it inside the relevant feature instead of global `utils/`.

### "Does this component do several unrelated things?"

Split it.

### "Am I copying an existing component?"

Stop and check whether the existing component can be reused or generalized.

---

# 35. Agent Rules — Short Version

When generating or modifying AMS React code, follow these rules:

> **1. Use React + TypeScript + Redux as established by the project.**
>
> **2. Organize code by feature/domain. Do not put everything into one folder.**
>
> **3. Create reusable shared UI components for genuinely common behaviour.**
>
> **4. Keep business-specific components inside their feature module.**
>
> **5. Keep API calls in API/service modules, not scattered through JSX.**
>
> **6. Use Redux for shared application state, not every local UI state.**
>
> **7. Keep components focused and split large "God components."**
>
> **8. Avoid duplicate code, duplicate types, duplicate API clients, and duplicate UI components.**
>
> **9. Use TypeScript properly and avoid unjustified `any`.**
>
> **10. Keep global utilities generic; keep domain-specific logic inside its feature.**
>
> **11. Use centralized routing, API configuration, authentication state, and shared design tokens.**
>
> **12. Follow the AMS Professional / Corporate design system.**
>
> **13. Do not create separate frontend applications for different teams.**
>
> **14. Treat shared components and infrastructure as cross-team code and avoid breaking changes.**
>
> **15. Before adding new code, check whether an existing component, hook, utility, type, or service can be reused.**
>
> **16. Prefer simple, understandable architecture over unnecessary abstraction.**
>
> **17. Code must be maintainable by another developer who did not write it.**

---

# 36. Final Principle

The standard is not:

> "Does the page work?"

The standard is:

> **"Does the page work while remaining understandable, reusable, testable, and safe to extend by the other AMS teams?"**

The frontend is a shared codebase. Every architectural shortcut becomes someone else's problem later.

Build features so that the next developer can understand where the code belongs, what it does, and what can safely be reused.
