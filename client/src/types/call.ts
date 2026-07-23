export type CallType = 'voice' | 'video';
export type CallStatus = 'idle' | 'calling' | 'ringing' | 'connected' | 'ended';

export interface CallState {
  type: CallType | null;
  status: CallStatus;
  peerId: string | null;
  peerName: string;
  peerAvatar: string;
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  muted: boolean;
  cameraOn: boolean;
  screenSharing: boolean;
}
