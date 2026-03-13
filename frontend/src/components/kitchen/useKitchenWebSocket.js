import { useEffect, useRef, useState } from 'react';

const useKitchenWebSocket = (restaurantId, onMessage) => {
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState(null);

  const ws = useRef(null);
  const reconnectTimer = useRef(null);
  const messageHandler = useRef(onMessage);

  // Always keep latest callback reference
  useEffect(() => {
    messageHandler.current = onMessage;
  }, [onMessage]);

  useEffect(() => {
    if (!restaurantId) return;

    const connectWebSocket = () => {
      const wsUrl = `${process.env.REACT_APP_WS_URL || 'ws://localhost:8000'}/ws/kitchen/${restaurantId}/`;

      ws.current = new WebSocket(wsUrl);

      ws.current.onopen = () => {
        console.log('🍳 Kitchen WebSocket connected');
        setIsConnected(true);
        setError(null);
      };

      ws.current.onmessage = (event) => {
        try {
          // Ignore non-JSON messages
          if (typeof event.data !== "string" || !event.data.startsWith("{")) {
            return;
          }

          const data = JSON.parse(event.data);
          console.log("📩 Kitchen message:", data);

          if (messageHandler.current) {
            messageHandler.current(data);
          }
        } catch (err) {
          console.error("WebSocket parse error:", err, event.data);
        }
      };

      ws.current.onerror = (err) => {
        console.error('❌ Kitchen WebSocket error:', err);
        setError('Connection error');
        setIsConnected(false);
      };

      ws.current.onclose = () => {
        console.log('⚠️ Kitchen WebSocket closed');
        setIsConnected(false);

        // Auto reconnect after 3 seconds
        reconnectTimer.current = setTimeout(() => {
          console.log('🔄 Reconnecting kitchen WebSocket...');
          connectWebSocket();
        }, 3000);
      };
    };

    connectWebSocket();

    return () => {
      if (reconnectTimer.current) {
        clearTimeout(reconnectTimer.current);
      }

      if (ws.current) {
        ws.current.close();
      }
    };
  }, [restaurantId]);

  return { isConnected, error };
};

export default useKitchenWebSocket;