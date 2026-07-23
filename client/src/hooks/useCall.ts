import { useState, useEffect, useCallback, useRef } from 'react';
import { CallState, CallType, CallStatus } from '@/types/call';
import { SOCKET_EVENTS } from '@/utils/constants';
import { useSocket } from '@/context/SocketContext';
import { useAuth } from '@/context/AuthContext';
import { getSocket } from '@/socket';
import toast from 'react-hot-toast';

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

interface UseCallReturn {
  callState: CallState;
  startCall: (type: CallType, peerId: string, peerName?: string, peerAvatar?: string) => Promise<void>;
  answerCall: () => Promise<void>;
  endCall: () => void;
  toggleMute: () => void;
  toggleCamera: () => void;
  toggleScreenShare: () => void;
}

export function useCall(): UseCallReturn {
  const [callState, setCallState] = useState<CallState>(initialState);
  const { socket } = useSocket();
  const { user } = useAuth();
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const pendingCandidatesRef = useRef<RTCIceCandidateInit[]>([]);

  const updateCallState = useCallback((partial: Partial<CallState>) => {
    setCallState((prev) => ({ ...prev, ...partial }));
  }, []);

  const createPeerConnection = useCallback(async (remotePeerId: string) => {
    const pc = new RTCPeerConnection(STUN_SERVERS);
    peerConnectionRef.current = pc;

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        const s = socket || getSocket();
        if (s) {
          s.emit(SOCKET_EVENTS.CALL_ICE_CANDIDATE, {
            to: remotePeerId,
            candidate: event.candidate.toJSON(),
          });
        }
      }
    };

    pc.ontrack = (event) => {
      updateCallState({ remoteStream: event.streams[0] });
    };

    pc.oniceconnectionstatechange = () => {
      if (pc.iceConnectionState === 'disconnected' || pc.iceConnectionState === 'failed') {
        endCall();
      }
    };

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => {
        pc.addTrack(track, localStreamRef.current!);
      });
    }

    return pc;
  }, [socket]);

  useEffect(() => {
    if (!socket) return;

    const handleOffer = async (data: { offer: RTCSessionDescriptionInit; from: string; fromName: string; fromAvatar: string; type: CallType }) => {
      updateCallState({
        type: data.type,
        status: 'ringing',
        peerId: data.from,
        peerName: data.fromName,
        peerAvatar: data.fromAvatar,
      });

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: data.type === 'video',
        });
        localStreamRef.current = stream;
        updateCallState({ localStream: stream });

        const pc = await createPeerConnection(data.from);
        await pc.setRemoteDescription(new RTCSessionDescription(data.offer));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);

        socket.emit(SOCKET_EVENTS.CALL_ANSWER, { to: data.from, answer });
      } catch (err: any) {
        toast.error('Failed to create answer');
        endCall();
      }
    };

    const handleAnswer = async (data: { answer: RTCSessionDescriptionInit; from: string }) => {
      const pc = peerConnectionRef.current;
      if (!pc) return;
      try {
        await pc.setRemoteDescription(new RTCSessionDescription(data.answer));
        updateCallState({ status: 'connected' });

        for (const candidate of pendingCandidatesRef.current) {
          await pc.addIceCandidate(new RTCIceCandidate(candidate));
        }
        pendingCandidatesRef.current = [];
      } catch {
        toast.error('Failed to establish connection');
      }
    };

    const handleIceCandidate = async (data: { candidate: RTCIceCandidateInit }) => {
      const pc = peerConnectionRef.current;
      if (!pc) return;
      try {
        if (pc.remoteDescription && pc.remoteDescription.type) {
          await pc.addIceCandidate(new RTCIceCandidate(data.candidate));
        } else {
          pendingCandidatesRef.current.push(data.candidate);
        }
      } catch {
        // Ignore invalid candidates
      }
    };

    const handleCallEnd = (data: { from: string }) => {
      if (data.from === callState.peerId) {
        toast(`${callState.peerName} ended the call`, { icon: '📞' });
        endCall();
      }
    };

    socket.on(SOCKET_EVENTS.CALL_OFFER, handleOffer);
    socket.on(SOCKET_EVENTS.CALL_ANSWER, handleAnswer);
    socket.on(SOCKET_EVENTS.CALL_ICE_CANDIDATE, handleIceCandidate);
    socket.on(SOCKET_EVENTS.CALL_END, handleCallEnd);

    return () => {
      socket.off(SOCKET_EVENTS.CALL_OFFER, handleOffer);
      socket.off(SOCKET_EVENTS.CALL_ANSWER, handleAnswer);
      socket.off(SOCKET_EVENTS.CALL_ICE_CANDIDATE, handleIceCandidate);
      socket.off(SOCKET_EVENTS.CALL_END, handleCallEnd);
    };
  }, [socket, callState.peerId, callState.peerName]);

  const startCall = useCallback(async (type: CallType, peerId: string, peerName = '', peerAvatar = '') => {
    const s = socket || getSocket();
    if (!s) return;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: type === 'video',
      });
      localStreamRef.current = stream;

      updateCallState({
        type,
        status: 'calling',
        peerId,
        peerName,
        peerAvatar,
        localStream: stream,
      });

      const pc = await createPeerConnection(peerId);
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      s.emit(SOCKET_EVENTS.CALL_OFFER, {
        to: peerId,
        offer,
        type,
        fromName: user?.displayName || 'Unknown',
        fromAvatar: user?.photoURL || '',
      });
    } catch (err: any) {
      toast.error('Could not access microphone/camera');
      updateCallState(initialState);
    }
  }, [socket, user, createPeerConnection]);

  const answerCall = useCallback(async () => {
    const s = socket || getSocket();
    if (!s || !callState.peerId) return;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: callState.type === 'video',
      });
      localStreamRef.current = stream;
      updateCallState({ localStream: stream });

      const pc = await createPeerConnection(callState.peerId);
      updateCallState({ status: 'connected' });
    } catch {
      toast.error('Failed to answer call');
    }
  }, [socket, callState.peerId, callState.type, createPeerConnection]);

  const endCall = useCallback(() => {
    const s = socket || getSocket();
    if (s && callState.peerId) {
      s.emit(SOCKET_EVENTS.CALL_END, { to: callState.peerId });
    }

    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
      localStreamRef.current = null;
    }

    pendingCandidatesRef.current = [];
    updateCallState(initialState);
  }, [socket, callState.peerId]);

  const toggleMute = useCallback(() => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        updateCallState({ muted: !audioTrack.enabled });
      }
    }
  }, []);

  const toggleCamera = useCallback(async () => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        updateCallState({ cameraOn: videoTrack.enabled });
      } else if (!callState.cameraOn) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ video: true });
          const newTrack = stream.getVideoTracks()[0];
          localStreamRef.current.addTrack(newTrack);
          peerConnectionRef.current?.addTrack(newTrack, localStreamRef.current);
          updateCallState({ cameraOn: true });
        } catch {
          toast.error('Could not access camera');
        }
      }
    }
  }, [callState.cameraOn]);

  const toggleScreenShare = useCallback(async () => {
    if (callState.screenSharing) {
      const pc = peerConnectionRef.current;
      if (pc && localStreamRef.current) {
        const videoTrack = localStreamRef.current.getVideoTracks()[0];
        if (videoTrack) {
          const sender = pc.getSenders().find((s) => s.track?.kind === 'video');
          if (sender) await sender.replaceTrack(videoTrack);
        }
      }
      updateCallState({ screenSharing: false });
      return;
    }

    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
      const videoTrack = screenStream.getVideoTracks()[0];

      const pc = peerConnectionRef.current;
      if (pc) {
        const sender = pc.getSenders().find((s) => s.track?.kind === 'video');
        if (sender) {
          await sender.replaceTrack(videoTrack);
        }
      }

      videoTrack.onended = () => {
        toggleScreenShare();
      };

      updateCallState({ screenSharing: true });
    } catch {
      toast.error('Screen sharing cancelled');
    }
  }, [callState.screenSharing]);

  useEffect(() => {
    return () => {
      if (peerConnectionRef.current) {
        peerConnectionRef.current.close();
        peerConnectionRef.current = null;
      }
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((track) => track.stop());
        localStreamRef.current = null;
      }
    };
  }, []);

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
