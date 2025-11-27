import { useEffect, useRef } from 'react';
import { useAuthStore } from '../store/authStore';
import { socketService } from '../services/socket.service';

export const useSocket = () => {
  const { token, isAuthenticated } = useAuthStore();
  const isConnected = useRef(false);

  useEffect(() => {
    if (isAuthenticated && token && !isConnected.current) {
      socketService.connect(token);
      isConnected.current = true;
    }

    return () => {
      if (isConnected.current) {
        socketService.disconnect();
        isConnected.current = false;
      }
    };
  }, [isAuthenticated, token]);

  return socketService;
};
