import { Router, Request, Response } from 'express';
import { authMiddleware } from '../middleware/auth';
import { validateRoomCode } from '../middleware/validate';
import { createRoom, joinRoom, leaveRoom, getRoom } from '../services/roomService';
import { createOrUpdateUser } from '../services/userService';

const router = Router();

router.use(authMiddleware);

router.get('/api/rooms/:code', validateRoomCode, async (req: Request, res: Response) => {
  try {
    const room = await getRoom(req.params.code);
    if (!room) {
      res.status(404).json({ error: 'Room not found' });
      return;
    }
    res.json({ room });
  } catch (error) {
    console.error('Get room error:', error);
    res.status(500).json({ error: 'Failed to get room' });
  }
});

router.post('/api/rooms', async (req: Request, res: Response) => {
  try {
    const user = await createOrUpdateUser(req.user!.uid, {
      displayName: req.user!.name,
      email: req.user!.email,
      photoURL: req.user!.picture,
    });

    const room = await createRoom(user);
    res.status(201).json({ room });
  } catch (error) {
    console.error('Create room error:', error);
    res.status(500).json({ error: 'Failed to create room' });
  }
});

router.post('/api/rooms/join', validateRoomCode, async (req: Request, res: Response) => {
  try {
    const { roomCode } = req.body;

    const user = await createOrUpdateUser(req.user!.uid, {
      displayName: req.user!.name,
      email: req.user!.email,
      photoURL: req.user!.picture,
    });

    const room = await joinRoom(roomCode, user);
    res.json({ room });
  } catch (error: any) {
    console.error('Join room error:', error);
    const status = error.message === 'Room not found' ? 404 : error.message === 'Room is full. Maximum 2 participants allowed.' ? 400 : 500;
    res.status(status).json({ error: error.message || 'Failed to join room' });
  }
});

router.delete('/api/rooms/:code/leave', validateRoomCode, async (req: Request, res: Response) => {
  try {
    const { uid } = req.body;
    if (!uid) {
      res.status(400).json({ error: 'uid is required' });
      return;
    }
    await leaveRoom(req.params.code, uid);
    res.json({ success: true });
  } catch (error) {
    console.error('Leave room error:', error);
    res.status(500).json({ error: 'Failed to leave room' });
  }
});

export default router;
