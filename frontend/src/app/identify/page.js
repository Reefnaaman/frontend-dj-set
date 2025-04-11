'use client';

import React, { useState, useCallback, useRef } from 'react';
import Link from 'next/link';

// Backend API URL - will be replaced during deployment
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export default function IdentifyPage() {
  const [file, setFile] = useState(null);
  const [url, setUrl] = useState('');
  const [interval, setInterval] = useState(30);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [tracks, setTracks] = useState([]);
  const [activeTab, setActiveTab] = useState('file');
  const [fileId, setFileId] = useState(null);
  const [videoTitle, setVideoTitle] = useState(null);

  // File input reference
  const fileInputRef = useRef(null);
  
  // Handle file selection
  const handleFileChange = (e) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setFile(files[0]);
      setError(null);
    }
  };
  
  // Handle file drop area click
  const handleFileAreaClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Handle URL input change
  const handleUrlChange = (e) => {
    setUrl(e.target.value);
    setError(null);
  };

  // Handle interval change
  const handleIntervalChange = (e) => {
    setInterval(parseInt(e.target.value));
  };

  // Format time (seconds to MM:SS)
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Handle file upload and identification
  const handleFileIdentify = async () => {
    if (!file) {
      setError('Please select a file to upload');
      return;
    }

    setIsLoading(true);
    setError(null);
    setTracks([]);
    setFileId(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('interval', interval.toString());

      const response = await fetch(`${API_URL}/api/identify`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to identify tracks');
      }

      if (data.success && data.tracks) {
        setTracks(data.tracks);
        if (data.file_id) {
          setFileId(data.file_id);
        }
      } else {
        throw new Error('No tracks identified');
      }
    } catch (err) {
      setError(err.message || 'An error occurred while identifying tracks');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle URL identification
  const handleUrlIdentify = async () => {
    if (!url) {
      setError('Please enter a URL');
      return;
    }

    // Basic URL validation
    const urlPattern = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be|soundcloud\.com|mixcloud\.com)/i;
    if (!urlPattern.test(url)) {
      setError('Please enter a valid YouTube, SoundCloud, or Mixcloud URL');
      return;
    }

    setIsLoading(true);
    setError(null);
    setTracks([]);
    setFileId(null);
    setVideoTitle(null);

    try {
      const response = await fetch(`${API_URL}/api/identify-url`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url,
          interval,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to identify tracks');
      }

      if (data.success && data.tracks) {
        setTracks(data.tracks);
        if (data.file_id) {
          setFileId(data.file_id);
        }
        if (data.title) {
          setVideoTitle(data.title);
        }
      } else {
        throw new Error('No tracks identified');
      }
    } catch (err) {
      setError(err.message || 'An error occurred while identifying tracks');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle download as MP4
  const handleDownload = () => {
    if (!fileId) return;
    
    // Create download link
    const downloadUrl = `${API_URL}/api/download/${fileId}`;
    
    // Create a temporary anchor element and trigger download
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = videoTitle ? `${videoTitle}.mp4` : 'djtrackspotter_download.mp4';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center">
          <div className="mr-4 flex">
            <Link href="/" className="flex items-center space-x-2">
              <span className="font-bold text-xl">DJTrackSpotter</span>
            </Link>
          </div>
          <nav className="flex items-center space-x-4 lg:space-x-6 mx-6">
            <Link
              href="/"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
            >
              Home
            </Link>
            <Link
              href="/identify"
              className="text-sm font-medium transition-colors hover:text-primary"
            >
              Identify
            </Link>
          </nav>
        </div>
      </header>
      <main className="flex-1 container py-8">
        <h1 className="text-3xl font-bold mb-6">Identify Tracks in DJ Sets</h1>
        
        <div className="mb-6">
          <div className="flex border-b">
            <button
              onClick={() => setActiveTab('file')}
              className={`px-4 py-2 ${activeTab === 'file' ? 'border-b-2 border-blue-500 font-medium' : 'text-gray-500'}`}
            >
              Upload File
            </button>
            <button
              onClick={() => setActiveTab('url')}
              className={`px-4 py-2 ${activeTab === 'url' ? 'border-b-2 border-blue-500 font-medium' : 'text-gray-500'}`}
            >
              Enter URL
            </button>
          </div>
          
          {activeTab === 'file' && (
            <div className="mt-4 space-y-4">
              <div 
                onClick={handleFileAreaClick}
                className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:bg-gray-50"
              >
                <input 
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="audio/*,video/*"
                  className="hidden"
                />
                <div className="flex flex-col items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-10 w-10 text-gray-400">
                    <path d="M9 18V5l12-2v13"></path>
                    <circle cx="6" cy="18" r="3"></circle>
                    <circle cx="18" cy="16" r="3"></circle>
                  </svg>
                  <p className="text-lg font-medium">Click to select an audio file</p>
                  <p className="text-sm text-gray-500">Supports MP3, WAV, OGG, FLAC, and video files</p>
                </div>
              </div>
              
              {file && (
                <div className="flex items-center gap-2 p-3 bg-gray-100 rounded-md">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                    <path d="M9 18V5l12-2v13"></path>
                    <circle cx="6" cy="18" r="3"></circle>
                    <circle cx="18" cy="16" r="3"></circle>
                  </svg>
                  <span className="flex-1 truncate">{file.name}</span>
                  <span className="text-xs text-gray-500">
                    {(file.size / (1024 * 1024)).toFixed(2)} MB
                  </span>
                </div>
              )}
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <label className="text-sm font-medium">Analysis Interval: {interval} seconds</label>
                </div>
                <input
                  type="range"
                  min="10"
                  max="60"
                  step="5"
                  value={interval}
                  onChange={handleIntervalChange}
                  className="w-full"
                />
                <p className="text-xs text-gray-500">
                  Set how often to check for new tracks (shorter intervals may identify more tracks but take longer to process)
                </p>
              </div>
              
              <button 
                onClick={handleFileIdentify} 
                disabled={!file || isLoading} 
                className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {isLoading ? 'Processing...' : 'Identify Tracks'}
              </button>
            </div>
          )}
          
          {activeTab === 'url' && (
            <div className="mt-4 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Enter a YouTube, SoundCloud, or Mixcloud URL</label>
                <input
                  type="url"
                  placeholder="https://www.youtube.com/watch?v=..."
                  value={url}
                  onChange={handleUrlChange}
                  className="w-full p-2 border rounded-md"
                />
                <p className="text-xs text-gray-500">
                  Paste a link to a DJ set from YouTube, SoundCloud, or Mixcloud
                </p>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <label className="text-sm font-medium">Analysis Interval: {interval} seconds</label>
                </div>
                <input
                  type="range"
                  min="10"
                  max="60"
                  step="5"
                  value={interval}
                  onChange={handleIntervalChange}
                  className="w-full"
                />
                <p className="text-xs text-gray-500">
                  Set how often to check for new tracks (shorter intervals may identify more tracks but take longer to process)
                </p>
              </div>
              
              <button 
                onClick={handleUrlIdentify} 
                disabled={!url || isLoading} 
                className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {isLoading ? 'Processing...' : 'Identify Tracks'}
              </button>
            </div>
          )}
        </div>
        
        {error && (
          <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-md text-red-600">
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 mr-2">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
              <h3 className="font-medium">Error</h3>
            </div>
            <p className="mt-1">{error}</p>
          </div>
        )}
        
        {tracks.length > 0 && (
          <div className="mt-8 space-y-4">
            <h2 className="text-2xl font-bold">Identified Tracks</h2>
            <div className="grid gap-4">
              {tracks.map((track, index) => (
                <div key={index} className="border rounded-lg p-4 shadow-sm">
                  <div className="flex flex-col md:flex-row md:items-center gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-500">
                          {track.timestamp || formatTime(track.timestamp_seconds || track.start_time)}
                        </span>
                        <h3 className="text-lg font-semibold">{track.title}</h3>
                      </div>
                      <p className="text-gray-600">{track.artist}</p>
                      {(track.year || track.album) && (
                        <div className="flex gap-2 mt-1 text-sm">
                          {track.year && <span>{track.year}</span>}
                          {track.album && (
                            <>
                              <span>•</span>
                              <span>{track.album}</span>
                            </>
                          )}
                          {track.genre && (
                            <>
                              <span>•</span>
                              <span>{track.genre}</span>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                    <button className="shrink-0 py-1 px-3 border rounded-md flex items-center text-sm">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 mr-2">
                        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
                        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
                      </svg>
                      Find on Beatport
                    </button>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="flex justify-between mt-6">
              <div className="flex gap-2">
                <button className="py-2 px-4 border rounded-md">
                  Export Tracklist
                </button>
                {fileId && activeTab === 'url' && (
                  <button className="py-2 px-4 border rounded-md flex items-center" onClick={handleDownload}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 mr-2">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                      <polyline points="7 10 12 15 17 10"></polyline>
                      <line x1="12" y1="15" x2="12" y2="3"></line>
                    </svg>
                    Download as MP4
                  </button>
                )}
              </div>
              <button className="py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                Buy All Tracks on Beatport
              </button>
            </div>
          </div>
        )}
      </main>
      <footer className="border-t py-6 md:py-0">
        <div className="container flex flex-col items-center justify-between gap-4 md:h-16 md:flex-row">
          <p className="text-center text-sm leading-loose text-gray-500 md:text-left">
            © 2025 DJTrackSpotter. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
