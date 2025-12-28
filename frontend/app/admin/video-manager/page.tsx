'use client';
import { ENV_CONFIG } from '@/lib/env-config';

import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';

interface CTAVideo {
  id?: number;
  videoUrl: string;
  title: string;
  description: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export default function VideoManagerPage() {
  const [videos, setVideos] = useState<CTAVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingVideo, setEditingVideo] = useState<CTAVideo | null>(null);
  const [formData, setFormData] = useState<CTAVideo>({
    videoUrl: '',
    title: '',
    description: '',
    isActive: true
  });

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const url = editingVideo
        ? `http://localhost:8080/api/site-settings/cta-video/${editingVideo.id}`
        : 'http://localhost:8080/api/site-settings/cta-video';

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
      isActive: true
    });
    setEditingVideo(null);
    setShowForm(false);
  };

  const startEdit = (video: CTAVideo) => {
    setEditingVideo(video);
    setFormData({
      videoUrl: video.videoUrl,
      title: video.title,
      description: video.description,
      isActive: video.isActive
    });
    setShowForm(true);
  };

  const getVideoPreview = (url: string) => {
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      const videoId = extractYouTubeId(url);
      return videoId ? `https://img.youtube.com/vi/${videoId}/mqdefault.jpg` : null;
    }
    return null;
  };

  const extractYouTubeId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-500">Loading videos...</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">CTA Video Manager</h1>
          <p className="text-sm text-gray-600 mt-1">Manage advertisement videos for the homepage CTA section</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700"
        >
          Add New Video
        </button>
      </div>

      {/* Video Form */}
      {showForm && (
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">
            {editingVideo ? 'Edit Video' : 'Add New Video'}
          </h2>
          <form onSubmit={handleSubmit}>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Video URL <span className="text-red-500">*</span>
                </label>
                <input
                  type="url"
                  value={formData.videoUrl}
                  onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  placeholder="https://www.youtube.com/watch?v=... or direct video URL"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Supports YouTube, Vimeo, or direct video file URLs (MP4, WebM)
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  placeholder="Video title"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  placeholder="Brief description"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="mr-2"
                />
                <label htmlFor="isActive" className="text-sm text-gray-700">
                  Active (Show on homepage)
                </label>
              </div>
            </div>

            <div className="mt-4 flex gap-2">
              <button
                type="submit"
                className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700"
              >
                {editingVideo ? 'Update Video' : 'Add Video'}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Videos List */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {videos.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No videos added yet. Click "Add New Video" to get started.
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Preview
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  URL
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {videos.map((video) => (
                <tr key={video.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getVideoPreview(video.videoUrl) ? (
                      <img
                        src={getVideoPreview(video.videoUrl)!}
                        alt={video.title}
                        className="w-20 h-12 object-cover rounded"
                      />
                    ) : (
                      <div className="w-20 h-12 bg-gray-200 rounded flex items-center justify-center text-xs text-gray-500">
                        Video
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{video.title}</div>
                      {video.description && (
                        <div className="text-sm text-gray-500">{video.description}</div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-500 truncate max-w-xs" title={video.videoUrl}>
                      {video.videoUrl}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => handleToggleActive(video)}
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        video.isActive
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {video.isActive ? 'Active' : 'Inactive'}
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

      <div className="mt-6 bg-emerald-50 border border-emerald-200 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-emerald-900 mb-2">Video Guidelines:</h3>
        <ul className="text-sm text-emerald-700 space-y-1">
          <li>• Only one video can be active at a time on the homepage</li>
          <li>• Recommended video aspect ratio: 16:9</li>
          <li>• YouTube and Vimeo URLs will be automatically embedded</li>
          <li>• For direct video files, use MP4 or WebM format for best compatibility</li>
          <li>• Keep videos under 100MB for direct uploads</li>
        </ul>
      </div>
    </div>
  );
}