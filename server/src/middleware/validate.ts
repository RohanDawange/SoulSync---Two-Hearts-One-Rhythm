import { Request, Response, NextFunction } from 'express';
import { Song } from '../types';

const ROOM_CODE_REGEX = /^[A-Z0-9]{6}$/;
const VALID_SOURCES = ['youtube', 'spotify', 'soundcloud'];
const MAX_MESSAGE_LENGTH = 1000;

export function validateRoomCode(req: Request, res: Response, next: NextFunction): void {
  const code = req.params.code || req.body.roomCode;

  if (!code || !ROOM_CODE_REGEX.test(code)) {
    res.status(400).json({ error: 'Invalid room code. Must be 6 alphanumeric characters.' });
    return;
  }

  next();
}

export function validateSong(req: Request, res: Response, next: NextFunction): void {
  const song: Song = req.body.song || req.body;

  if (!song) {
    res.status(400).json({ error: 'Song data is required' });
    return;
  }

  if (!song.title || typeof song.title !== 'string') {
    res.status(400).json({ error: 'Song title is required' });
    return;
  }

  if (!song.url || typeof song.url !== 'string') {
    res.status(400).json({ error: 'Song URL is required' });
    return;
  }

  if (!song.source || !VALID_SOURCES.includes(song.source)) {
    res.status(400).json({ error: `Song source must be one of: ${VALID_SOURCES.join(', ')}` });
    return;
  }

  next();
}

export function validateMessage(req: Request, res: Response, next: NextFunction): void {
  const { content } = req.body;

  if (!content || typeof content !== 'string' || content.trim().length === 0) {
    res.status(400).json({ error: 'Message content is required' });
    return;
  }

  if (content.length > MAX_MESSAGE_LENGTH) {
    res.status(400).json({ error: `Message must be ${MAX_MESSAGE_LENGTH} characters or less` });
    return;
  }

  next();
}
