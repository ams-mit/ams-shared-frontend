import { Navigate } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';
import { ROLES } from '@/constants/roles';
import { DashboardPage } from '@/features/dashboard';
import { FacilitiesPage, ReservationsPage } from '@/features/facilities';
import { VisitorsPage, VisitorScannerPage } from '@/features/visitors';
import { AnnouncementsPage } from '@/features/announcements';
import { UnitsPage } from '@/features/units';
import { LeasesPage } from '@/features/leases';
import { BuildingsPage, FloorsPage, OwnershipsPage, MyResidencePage } from '@/features/property';
import {
  AccessDeniedPage,
  ChangePasswordPage,
  EditProfilePage,
  EmailChangePage,
  ForceChangePasswordPage,
  ForgotPasswordPage,
  LoginPage,
  ProfilePage,
  RegisterPage,
  ResetPasswordPage,
} from '@/features/auth';
import { CreateUserPage, EditUserPage, RolesPage, UserDetailPage, UsersPage } from '@/features/users';
import {
  MyRelationshipsPage,
  RelationshipRequestPage,
  RelationshipReviewPage,
  ResidentsPage,
} from '@/features/residents';
import { OwnersPage } from '@/features/owners/pages/OwnersPage';
import { StaffPage } from '@/features/staff/pages/StaffPage';
import { FinanceDashboardPage } from '@/features/billing/pages/FinanceDashboardPage';
import { ChargeRulesPage } from '@/features/billing/pages/ChargeRulesPage';
import { InvoicesPage } from '@/features/billing/pages/InvoicesPage';
import { PaymentsPage } from '@/features/billing/pages/PaymentsPage';
import { ReceiptsPage } from '@/features/billing/pages/ReceiptsPage';
import { UtilitiesPage } from '@/features/utilities/pages/UtilitiesPage';
import { ProtectedRoute } from './ProtectedRoute';

export interface RouteItem {
  path: string;
  element: React.ReactNode;
  title: string;
}

const adminOnly = (element: React.ReactNode) => (
  <ProtectedRoute allowedRoles={[ROLES.ADMIN]}>{element}</ProtectedRoute>
);

/** Full-screen pages rendered outside the application layout (no sidebar/header). */
export const publicRoutes: RouteItem[] = [
  { path: ROUTES.LOGIN, element: <LoginPage />, title: 'Sign In' },
  { path: ROUTES.REGISTER, element: <RegisterPage />, title: 'Register' },
  { path: ROUTES.FORGOT_PASSWORD, element: <ForgotPasswordPage />, title: 'Forgot Password' },
  { path: ROUTES.RESET_PASSWORD, element: <ResetPasswordPage />, title: 'Reset Password' },
  { path: ROUTES.FORCE_CHANGE_PASSWORD, element: <ForceChangePasswordPage />, title: 'Change Password' },
];

