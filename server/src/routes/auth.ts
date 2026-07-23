import { Router, Request, Response } from 'express';
import { admin } from '../config/firebase';
import { createOrUpdateUser } from '../services/userService';

const router = Router();

router.post('/api/auth/verify', async (req: Request, res: Response) => {
  try {
    const { idToken } = req.body;

    if (!idToken) {
      res.status(400).json({ error: 'idToken is required' });
      return;
    }

    const decodedToken = await admin.auth().verifyIdToken(idToken);

    const userData = {
      uid: decodedToken.uid,
      email: decodedToken.email || '',
      displayName: decodedToken.name || decodedToken.email?.split('@')[0] || 'User',
      photoURL: decodedToken.picture || '',
    };

    const user = await createOrUpdateUser(decodedToken.uid, userData);

    res.json({ user });
  } catch (error) {
    console.error('Auth verification error:', error);
    res.status(401).json({ error: 'Invalid token' });
  }
});

export default router;
