import { useEffect, useRef, useState, useCallback } from "react";
import { useDispatch } from "react-redux";
import { updatePrice, updateSignal } from "../features/marketSlice";
import { addPrediction } from "../features/predictionsSlice";

/**
 * Custom hook for real-time market data via WebSockets
 */
const useWebSocket = (url) => {
  const dispatch = useDispatch();
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef(null);

  const connect = useCallback(() => {
    if (socketRef.current?.readyState === WebSocket.OPEN) return;

    const wsUrl =
      url || process.env.REACT_APP_WS_URL || "ws://localhost:8000/ws/market/";
    const socket = new WebSocket(wsUrl);

    socket.onopen = () => {
      console.log("[WebSocket] Connected to market updates");
      setIsConnected(true);
    };

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log("[WebSocket] Message received:", data);

      if (data.type === "PREDICTION_UPDATE") {
        dispatch(updatePrice({ ticker: data.ticker, price: data.price }));
        dispatch(updateSignal({ ticker: data.ticker, signal: data.signal }));
        dispatch(addPrediction(data));
      }
    };

    socket.onclose = () => {
      console.log("[WebSocket] Disconnected. Reconnecting in 5s...");
      setIsConnected(false);
      setTimeout(connect, 5000);
    };

    socket.onerror = (err) => {
      console.error("[WebSocket] Error:", err);
      socket.close();
    };

    socketRef.current = socket;
  }, [dispatch, url]);

  useEffect(() => {
    connect();
    return () => {
      socketRef.current?.close();
    };
  }, [connect]);

  return { isConnected };
};

export default useWebSocket;
