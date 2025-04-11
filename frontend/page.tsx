'use client';

import React, { useState, useCallback, useRef } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, Music, Link as LinkIcon, AlertCircle, Download } from 'lucide-react';

// Backend API URL - will be replaced during deployment
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export default function IdentifyPage() {
  const [file, setFile] = useState<File | null>(null);
  const [url, setUrl] = useState('');
  const [interval, setInterval] = useState(30);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tracks, setTracks] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('file');
  const [fileId, setFileId] = useState<string | null>(null);
  const [videoTitle, setVideoTitle] = useState<string | null>(null);

  // File input reference
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUrl(e.target.value);
    setError(null);
  };

  // Handle interval change
  const handleIntervalChange = (value: number[]) => {
    setInterval(value[0]);
  };

  // Format time (seconds to MM:SS)
  const formatTime = (seconds: number) => {
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
        throw new Error((data as any).error || 'Failed to identify tracks');
      }

      if ((data as any).success && (data as any).tracks) {
        setTracks((data as any).tracks);
        if ((data as any).file_id) {
          setFileId((data as any).file_id);
        }
      } else {
        throw new Error('No tracks identified');
      }
    } catch (err: any) {
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
        throw new Error((data as any).error || 'Failed to identify tracks');
      }

      if ((data as any).success && (data as any).tracks) {
        setTracks((data as any).tracks);
        if ((data as any).file_id) {
          setFileId((data as any).file_id);
        }
        if ((data as any).title) {
          setVideoTitle((data as any).title);
        }
      } else {
        throw new Error('No tracks identified');
      }
    } catch (err: any) {
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
            <Link
              href="/about"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
            >
              About
            </Link>
          </nav>
        </div>
      </header>
      <main className="flex-1 container py-8">
        <h1 className="text-3xl font-bold mb-6">Identify Tracks in DJ Sets</h1>
        
        <Tabs defaultValue="file" className="w-full" onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="file">Upload File</TabsTrigger>
            <TabsTrigger value="url">Enter URL</TabsTrigger>
          </TabsList>
          
          <TabsContent value="file" className="space-y-4">
            <div 
              onClick={handleFileAreaClick}
              className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors border-muted-foreground/25 hover:border-primary/50"
            >
              <input 
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="audio/*,video/*"
                className="hidden"
              />
              <div className="flex flex-col items-center gap-2">
                <Music className="h-10 w-10 text-muted-foreground" />
                <p className="text-lg font-medium">Click to select an audio file</p>
                <p className="text-sm text-muted-foreground">Supports MP3, WAV, OGG, FLAC, and video files</p>
              </div>
            </div>
            
            {file && (
              <div className="flex items-center gap-2 p-3 bg-muted rounded-md">
                <Music className="h-5 w-5" />
                <span className="flex-1 truncate">{file.name}</span>
                <span className="text-xs text-muted-foreground">
                  {(file.size / (1024 * 1024)).toFixed(2)} MB
                </span>
              </div>
            )}
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <label className="text-sm font-medium">Analysis Interval: {interval} seconds</label>
              </div>
              <Slider
                defaultValue={[30]}
                min={10}
                max={60}
                step={5}
                value={[interval]}
                onValueChange={handleIntervalChange}
              />
              <p className="text-xs text-muted-foreground">
                Set how often to check for new tracks (shorter intervals may identify more tracks but take longer to process)
              </p>
            </div>
            
            <Button 
              onClick={handleFileIdentify} 
              disabled={!file || isLoading} 
              className="w-full"
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Identify Tracks
            </Button>
          </TabsContent>
          
          <TabsContent value="url" className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Enter a YouTube, SoundCloud, or Mixcloud URL</label>
              <Input
                type="url"
                placeholder="https://www.youtube.com/watch?v=..."
                value={url}
                onChange={handleUrlChange}
              />
              <p className="text-xs text-muted-foreground">
                Paste a link to a DJ set from YouTube, SoundCloud, or Mixcloud
              </p>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <label className="text-sm font-medium">Analysis Interval: {interval} seconds</label>
              </div>
              <Slider
                defaultValue={[30]}
                min={10}
                max={60}
                step={5}
                value={[interval]}
                onValueChange={handleIntervalChange}
              />
              <p className="text-xs text-muted-foreground">
                Set how often to check for new tracks (shorter intervals may identify more tracks but take longer to process)
              </p>
            </div>
            
            <Button 
              onClick={handleUrlIdentify} 
              disabled={!url || isLoading} 
              className="w-full"
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Identify Tracks
            </Button>
          </TabsContent>
        </Tabs>
        
        {error && (
          <Alert variant="destructive" className="mt-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {tracks.length > 0 && (
          <div className="mt-8 space-y-4">
            <h2 className="text-2xl font-bold">Identified Tracks</h2>
            <div className="grid gap-4">
              {tracks.map((track, index) => (
                <Card key={index}>
                  <CardContent className="p-4">
                    <div className="flex flex-col md:flex-row md:items-center gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-muted-foreground">
                            {track.timestamp || formatTime(track.timestamp_seconds || track.start_time)}
                          </span>
                          <h3 className="text-lg font-semibold">{track.title}</h3>
                        </div>
                        <p className="text-muted-foreground">{track.artist}</p>
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
                      <Button variant="outline" size="sm" className="shrink-0">
                        <LinkIcon className="mr-2 h-4 w-4" />
                        Find on Beatport
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            <div className="flex justify-between mt-6">
              <div className="flex gap-2">
                <Button variant="outline">
                  Export Tracklist
                </Button>
                {fileId && activeTab === 'url' && (
                  <Button variant="outline" onClick={handleDownload}>
                    <Download className="mr-2 h-4 w-4" />
                    Download as MP4
                  </Button>
                )}
              </div>
              <Button>
                Buy All Tracks on Beatport
              </Button>
            </div>
          </div>
        )}
      </main>
      <footer className="border-t py-6 md:py-0">
        <div className="container flex flex-col items-center justify-between gap-4 md:h-16 md:flex-row">
          <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
            © 2025 DJTrackSpotter. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
