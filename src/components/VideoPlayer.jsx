import React, { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';
import dashjs from 'dashjs';
import '../styles.css';

const ICONS = {
  play: 'https://static.solargentinotv.com.ar/mplayer-normal/icons/svg/play.svg',
  pause:
    'https://static.solargentinotv.com.ar/mplayer-normal/icons/svg/pause.svg',
  fullscreen:
    'https://static.solargentinotv.com.ar/mplayer-normal/icons/svg/fullscreen.svg',
  windowed:
    'https://static.solargentinotv.com.ar/mplayer-normal/icons/svg/windowed.svg',
  settings:
    'https://static.solargentinotv.com.ar/mplayer-normal/icons/svg/settings.svg',
  mute: 'https://static.solargentinotv.com.ar/mplayer-normal/icons/svg/volume/mute.svg',
  vol0: 'https://static.solargentinotv.com.ar/mplayer-normal/icons/svg/volume/vol0.svg',
  vol1: 'https://static.solargentinotv.com.ar/mplayer-normal/icons/svg/volume/vol1.svg',
  vol2: 'https://static.solargentinotv.com.ar/mplayer-normal/icons/svg/volume/vol2.svg',
};

export default function VideoPlayer({ src, poster, className = '' }) {
  const videoRef = useRef(null);
  const containerRef = useRef(null);

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

  // Cargar fuente según tipo
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (src.endsWith('.m3u8') && Hls.isSupported()) {
      const hls = new Hls();
      hls.loadSource(src);
      hls.attachMedia(video);
      return () => hls.destroy();
    } else if (src.endsWith('.mpd')) {
      const player = dashjs.MediaPlayer().create();
      player.initialize(video, src, false);
      return () => player.reset();
    } else {
      video.src = src;
    }
  }, [src]);

  // Sincronizar estado
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = muted;
    v.volume = volume;
    v.playbackRate = speed;
    v.preservesPitch = pitch;
  }, [muted, volume, speed, pitch]);

  // Eventos del video
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

  const togglePlay = async () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) {
      try {
        await v.play();
      } catch (err) {
        console.warn(err);
      }
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

  const formatTime = (t) => {
    if (!isFinite(t)) return '0:00';
    const m = Math.floor(t / 60);
    const s = Math.floor(t % 60);
    return `${m}:${String(s).padStart(2, '0')}`;
  };

  const volumeIcon = () => {
    if (muted || volume === 0) return ICONS.mute;
    if (volume <= 0.33) return ICONS.vol0;
    if (volume <= 0.66) return ICONS.vol1;
    return ICONS.vol2;
  };

  return (
    <div ref={containerRef} className={`vp-container ${className}`}>
      <video ref={videoRef} poster={poster} className="vp-video" />

      <div className="vp-overlay">
        {/* Barra de progreso */}
        <div className="vp-progress-bar">
          <div className="vp-progress-bg" />
          <div
            className="vp-progress-fill"
            style={{ width: `${(currentTime / duration) * 100}%` }}
          />
          <div
            className="vp-progress-handle"
            style={{ left: `${(currentTime / duration) * 100}%` }}
          />
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
        </div>

        {/* Controles */}
        <div className="vp-controls">
          <div className="vp-left">
            <button className="vp-icon-btn vp-play-btn" onClick={togglePlay}>
              <img
                src={isPlaying ? ICONS.pause : ICONS.play}
                alt="play/pause"
              />
            </button>

            <div className="vp-volume-wrapper">
              <button
                className="vp-icon-btn vp-volume-btn"
                onClick={() => setMuted(!muted)}
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

            <div className="vp-time">
              {formatTime(currentTime)} / {formatTime(duration)}
            </div>
          </div>

          <div className="vp-right">
            {/* Settings */}
            <div className="vp-settings-btn">
              <button
                className="vp-icon-btn"
                onClick={() => setShowSettings((s) => !s)}
              >
                <img src={ICONS.settings} alt="settings" />
              </button>

              {showSettings && !showSpeedMenu && !showPitchMenu && (
                <div className="vp-settings-menu">
                  <button
                    className="vp-settings-item"
                    onClick={() => setShowSpeedMenu(true)}
                  >
                    Velocidad
                  </button>
                  <button
                    className="vp-settings-item"
                    onClick={() => setShowPitchMenu(true)}
                  >
                    Pitch
                  </button>
                </div>
              )}

              {showSpeedMenu && (
                <div className="vp-submenu">
                  <button
                    className="vp-submenu-back"
                    onClick={() => setShowSpeedMenu(false)}
                  >
                    &#8592; Atrás
                  </button>
                  {[0.5, 0.75, 1, 1.25, 1.5, 2].map((s) => (
                    <button
                      key={s}
                      className={`vp-settings-item ${
                        s === speed ? 'active' : ''
                      }`}
                      onClick={() => setSpeed(s)}
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
                    onClick={() => setShowPitchMenu(false)}
                  >
                    &#8592; Atrás
                  </button>
                  {[0.5, 0.75, 1, 1.25, 1.5, 2].map((p) => (
                    <button
                      key={p}
                      className={`vp-settings-item ${
                        p === pitch ? 'active' : ''
                      }`}
                      onClick={() => setPitch(p)}
                    >
                      {p}x
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button
              className="vp-icon-btn vp-fs-btn"
              onClick={toggleFullscreen}
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