export const routesConfig: RouteItem[] = [
  {
    path: ROUTES.HOME,
    element: <Navigate to={ROUTES.DASHBOARD} replace />,
    title: 'Home',
  },
  {
    path: ROUTES.DASHBOARD,
    element: <DashboardPage />,
    title: 'Dashboard',
  },
  {
    path: ROUTES.FACILITIES,
    element: <FacilitiesPage />,
    title: 'Facilities Directory',
  },
  {
    path: ROUTES.RESERVATIONS,
    element: <ReservationsPage />,
    title: 'Reservations & Approvals',
  },
  {
    path: ROUTES.VISITORS,
    element: <VisitorsPage />,
    title: 'Visitor Management',
  },
  {
    path: ROUTES.VISITORS_SCAN,
    element: <VisitorScannerPage />,
    title: 'Gate Pass QR Scanner',
  },
  {
    path: ROUTES.ANNOUNCEMENTS,
    element: <AnnouncementsPage />,
    title: 'Announcements',
  },
  {
    path: ROUTES.UNITS,
    element: (
      <ProtectedRoute allowedRoles={['ADMIN', 'STAFF']}>
        <UnitsPage />
      </ProtectedRoute>
    ),
    title: 'Unit Inventory',
  },
  {
    path: ROUTES.LEASES,
    element: (
      <ProtectedRoute allowedRoles={['ADMIN', 'STAFF']}>
        <LeasesPage />
      </ProtectedRoute>
    ),
    title: 'Lease Agreements',
  },
  {
    path: ROUTES.BUILDINGS,
    element: (
      <ProtectedRoute allowedRoles={['ADMIN', 'STAFF']}>
        <BuildingsPage />
      </ProtectedRoute>
    ),
    title: 'Buildings',
  },
  {
    path: ROUTES.FLOORS,
    element: (
      <ProtectedRoute allowedRoles={['ADMIN', 'STAFF']}>
        <FloorsPage />
      </ProtectedRoute>
    ),
    title: 'Floors',
  },
  {
    path: ROUTES.OWNERSHIPS,
    element: (
      <ProtectedRoute allowedRoles={['ADMIN', 'STAFF']}>
        <OwnershipsPage />
      </ProtectedRoute>
    ),
    title: 'Ownerships',
  },
  {
    path: ROUTES.MY_RESIDENCE,
    element: (
      <ProtectedRoute allowedRoles={['RESIDENT', 'OWNER']}>
        <MyResidencePage />
      </ProtectedRoute>
    ),
    title: 'My Residence',
  },

  // Group 3 — Billing, Charges, Invoices & Payments.
  // Finance Officer and Apartment Manager sign in with the STAFF / ADMIN app roles.
  {
    path: ROUTES.FINANCE_DASHBOARD,
    element: (
      <ProtectedRoute allowedRoles={['ADMIN', 'STAFF']}>
        <FinanceDashboardPage />
      </ProtectedRoute>
    ),
    title: 'Finance Dashboard',
  },
  {
    path: ROUTES.CHARGES,
    element: (
      <ProtectedRoute allowedRoles={['ADMIN', 'STAFF']}>
        <ChargeRulesPage />
      </ProtectedRoute>
    ),
    title: 'Charge Rules',
  },
  { path: ROUTES.INVOICES, element: <InvoicesPage />, title: 'Invoices' },
  { path: ROUTES.PAYMENTS, element: <PaymentsPage />, title: 'Payments' },
  { path: ROUTES.RECEIPTS, element: <ReceiptsPage />, title: 'Receipts' },
  { path: ROUTES.UTILITIES, element: <UtilitiesPage />, title: 'Utility Metering' },

  // Group 1 — Identity, Access, Residents & User Relationships
  { path: ROUTES.PROFILE, element: <ProfilePage />, title: 'My Profile' },
  { path: ROUTES.PROFILE_EDIT, element: <EditProfilePage />, title: 'Edit Profile' },
  { path: ROUTES.PROFILE_EMAIL_CHANGE, element: <EmailChangePage />, title: 'Change Email' },
  { path: ROUTES.PROFILE_CHANGE_PASSWORD, element: <ChangePasswordPage />, title: 'Change Password' },
  { path: ROUTES.RESIDENTS, element: <ResidentsPage />, title: 'Residents Directory' },
  { path: ROUTES.OWNERS, element: <OwnersPage />, title: 'Property Owners' },
  { path: ROUTES.STAFF, element: <StaffPage />, title: 'Building Staff' },
  { path: ROUTES.RELATIONSHIPS, element: <MyRelationshipsPage />, title: 'My Relationships' },
  { path: ROUTES.RELATIONSHIP_REQUEST, element: <RelationshipRequestPage />, title: 'Request Relationship' },
  { path: ROUTES.USERS, element: adminOnly(<UsersPage />), title: 'User Accounts' },
  { path: ROUTES.USER_CREATE, element: adminOnly(<CreateUserPage />), title: 'Create User' },
  { path: ROUTES.USER_DETAIL, element: adminOnly(<UserDetailPage />), title: 'User Details' },
  { path: ROUTES.USER_EDIT, element: adminOnly(<EditUserPage />), title: 'Edit User' },
  { path: ROUTES.ROLES, element: adminOnly(<RolesPage />), title: 'Role Reference' },
  { path: ROUTES.RELATIONSHIP_REVIEW, element: adminOnly(<RelationshipReviewPage />), title: 'Relationship Requests' },
  { path: ROUTES.UNAUTHORIZED, element: <AccessDeniedPage />, title: 'Access Denied' },
];
