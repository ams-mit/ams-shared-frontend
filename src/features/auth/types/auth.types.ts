import { MockUser, UserRole } from '@/constants/roles';

export interface AuthState {
  currentUser: MockUser;
  availableUsers: MockUser[];
  activeRole: UserRole;
  isDemoMode: boolean;
}
