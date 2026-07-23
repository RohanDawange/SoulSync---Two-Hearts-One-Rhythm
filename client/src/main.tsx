import React from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { HelmetProvider } from 'react-helmet-async';
import { AuthProvider } from '@/context/AuthContext';
import { RoomProvider } from '@/context/RoomContext';
import { PlayerProvider } from '@/context/PlayerContext';
import { ChatProvider } from '@/context/ChatContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { NotificationProvider } from '@/context/NotificationContext';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <HelmetProvider>
      <HashRouter>
        <ThemeProvider>
          <AuthProvider>
            <RoomProvider>
              <PlayerProvider>
                <ChatProvider>
                  <NotificationProvider>
                    <App />
                    <Toaster
                      position="top-right"
                      toastOptions={{
                        style: {
                          background: 'rgba(15, 15, 25, 0.9)',
                          color: '#fff',
                          backdropFilter: 'blur(20px)',
                          border: '1px solid rgba(255,255,255,0.1)',
                          borderRadius: '16px',
                          padding: '12px 20px',
                        },
                        success: { iconTheme: { primary: '#a855f7', secondary: '#fff' } },
                        error: { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
                      }}
                    />
                  </NotificationProvider>
                </ChatProvider>
              </PlayerProvider>
            </RoomProvider>
          </AuthProvider>
        </ThemeProvider>
      </HashRouter>
    </HelmetProvider>
  </React.StrictMode>
);
