import { Socket } from 'socket.io-client';
import toast from 'react-hot-toast';
import { SOCKET_EVENTS } from '@/utils/constants';

type DispatchFunction = (action: { type: string; payload?: unknown }) => void;

export function registerSocketHandlers(socket: Socket, dispatch: DispatchFunction): void {
  socket.on(SOCKET_EVENTS.ROOM_JOINED, (data) => {
    dispatch({ type: 'ROOM_JOINED', payload: data });
  });

  socket.on(SOCKET_EVENTS.ROOM_PARTICIPANT_JOINED, (data) => {
    dispatch({ type: 'ROOM_PARTICIPANT_JOINED', payload: data });
  });

  socket.on(SOCKET_EVENTS.ROOM_PARTICIPANT_LEFT, (data) => {
    dispatch({ type: 'ROOM_PARTICIPANT_LEFT', payload: data });
  });

  socket.on(SOCKET_EVENTS.ROOM_ERROR, (data) => {
    toast.error(data.message || 'Room error occurred');
    dispatch({ type: 'ROOM_ERROR', payload: data });
  });

  socket.on(SOCKET_EVENTS.PLAYER_STATE_CHANGE, (data) => {
    dispatch({ type: 'PLAYER_STATE_CHANGE', payload: data });
  });

  socket.on(SOCKET_EVENTS.PLAYER_TIMESTAMP, (data) => {
    dispatch({ type: 'PLAYER_TIMESTAMP', payload: data });
  });

  socket.on(SOCKET_EVENTS.PLAYER_URL_CHANGE, (data) => {
    dispatch({ type: 'PLAYER_URL_CHANGE', payload: data });
  });

  socket.on(SOCKET_EVENTS.CHAT_MESSAGE, (data) => {
    dispatch({ type: 'CHAT_MESSAGE', payload: data });
  });

  socket.on(SOCKET_EVENTS.CHAT_TYPING, (data) => {
    dispatch({ type: 'CHAT_TYPING', payload: data });
  });

  socket.on(SOCKET_EVENTS.PRESENCE_ONLINE, (data) => {
    dispatch({ type: 'PRESENCE_ONLINE', payload: data });
  });

  socket.on(SOCKET_EVENTS.PRESENCE_OFFLINE, (data) => {
    dispatch({ type: 'PRESENCE_OFFLINE', payload: data });
  });

  socket.on(SOCKET_EVENTS.CALL_OFFER, (data) => {
    dispatch({ type: 'CALL_OFFER', payload: data });
  });

  socket.on(SOCKET_EVENTS.CALL_ANSWER, (data) => {
    dispatch({ type: 'CALL_ANSWER', payload: data });
  });

  socket.on(SOCKET_EVENTS.CALL_ICE_CANDIDATE, (data) => {
    dispatch({ type: 'CALL_ICE_CANDIDATE', payload: data });
  });

  socket.on(SOCKET_EVENTS.CALL_END, (data) => {
    dispatch({ type: 'CALL_END', payload: data });
  });

  socket.on(SOCKET_EVENTS.REACTION_RECEIVED, (data) => {
    dispatch({ type: 'REACTION_RECEIVED', payload: data });
  });

  socket.on(SOCKET_EVENTS.COUPLE_HUG, (data) => {
    dispatch({ type: 'COUPLE_HUG', payload: data });
  });

  socket.on(SOCKET_EVENTS.COUPLE_KISS, (data) => {
    dispatch({ type: 'COUPLE_KISS', payload: data });
  });

  socket.on(SOCKET_EVENTS.PLAYLIST_UPDATED, (data) => {
    dispatch({ type: 'PLAYLIST_UPDATED', payload: data });
  });

  socket.on(SOCKET_EVENTS.QUEUE_UPDATED, (data) => {
    dispatch({ type: 'QUEUE_UPDATED', payload: data });
  });
}
