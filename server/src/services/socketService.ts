import { Server as SocketIOServer } from 'socket.io';
import { Server as HttpServer } from 'http';

let io: SocketIOServer | null = null;

export const initSocket = (server: HttpServer) => {
  io = new SocketIOServer(server, {
    cors: {
      origin: "*", // Or match your client app's origin
      methods: ["GET", "POST"]
    }
  });

  io.on('connection', (socket) => {
    console.log(`[Socket] Client connected: ${socket.id}`);
    
    socket.on('disconnect', () => {
      console.log(`[Socket] Client disconnected: ${socket.id}`);
    });
  });

  return io;
};

export const getSocketIO = () => {
  if (!io) {
    throw new Error("Socket.io not initialized. Call initSocket first.");
  }
  return io;
};

/**
 * Broadcasts a generic real-time event to all connected clients.
 */
export const broadcastEvent = (eventType: string, payload: any) => {
  if (io) {
    io.emit(eventType, payload);
  }
};

/**
 * Convenience methods for specific Command Center events.
 */
export const socketService = {
  broadcastStaffingChange: (data: { type: 'add' | 'remove' | 'update'; employeeId: string; projectId: string; details: any }) => {
    broadcastEvent('staffing_update', data);
  },
  broadcastRiskAlert: (data: { employeeId: string; type: string; severity: 'low' | 'medium' | 'high'; message: string }) => {
    broadcastEvent('risk_alert', data);
  },
  broadcastSPOFAlert: (data: { employeeId: string; skill: string; message: string }) => {
    broadcastEvent('spof_alert', data);
  },
  broadcastCostUpdate: (data: { benchCost: number; timestamp: string }) => {
    broadcastEvent('cost_update', data);
  },
  broadcastSimulation: (data: { message: string; payload: any }) => {
    broadcastEvent('simulation_event', data);
  }
};
