import { useState, useRef, useCallback, useEffect } from 'react';
import { CallState, CallStatus, CallType } from '@/types/call';
import { useAuth } from '@/context/AuthContext';
import { useRoom } from '@/context/RoomContext';
import { sendCallSignal, listenCallSignals, CallSignal } from '@/services/callService';

const STUN_SERVERS = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
  ],
};

const initialState: CallState = {
  type: null,
  status: 'idle',
  peerId: null,
  peerName: '',
  peerAvatar: '',
  localStream: null,
  remoteStream: null,
  muted: false,
  cameraOn: true,
  screenSharing: false,
};

export function useCall() {
  const [callState, setCallState] = useState<CallState>(initialState);
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const { user } = useAuth();
  const { currentRoom } = useRoom();

  useEffect(() => {
    if (!currentRoom || !user) return;
    const unsub = listenCallSignals(currentRoom.code, user.uid, async (signal) => {
      if (signal.from === user.uid) return;
      switch (signal.type) {
        case 'offer':
          setCallState(prev => ({
            ...prev,
            type: signal.data?.type || 'voice',
            status: 'ringing',
            peerId: signal.from,
            peerName: signal.fromName || 'Partner',
            peerAvatar: signal.fromAvatar || '',
          }));
          break;
        case 'answer':
          if (signal.data) {
            await pcRef.current?.setRemoteDescription(new RTCSessionDescription(signal.data));
            setCallState(prev => ({ ...prev, status: 'connected' }));
          }
          break;
        case 'ice-candidate':
          if (signal.data) {
            await pcRef.current?.addIceCandidate(new RTCIceCandidate(signal.data));
          }
          break;
        case 'end':
          cleanupCall();
          break;
        case 'mute':
          setCallState(prev => ({ ...prev, muted: signal.data?.muted || false }));
          break;
      }
    });
    return unsub;
  }, [currentRoom, user]);

  const createPeerConnection = useCallback(async (stream: MediaStream) => {
    if (!currentRoom || !user) return null;
    const pc = new RTCPeerConnection(STUN_SERVERS);
    pcRef.current = pc;

    stream.getTracks().forEach(track => pc.addTrack(track, stream));

    pc.onicecandidate = (e) => {
      if (e.candidate && currentRoom) {
        sendCallSignal(currentRoom.code, {
          type: 'ice-candidate',
          from: user.uid,
          to: callState.peerId || '',
          data: e.candidate.toJSON(),
        });
      }
    };

    pc.ontrack = (e) => {
      setCallState(prev => ({ ...prev, remoteStream: e.streams[0] }));
    };

    pc.oniceconnectionstatechange = () => {
      if (pc.iceConnectionState === 'disconnected' || pc.iceConnectionState === 'failed') {
        cleanupCall();
      }
    };

    return pc;
  }, [currentRoom, user, callState.peerId]);

  const startCall = useCallback(async (type: CallType, peerId: string) => {
    if (!currentRoom || !user) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: type === 'video',
      });
      localStreamRef.current = stream;

      const pc = await createPeerConnection(stream);
      if (!pc) return;

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      setCallState({
        type,
        status: 'calling',
        peerId,
        peerName: 'Partner',
        peerAvatar: '',
        localStream: stream,
        remoteStream: null,
        muted: false,
        cameraOn: true,
        screenSharing: false,
      });

      await sendCallSignal(currentRoom.code, {
        type: 'offer',
        from: user.uid,
        fromName: user.displayName,
        fromAvatar: user.photoURL,
        to: peerId,
        data: { type, sdp: offer },
      });
    } catch (err) {
      cleanupCall();
    }
  }, [currentRoom, user, createPeerConnection]);

  const answerCall = useCallback(async () => {
    if (!currentRoom || !user || !callState.peerId) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: callState.type === 'video',
      });
      localStreamRef.current = stream;

      const pc = await createPeerConnection(stream);
      if (!pc) return;

      setCallState(prev => ({ ...prev, localStream: stream, status: 'connected' }));
    } catch (err) {
      cleanupCall();
    }
  }, [currentRoom, user, callState.peerId, callState.type, createPeerConnection]);

  const endCall = useCallback(async () => {
    if (currentRoom && user && callState.peerId) {
      await sendCallSignal(currentRoom.code, {
        type: 'end',
        from: user.uid,
        to: callState.peerId,
      });
    }
    cleanupCall();
  }, [currentRoom, user, callState.peerId]);

  const cleanupCall = useCallback(() => {
    pcRef.current?.close();
    pcRef.current = null;
    localStreamRef.current?.getTracks().forEach(t => t.stop());
    localStreamRef.current = null;
    setCallState(initialState);
  }, []);

  const toggleMute = useCallback(() => {
    localStreamRef.current?.getAudioTracks().forEach(t => {
      t.enabled = !t.enabled;
    });
    setCallState(prev => {
      const muted = !prev.muted;
      if (currentRoom && user && callState.peerId) {
        sendCallSignal(currentRoom.code, {
          type: 'mute',
          from: user.uid,
          to: callState.peerId!,
          data: { muted },
        });
      }
      return { ...prev, muted };
    });
  }, [currentRoom, user, callState.peerId]);

  const toggleCamera = useCallback(() => {
    localStreamRef.current?.getVideoTracks().forEach(t => {
      t.enabled = !t.enabled;
    });
    setCallState(prev => ({ ...prev, cameraOn: !prev.cameraOn }));
  }, []);

  const toggleScreenShare = useCallback(async () => {
    if (callState.screenSharing) {
      const stream = localStreamRef.current;
      if (stream) {
        const sender = pcRef.current?.getSenders().find(s => s.track?.kind === 'video');
        if (sender && stream.getVideoTracks()[0]) {
          await sender.replaceTrack(stream.getVideoTracks()[0]);
        }
      }
      setCallState(prev => ({ ...prev, screenSharing: false }));
    } else {
      try {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        const sender = pcRef.current?.getSenders().find(s => s.track?.kind === 'video');
        if (sender) {
          await sender.replaceTrack(screenStream.getVideoTracks()[0]);
        }
        screenStream.getVideoTracks()[0].onended = () => toggleScreenShare();
        setCallState(prev => ({ ...prev, screenSharing: true }));
      } catch {}
    }
  }, [callState.screenSharing]);

  return {
    callState,
    startCall,
    answerCall,
    endCall,
    toggleMute,
    toggleCamera,
    toggleScreenShare,
  };
}
