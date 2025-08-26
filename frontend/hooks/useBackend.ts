import { useAuth } from '../components/AuthProvider';
import backend from '~backend/client';

export function useBackend() {
  const { token } = useAuth();
  
  if (!token) {
    return backend;
  }

  return backend.with({
    auth: { authorization: `Bearer ${token}` }
  });
}
