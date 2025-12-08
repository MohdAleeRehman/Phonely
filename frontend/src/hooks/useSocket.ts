import { useEffect, useRef } from 'react';
import { useAuthStore } from '../store/authStore';
import { socketService } from '../services/socket.service';

export const useSocket = () => {
  const { token, user, isAuthenticated } = useAuthStore();
  const isConnected = useRef(false);

  useEffect(() => {
    if (isAuthenticated && token && user && !isConnected.current) {
      const userId = user._id || user.id;
      if (userId) {
        socketService.connect(token, userId);
        isConnected.current = true;
      }
    }

    return () => {
      if (isConnected.current) {
        socketService.disconnect();
        isConnected.current = false;
      }
    };
  }, [isAuthenticated, token, user]);

  return socketService;
};
