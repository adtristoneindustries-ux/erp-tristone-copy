import { useState, useEffect } from 'react';
import { Megaphone, User, Shield, Calendar, Clock } from 'lucide-react';
import Layout from '../components/Layout';
import { announcementAPI } from '../services/api';

const StudentAnnouncements = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [activeTab, setActiveTab] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const response = await announcementAPI.getAnnouncements();
      setAnnouncements(response.data || []);
    } catch (error) {
      console.error('Error fetching announcements:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredAnnouncements = announcements.filter(announcement => {
    if (activeTab === 'all') return true;
    return announcement.createdBy?.role === activeTab;
  });

  const getAnnouncementIcon = (role) => {
    return role === 'admin' ? <Shield className="w-5 h-5" /> : <User className="w-5 h-5" />;
  };

  const getAnnouncementColor = (role) => {
    return role === 'admin' 
      ? 'bg-red-50 border-red-200 text-red-800' 
      : 'bg-blue-50 border-blue-200 text-blue-800';
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <Layout>
        <div className="p-4 lg:p-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-4 lg:p-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div>
            <h1 className="text-xl lg:text-2xl font-bold flex items-center gap-2">
              <Megaphone className="text-blue-600" />
              Announcements
            </h1>
            <p className="text-gray-600 text-sm lg:text-base">Stay updated with latest news and updates</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-6 border-b">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2 font-medium border-b-2 transition-colors text-sm lg:text-base ${
              activeTab === 'all' 
                ? 'border-blue-500 text-blue-600' 
                : 'border-transparent text-gray-600 hover:text-blue-600'
            }`}
          >
            All Announcements
          </button>
          <button
            onClick={() => setActiveTab('admin')}
            className={`px-4 py-2 font-medium border-b-2 transition-colors flex items-center gap-2 text-sm lg:text-base ${
              activeTab === 'admin' 
                ? 'border-red-500 text-red-600' 
                : 'border-transparent text-gray-600 hover:text-red-600'
            }`}
          >
            <Shield size={16} />
            Admin Announcements
          </button>
          <button
            onClick={() => setActiveTab('staff')}
            className={`px-4 py-2 font-medium border-b-2 transition-colors flex items-center gap-2 text-sm lg:text-base ${
              activeTab === 'staff' 
                ? 'border-blue-500 text-blue-600' 
                : 'border-transparent text-gray-600 hover:text-blue-600'
            }`}
          >
            <User size={16} />
            Staff Announcements
          </button>
        </div>

        {/* Announcements List */}
        <div className="space-y-4">
          {filteredAnnouncements.length === 0 ? (
            <div className="text-center py-12">
              <Megaphone size={64} className="mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500 text-lg">No announcements found</p>
              <p className="text-gray-400 text-sm">Check back later for updates</p>
            </div>
          ) : (
            filteredAnnouncements.map((announcement) => (
              <div
                key={announcement._id}
                className={`border rounded-lg p-4 lg:p-6 transition-all hover:shadow-md ${getAnnouncementColor(announcement.createdBy?.role)}`}
              >
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    {getAnnouncementIcon(announcement.createdBy?.role)}
                    <span className="font-semibold text-sm lg:text-base">
                      {announcement.createdBy?.role === 'admin' ? 'Admin' : 'Staff'} Announcement
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs lg:text-sm text-gray-600">
                    <Calendar size={14} />
                    <span>{formatDate(announcement.createdAt)}</span>
                  </div>
                </div>

                {/* Title */}
                <h3 className="text-lg lg:text-xl font-bold mb-2 text-gray-800">
                  {announcement.title}
                </h3>

                {/* Content */}
                <p className="text-gray-700 text-sm lg:text-base leading-relaxed mb-3">
                  {announcement.content}
                </p>

                {/* Footer */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-3 border-t border-gray-200">
                  <div className="flex items-center gap-2 text-xs lg:text-sm text-gray-600">
                    <User size={14} />
                    <span>By: {announcement.createdBy?.name || 'Unknown'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs lg:text-sm text-gray-500">
                    <Clock size={14} />
                    <span>Posted {formatDate(announcement.createdAt)}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Summary Stats */}
        {announcements.length > 0 && (
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white rounded-lg p-4 text-center border">
              <div className="text-2xl font-bold text-gray-800">{announcements.length}</div>
              <div className="text-sm text-gray-600">Total Announcements</div>
            </div>
            <div className="bg-red-50 rounded-lg p-4 text-center border border-red-200">
              <div className="text-2xl font-bold text-red-600">
                {announcements.filter(a => a.createdBy?.role === 'admin').length}
              </div>
              <div className="text-sm text-red-800">Admin Announcements</div>
            </div>
            <div className="bg-blue-50 rounded-lg p-4 text-center border border-blue-200">
              <div className="text-2xl font-bold text-blue-600">
                {announcements.filter(a => a.createdBy?.role === 'staff').length}
              </div>
              <div className="text-sm text-blue-800">Staff Announcements</div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default StudentAnnouncements;