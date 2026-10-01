import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/app/store/hooks';
import { sessionExpired, setCredentials } from '../store/authSlice';
import { authApi, AuthError } from '../api/authApi';

/**
 * On app start the session user comes from storage; this refreshes it once from GET /auth/me
 * so role or status changes made since sign-in take effect. An expired or invalid token ends
 * the session; when the identity service is unreachable the stored user is kept. A sign-in
 * during this visit already returns its user, so only the token present at start is checked.
 */
export const SessionRestorer: React.FC = () => {
  const dispatch = useAppDispatch();
  const startupToken = useAppSelector((state) => state.auth.token);

  useEffect(() => {
    if (!startupToken) return;
    let cancelled = false;
    authApi
      .me(startupToken)
      .then((restored) => {
        if (!cancelled) dispatch(setCredentials({ user: restored, token: startupToken }));
      })
      .catch((err) => {
        if (!cancelled && err instanceof AuthError && err.status === 401) dispatch(sessionExpired());
      });
    return () => {
      cancelled = true;
    };
    // Runs once on start-up only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
};
