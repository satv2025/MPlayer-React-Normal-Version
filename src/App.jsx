import React from 'react';
import VideoPlayer from './components/VideoPlayer';

export default function App() {
  const video =
    'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4';

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#071022',
        padding: 24,
      }}
    >
      <div style={{ width: '100%', maxWidth: 1100 }}>
        <VideoPlayer src={video} poster="https://picsum.photos/1280/720" />
      </div>
    </div>
  );
}
