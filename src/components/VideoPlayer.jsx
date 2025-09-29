import React, { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';
import dashjs from 'dashjs';
import '../styles.css';

const ICONS = {
  play: 'https://static.solargentinotv.com.ar/mplayer-normal/icons/svg/play.svg',
  pause: 'https://static.solargentinotv.com.ar/mplayer-normal/icons/svg/pause.svg',
  fullscreen: 'https://static.solargentinotv.com.ar/mplayer-normal/icons/svg/fullscreen.svg',
  windowed: 'https://static.solargentinotv.com.ar/mplayer-normal/icons/svg/windowed.svg',
  settings: 'https://static.solargentinotv.com.ar/mplayer-normal/icons/svg/settings.svg',
  mute: 'https://static.solargentinotv.com.ar/mplayer-normal/icons/svg/volume/mute.svg',
  vol0: 'https://static.solargentinotv.com.ar/mplayer-normal/icons/svg/volume/vol0.svg',
  vol1: 'https://static.solargentinotv.com.ar/mplayer-normal/icons/svg/volume/vol1.svg',
  vol2: 'https://static.solargentinotv.com.ar/mplayer-normal/icons/svg/volume/vol2.svg',
};

export default function VideoPlayer({ src, poster, className = '', autoplay = true }) {
  const videoRef = useRef(null);
  const containerRef = useRef(null);

  const hlsRef = useRef(null);
  const dashRef = useRef(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const [showSettings, setShowSettings] = useState(false);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [showPitchMenu, setShowPitchMenu] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [pitch, setPitch] = useState(1);

  const [isLive, setIsLive] = useState(false);

  // ------------------------------
  // Cargar fuente según tipo
  // ------------------------------
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (src.endsWith('.m3u8') && Hls.isSupported()) {
      setIsLive(true);
      const hls = new Hls();
      hls.loadSource(src);
      hls.attachMedia(video);
      hlsRef.current = hls;
      if (autoplay) video.play().catch(err => console.warn('Autoplay bloqueado:', err));
      return () => hls.destroy();
    } else if (src.endsWith('.mpd')) {
      setIsLive(true);
      const player = dashjs.MediaPlayer().create();
      player.initialize(video, src, false);
      dashRef.current = player;
      if (autoplay) video.play().catch(err => console.warn('Autoplay bloqueado:', err));
      return () => player.reset();
    } else {
      setIsLive(false);
      video.src = src;
      if (autoplay) video.play().catch(err => console.warn('Autoplay bloqueado:', err));
    }
  }, [src, autoplay]);

  // ------------------------------
  // Mantener estado de video
  // ------------------------------
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = muted;
    v.volume = volume;
    v.playbackRate = speed;
    v.preservesPitch = pitch;
  }, [muted, volume, speed, pitch]);

  // ------------------------------
  // Eventos del video
  // ------------------------------
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;

    const onLoaded = () => setDuration(v.duration || 0);
    const onTime = () => setCurrentTime(v.currentTime);
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);

    v.addEventListener('loadedmetadata', onLoaded);
    v.addEventListener('timeupdate', onTime);
    v.addEventListener('play', onPlay);
    v.addEventListener('pause', onPause);

    return () => {
      v.removeEventListener('loadedmetadata', onLoaded);
      v.removeEventListener('timeupdate', onTime);
      v.removeEventListener('play', onPlay);
      v.removeEventListener('pause', onPause);
    };
  }, []);

  // ------------------------------
  // Funciones principales
  // ------------------------------
  const togglePlay = async () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) {
      try { await v.play(); } catch (err) { console.warn(err); }
    } else {
      v.pause();
    }
  };

  const toggleFullscreen = () => {
    const el = containerRef.current;
    if (!el) return;
    if (!document.fullscreenElement) {
      el.requestFullscreen().then(() => setIsFullscreen(true));
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false));
    }
  };

  const exitFullscreen = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen().then(() => setIsFullscreen(false));
    }
  };

  const goLive = () => {
    const v = videoRef.current;
    if (!v) return;
    if (hlsRef.current && hlsRef.current.liveSyncPosition) {
      v.currentTime = hlsRef.current.liveSyncPosition;
    } else if (dashRef.current) {
      const duration = dashRef.current.duration();
      dashRef.current.seek(duration);
    } else {
      v.currentTime = v.duration;
    }
  };

  const seekForward10 = () => {
    const v = videoRef.current;
    if (!v) return;
    v.currentTime = Math.min(v.currentTime + 10, duration);
  };

  const seekBackward10 = () => {
    const v = videoRef.current;
    if (!v) return;
    v.currentTime = Math.max(v.currentTime - 10, 0);
  };

  const adjustVolumeByArrow = (delta) => {
    const v = videoRef.current;
    if (!v) return;
    let newVol = Math.min(1, Math.max(0, volume + delta));
    setVolume(newVol);
    v.volume = newVol;
    if (newVol > 0 && muted) setMuted(false);
  };

  const onClickCenter = (e) => {
    if (e.target === videoRef.current && e.button === 0) togglePlay();
  };

  const onRightClickCenter = (e) => {
    e.preventDefault();
    const overlay = document.createElement('div');
    overlay.innerText = 'MPlayer: Developed only for Sol Argentino TV';
    overlay.style.position = 'absolute';
    overlay.style.top = '50%';
    overlay.style.left = '50%';
    overlay.style.transform = 'translate(-50%, -50%)';
    overlay.style.padding = '10px 20px';
    overlay.style.background = 'rgba(0,0,0,0.7)';
    overlay.style.color = '#fff';
    overlay.style.borderRadius = '5px';
    overlay.style.zIndex = '9999';
    document.body.appendChild(overlay);
    setTimeout(() => document.body.removeChild(overlay), 2000);
  };

  const formatTime = (t) => {
    if (!isFinite(t)) return '00:00';
    const m = Math.floor(t / 60);
    const s = Math.floor(t % 60);
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const volumeIcon = () => {
    if (muted || volume === 0) return ICONS.mute;
    if (volume <= 0.33) return ICONS.vol0;
    if (volume <= 0.66) return ICONS.vol1;
    return ICONS.vol2;
  };

  // ------------------------------
  // Atajos de teclado y clicks
  // ------------------------------
  useEffect(() => {
    const handleKey = (e) => {
      if (!videoRef.current) return;

      if (!isLive) {
        if (e.code === 'Space') { e.preventDefault(); togglePlay(); }
        if (e.code === 'ArrowLeft') seekBackward10();
        if (e.code === 'ArrowRight') seekForward10();
      }

      if (isLive) {
        if (e.code === 'ArrowUp') { e.preventDefault(); adjustVolumeByArrow(0.05); }
        if (e.code === 'ArrowDown') { e.preventDefault(); adjustVolumeByArrow(-0.05); }
        if (e.code === 'KeyF') toggleFullscreen();
        if (e.code === 'Space') { e.preventDefault(); togglePlay(); }
      }

      // Fullscreen en ambos modos
      if (e.code === 'KeyF') toggleFullscreen();
      if (e.code === 'Escape') exitFullscreen();
    };

    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isLive, volume]);

  return (
    <div
      ref={containerRef}
      className={`vp-container ${className}`}
      onClick={onClickCenter}
      onContextMenu={onRightClickCenter}
    >
      <video ref={videoRef} poster={poster} className="vp-video" />

      <div className="vp-overlay">
        <div className={`vp-progress-bar ${isLive ? 'live' : ''}`}>
          <div className="vp-progress-bg" />
          <div
            className="vp-progress-fill"
            style={{ width: isLive ? '100%' : `${(currentTime / duration) * 100}%` }}
          />
          <div
            className="vp-progress-handle"
            style={{
              left: isLive ? '100%' : `${(currentTime / duration) * 100}%`,
              opacity: isLive ? 0 : 1,
            }}
          />
          {!isLive && (
            <input
              type="range"
              min={0}
              max={duration || 1}
              step={0.01}
              value={currentTime}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                videoRef.current.currentTime = val;
                setCurrentTime(val);
              }}
              style={{
                position: 'absolute',
                width: '100%',
                height: '100%',
                top: 0,
                left: 0,
                opacity: 0,
                cursor: 'pointer',
              }}
            />
          )}
        </div>

        {/* CONTROLES */}
        <div className="vp-controls">
          <div className="vp-left">
            <button
              className="vp-icon-btn vp-play-btn"
              onClick={(e) => { e.stopPropagation(); togglePlay(); }}
            >
              <img src={isPlaying ? ICONS.pause : ICONS.play} alt="play/pause" />
            </button>

            <div className="vp-volume-wrapper">
              <button
                className="vp-icon-btn vp-volume-btn"
                onClick={(e) => { e.stopPropagation(); setMuted(!muted); }}
              >
                <img src={volumeIcon()} alt="volume" />
              </button>
              <div className="vp-volume-container">
                <div className="vp-volume-bar">
                  <div className="vp-volume-bg" />
                  <div
                    className="vp-volume-fill"
                    style={{ width: muted ? '0%' : `${volume * 100}%` }}
                  />
                  <div
                    className="vp-volume-handle"
                    style={{ left: muted ? '0%' : `${volume * 100}%` }}
                  />
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.01}
                    value={muted ? 0 : volume}
                    onChange={(e) => {
                      e.stopPropagation();
                      const val = parseFloat(e.target.value);
                      setVolume(val);
                      if (val > 0 && muted) setMuted(false);
                      videoRef.current.volume = val;
                    }}
                    style={{
                      position: 'absolute',
                      width: '100%',
                      height: '100%',
                      top: 0,
                      left: 0,
                      opacity: 0,
                      cursor: 'pointer',
                    }}
                  />
                </div>
              </div>
            </div>

            <div
              className={`vp-time ${isLive ? 'live' : ''}`}
              onClick={(e) => { e.stopPropagation(); isLive ? goLive() : null; }}
              style={{ cursor: isLive ? 'pointer' : 'default' }}
            >
              {isLive
                ? 'EN VIVO'
                : `${formatTime(currentTime)} / ${formatTime(duration)}`}
            </div>
          </div>

          <div className="vp-right">
            <div className="vp-settings-btn">
              <button
                className="vp-icon-btn"
                onClick={(e) => { e.stopPropagation(); setShowSettings((s) => !s); }}
              >
                <img src={ICONS.settings} alt="settings" />
              </button>

              {showSettings && !showSpeedMenu && !showPitchMenu && (
                <div className="vp-settings-menu">
                  <button
                    className="vp-settings-item"
                    onClick={(e) => { e.stopPropagation(); setShowSpeedMenu(true); }}
                  >
                    Velocidad
                  </button>
                  <button
                    className="vp-settings-item"
                    onClick={(e) => { e.stopPropagation(); setShowPitchMenu(true); }}
                  >
                    Pitch
                  </button>
                </div>
              )}

              {showSpeedMenu && (
                <div className="vp-submenu">
                  <button
                    className="vp-submenu-back"
                    onClick={(e) => { e.stopPropagation(); setShowSpeedMenu(false); }}
                  >
                    &#8592; Atrás
                  </button>
                  {[0.5, 0.75, 1, 1.25, 1.5, 2].map((s) => (
                    <button
                      key={s}
                      className={`vp-settings-item ${s === speed ? 'active' : ''}`}
                      onClick={(e) => { e.stopPropagation(); setSpeed(s); }}
                    >
                      {s}x
                    </button>
                  ))}
                </div>
              )}

              {showPitchMenu && (
                <div className="vp-submenu">
                  <button
                    className="vp-submenu-back"
                    onClick={(e) => { e.stopPropagation(); setShowPitchMenu(false); }}
                  >
                    &#8592; Atrás
                  </button>
                  {[0.5, 0.75, 1, 1.25, 1.5, 2].map((p) => (
                    <button
                      key={p}
                      className={`vp-settings-item ${p === pitch ? 'active' : ''}`}
                      onClick={(e) => { e.stopPropagation(); setPitch(p); }}
                    >
                      {p}x
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button
              className="vp-icon-btn vp-fs-btn"
              onClick={(e) => { e.stopPropagation(); toggleFullscreen(); }}
            >
              <img
                src={isFullscreen ? ICONS.windowed : ICONS.fullscreen}
                alt="fullscreen"
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// Exponer la función para HTML
import ReactDOMClient from 'react-dom/client';

window.mountVideoPlayer = function (containerId, options) {
  const container = document.getElementById(containerId);
  if (!container) {
    console.error('No se encontró el contenedor:', containerId);
    return;
  }
  const root = ReactDOMClient.createRoot(container);
  root.render(<VideoPlayer {...options} />);
};