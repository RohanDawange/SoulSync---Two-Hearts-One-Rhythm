import { Router, Request, Response } from 'express';
import { authMiddleware } from '../middleware/auth';
import { getUser, createOrUpdateUser } from '../services/userService';

const router = Router();

router.use(authMiddleware);

router.get('/api/users/:id', async (req: Request, res: Response) => {
  try {
    const user = await getUser(req.params.id);
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }
    res.json({ user });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to get user' });
  }
});

router.patch('/api/users/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (id !== req.user!.uid) {
      res.status(403).json({ error: 'You can only update your own profile' });
      return;
    }

    const allowedFields = ['displayName', 'photoURL', 'bio', 'favoriteArtist', 'favoriteSongs', 'theme'];
    const updateData: Record<string, any> = {};

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    }

    if (Object.keys(updateData).length === 0) {
      res.status(400).json({ error: 'No valid fields to update' });
      return;
    }

    const user = await createOrUpdateUser(id, updateData);
    res.json({ user });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

export default router;
