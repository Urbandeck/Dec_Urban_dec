'use client';
import { ENV_CONFIG } from '@/lib/env-config';

import { useState, useEffect, useRef, useCallback } from 'react';
import { toast } from 'react-hot-toast';

interface CTAVideo {
  id?: number;
  videoUrl: string;
  title: string;
  description: string;
  active: boolean;
  storageType?: string;
  fileName?: string;
  mimeType?: string;
  fileSize?: number;
  createdAt?: string;
  updatedAt?: string;
}

type InputMode = 'url' | 'upload';

export default function VideoManagerPage() {
  const [videos, setVideos] = useState<CTAVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingVideo, setEditingVideo] = useState<CTAVideo | null>(null);
  const [inputMode, setInputMode] = useState<InputMode>('upload');
  const [formData, setFormData] = useState<CTAVideo>({
    videoUrl: '',
    title: '',
    description: '',
    active: true
  });

  // File upload state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    try {
      const response = await fetch(`${ENV_CONFIG.API_URL}/api/site-settings/cta-videos`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setVideos(data);
      }
    } catch (error) {
      toast.error('Failed to load videos');
    } finally {
      setLoading(false);
    }
  };

  const handleUrlSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const url = editingVideo
        ? `${ENV_CONFIG.API_URL}/api/site-settings/cta-video/${editingVideo.id}`
        : `${ENV_CONFIG.API_URL}/api/site-settings/cta-video`;

      const method = editingVideo ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        toast.success(editingVideo ? 'Video updated successfully' : 'Video added successfully');
        fetchVideos();
        resetForm();
      } else {
        toast.error('Failed to save video');
      }
    } catch (error) {
      toast.error('Error saving video');
    }
  };

  const handleFileUpload = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedFile) {
      toast.error('Please select a video file');
      return;
    }

    if (!formData.title.trim()) {
      toast.error('Please enter a title');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    const form = new FormData();
    form.append('file', selectedFile);
    form.append('title', formData.title);
    form.append('description', formData.description);
    form.append('isActive', String(formData.active));

    try {
      const xhr = new XMLHttpRequest();

      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          const percent = Math.round((event.loaded / event.total) * 100);
          setUploadProgress(percent);
        }
      });

      const result = await new Promise<{ ok: boolean; data?: CTAVideo; error?: string }>((resolve) => {
        xhr.onload = () => {
          if (xhr.status === 201) {
            resolve({ ok: true, data: JSON.parse(xhr.responseText) });
          } else {
            let errorMsg = 'Upload failed';
            try {
              const err = JSON.parse(xhr.responseText);
              errorMsg = err.error || errorMsg;
            } catch { /* ignore */ }
            resolve({ ok: false, error: errorMsg });
          }
        };
        xhr.onerror = () => resolve({ ok: false, error: 'Network error during upload' });

        xhr.open('POST', `${ENV_CONFIG.API_URL}/api/site-settings/cta-video/upload`);
        xhr.setRequestHeader('Authorization', `Bearer ${localStorage.getItem('adminToken')}`);
        xhr.send(form);
      });

      if (result.ok) {
        toast.success('Video uploaded successfully');
        fetchVideos();
        resetForm();
      } else {
        toast.error(result.error || 'Failed to upload video');
      }
    } catch (error) {
      toast.error('Error uploading video');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this video?')) return;

    try {
      const response = await fetch(`${ENV_CONFIG.API_URL}/api/site-settings/cta-video/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      });

      if (response.ok) {
        toast.success('Video deleted successfully');
        fetchVideos();
      } else {
        toast.error('Failed to delete video');
      }
    } catch (error) {
      toast.error('Error deleting video');
    }
  };

  const handleToggleActive = async (video: CTAVideo) => {
    try {
      const response = await fetch(`${ENV_CONFIG.API_URL}/api/site-settings/cta-video/${video.id}/toggle`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      });

      if (response.ok) {
        toast.success('Video status updated');
        fetchVideos();
      } else {
        toast.error('Failed to update status');
      }
    } catch (error) {
      toast.error('Error updating status');
    }
  };

  const resetForm = () => {
    setFormData({
      videoUrl: '',
      title: '',
      description: '',
      active: true
    });
    setEditingVideo(null);
    setShowForm(false);
    setSelectedFile(null);
    setUploadProgress(0);
    setIsUploading(false);
    setInputMode('upload');
  };

  const startEdit = (video: CTAVideo) => {
    setEditingVideo(video);
    setFormData({
      videoUrl: video.videoUrl,
      title: video.title,
      description: video.description,
      active: video.active
    });
    setInputMode('url');
    setShowForm(true);
  };

  const handleFileSelect = (file: File) => {
    const allowedTypes = ['video/mp4', 'video/webm'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Only MP4 and WebM files are allowed');
      return;
    }
    const maxSize = 500 * 1024 * 1024; // 500MB
    if (file.size > maxSize) {
      toast.error('File size exceeds 500MB limit');
      return;
    }
    setSelectedFile(file);
    // Auto-fill title from filename if empty
    if (!formData.title) {
      const name = file.name.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' ');
      setFormData(prev => ({ ...prev, title: name }));
    }
  };

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  }, [formData.title]);

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    return (bytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB';
  };

  const getVideoPreview = (url: string) => {
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      const videoId = extractYouTubeId(url);
      return videoId ? `https://img.youtube.com/vi/${videoId}/mqdefault.jpg` : null;
    }
    return null;
  };

  const extractYouTubeId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|shorts\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-slate-400">Loading videos...</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">CTA Video Manager</h1>
          <p className="text-sm text-slate-500 mt-1">Manage advertisement videos for the homepage CTA section</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-amber-500 text-white px-4 py-2 rounded-lg hover:bg-amber-600"
        >
          Add New Video
        </button>
      </div>

      {/* Video Form */}
      {showForm && (
        <div className="bg-white rounded-2xl border border-stone-200 p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">
            {editingVideo ? 'Edit Video' : 'Add New Video'}
          </h2>

          {/* Mode Toggle - only show for new videos */}
          {!editingVideo && (
            <div className="flex mb-4 bg-stone-100 rounded-lg p-1 w-fit">
              <button
                type="button"
                onClick={() => { setInputMode('upload'); setSelectedFile(null); }}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  inputMode === 'upload'
                    ? 'bg-white text-slate-800 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                Upload File
              </button>
              <button
                type="button"
                onClick={() => { setInputMode('url'); setSelectedFile(null); }}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  inputMode === 'url'
                    ? 'bg-white text-slate-800 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                Paste URL
              </button>
            </div>
          )}

          <form onSubmit={inputMode === 'upload' && !editingVideo ? handleFileUpload : handleUrlSubmit}>
            <div className="grid md:grid-cols-2 gap-4">

              {/* File Upload Zone */}
              {inputMode === 'upload' && !editingVideo && (
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-600 mb-2">
                    Video File <span className="text-red-500">*</span>
                  </label>

                  {!selectedFile ? (
                    <div
                      onDragEnter={handleDrag}
                      onDragLeave={handleDrag}
                      onDragOver={handleDrag}
                      onDrop={handleDrop}
                      onClick={() => fileInputRef.current?.click()}
                      className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                        dragActive
                          ? 'border-amber-500 bg-amber-50'
                          : 'border-stone-300 hover:border-amber-400 hover:bg-stone-50'
                      }`}
                    >
                      <svg className="mx-auto h-12 w-12 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      <p className="mt-2 text-sm text-slate-600">
                        <span className="font-medium text-amber-600">Click to upload</span> or drag and drop
                      </p>
                      <p className="mt-1 text-xs text-slate-400">MP4 or WebM, max 500MB</p>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="video/mp4,video/webm"
                        onChange={(e) => {
                          if (e.target.files?.[0]) handleFileSelect(e.target.files[0]);
                        }}
                        className="hidden"
                      />
                    </div>
                  ) : (
                    <div className="border border-stone-200 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                            <svg className="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-slate-700">{selectedFile.name}</p>
                            <p className="text-xs text-slate-400">{formatFileSize(selectedFile.size)}</p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setSelectedFile(null)}
                          className="text-slate-400 hover:text-red-500"
                        >
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>

                      {/* Video Preview */}
                      <div className="mt-3">
                        <video
                          src={URL.createObjectURL(selectedFile)}
                          controls
                          className="w-full max-h-48 rounded-lg bg-black"
                        />
                      </div>

                      {/* Upload Progress */}
                      {isUploading && (
                        <div className="mt-3">
                          <div className="flex justify-between text-xs text-slate-500 mb-1">
                            <span>Uploading...</span>
                            <span>{uploadProgress}%</span>
                          </div>
                          <div className="w-full bg-stone-200 rounded-full h-2">
                            <div
                              className="bg-amber-500 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${uploadProgress}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* URL Input */}
              {(inputMode === 'url' || editingVideo) && (
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-600 mb-2">
                    Video URL <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="url"
                    value={formData.videoUrl}
                    onChange={(e) => {
                      let url = e.target.value;
                      // Auto-convert YouTube Shorts URL to regular watch URL for better embed support
                      const shortsMatch = url.match(/youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/);
                      if (shortsMatch) {
                        url = `https://www.youtube.com/watch?v=${shortsMatch[1]}`;
                      }
                      setFormData({ ...formData, videoUrl: url });
                    }}
                    className="w-full border border-stone-200 rounded-lg px-3 py-2"
                    placeholder="https://www.youtube.com/watch?v=... or direct video URL"
                    required
                  />
                  <p className="text-xs text-slate-400 mt-1">
                    Supports YouTube, Vimeo, or direct video file URLs (MP4, WebM)
                  </p>
                  {formData.videoUrl.includes('/shorts/') && (
                    <p className="text-xs text-amber-600 mt-1 font-medium">
                      YouTube Shorts URLs will be auto-converted to regular format for embedding.
                    </p>
                  )}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-600 mb-2">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full border border-stone-200 rounded-lg px-3 py-2"
                  placeholder="Video title"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-600 mb-2">
                  Description
                </label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full border border-stone-200 rounded-lg px-3 py-2"
                  placeholder="Brief description"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="active"
                  checked={formData.active}
                  onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                  className="mr-2"
                />
                <label htmlFor="active" className="text-sm text-slate-600">
                  Active (Show on homepage)
                </label>
              </div>
            </div>

            <div className="mt-4 flex gap-2">
              <button
                type="submit"
                disabled={isUploading}
                className={`text-white px-4 py-2 rounded-lg ${
                  isUploading
                    ? 'bg-amber-300 cursor-not-allowed'
                    : 'bg-amber-500 hover:bg-amber-600'
                }`}
              >
                {isUploading
                  ? 'Uploading...'
                  : editingVideo
                    ? 'Update Video'
                    : inputMode === 'upload'
                      ? 'Upload Video'
                      : 'Add Video'}
              </button>
              <button
                type="button"
                onClick={resetForm}
                disabled={isUploading}
                className="bg-gray-300 text-slate-600 px-4 py-2 rounded-lg hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Videos List */}
      <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden">
        {videos.length === 0 ? (
          <div className="p-8 text-center text-slate-400">
            No videos added yet. Click &quot;Add New Video&quot; to get started.
          </div>
        ) : (
          <table className="min-w-full divide-y divide-stone-200">
            <thead className="bg-stone-100">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                  Preview
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                  Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                  Source
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-stone-200">
              {videos.map((video) => (
                <tr key={video.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getVideoPreview(video.videoUrl) ? (
                      <img
                        src={getVideoPreview(video.videoUrl)!}
                        alt={video.title}
                        className="w-20 h-12 object-cover rounded"
                      />
                    ) : video.storageType === 'FILESYSTEM' ? (
                      <div className="w-20 h-12 bg-amber-100 rounded flex items-center justify-center">
                        <svg className="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                    ) : (
                      <div className="w-20 h-12 bg-stone-200 rounded flex items-center justify-center text-xs text-slate-400">
                        Video
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-slate-800">{video.title}</div>
                      {video.description && (
                        <div className="text-sm text-slate-400">{video.description}</div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {video.storageType === 'FILESYSTEM' ? (
                      <div>
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 mb-1">
                          Uploaded File
                        </span>
                        {video.fileName && (
                          <div className="text-xs text-slate-400 truncate max-w-xs">{video.fileName}</div>
                        )}
                        {video.fileSize && (
                          <div className="text-xs text-slate-400">{formatFileSize(video.fileSize)}</div>
                        )}
                      </div>
                    ) : (
                      <div>
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800 mb-1">
                          URL
                        </span>
                        <div className="text-xs text-slate-400 truncate max-w-xs" title={video.videoUrl}>
                          {video.videoUrl}
                        </div>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => handleToggleActive(video)}
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        video.active
                          ? 'bg-green-100 text-green-800'
                          : 'bg-stone-100 text-slate-700'
                      }`}
                    >
                      {video.active ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => startEdit(video)}
                      className="text-indigo-600 hover:text-indigo-900 mr-3"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(video.id!)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-blue-900 mb-2">Video Guidelines:</h3>
        <ul className="text-sm text-amber-700 space-y-1">
          <li>&#8226; Only one video can be active at a time on the homepage</li>
          <li>&#8226; <strong>Upload File:</strong> Upload MP4 or WebM files directly (max 500MB)</li>
          <li>&#8226; <strong>Paste URL:</strong> YouTube, Vimeo, or direct video URLs are supported</li>
          <li>&#8226; <strong>YouTube Shorts:</strong> Shorts URLs are auto-converted to regular format</li>
          <li>&#8226; Recommended video aspect ratio: 16:9</li>
          <li>&#8226; Uploaded files are stored on the server and served via nginx for fast streaming</li>
        </ul>
      </div>
    </div>
  );
}
