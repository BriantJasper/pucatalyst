import React, { useState, useEffect } from 'react';
import { User, Mail, Shield, Camera } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import FaceAuthSettings from '../components/FaceAuthSettings';
import api from '../lib/axios';

/**
 * EXAMPLE: Profile Settings Page with Face Authentication
 * 
 * You can integrate the FaceAuthSettings component into your existing profile page
 * or create a dedicated settings page like this example.
 */

export default function ProfileSettingsExample() {
  const { user: authUser, setAuth } = useAuthStore();
  const [user, setUser] = useState(authUser);
  const [activeTab, setActiveTab] = useState('profile');

  useEffect(() => {
    // Fetch latest user data
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const response = await api.get('/auth/me');
      setUser(response.data);
      setAuth(response.data, localStorage.getItem('access_token'));
    } catch (error) {
      console.error('Failed to fetch user data:', error);
    }
  };

  const handleUserUpdate = (updatedUser) => {
    setUser(updatedUser);
    setAuth(updatedUser, localStorage.getItem('access_token'));
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-5xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600 mt-2">Manage your account settings and preferences</p>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('profile')}
              className={`px-6 py-4 font-medium transition ${
                activeTab === 'profile'
                  ? 'text-primary-600 border-b-2 border-primary-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <div className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Profile
              </div>
            </button>
            <button
              onClick={() => setActiveTab('security')}
              className={`px-6 py-4 font-medium transition ${
                activeTab === 'security'
                  ? 'text-primary-600 border-b-2 border-primary-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Security
              </div>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-6">
          {activeTab === 'profile' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Profile Information</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={user?.name || ''}
                    readOnly
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      value={user?.email || ''}
                      readOnly
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg bg-gray-50"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Role
                  </label>
                  <input
                    type="text"
                    value={user?.role || ''}
                    readOnly
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 capitalize"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-6">
              {/* Password Section */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Password</h2>
                <p className="text-gray-600 mb-4">Update your password to keep your account secure</p>
                <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition">
                  Change Password
                </button>
              </div>

              {/* Face Authentication Section */}
              <FaceAuthSettings 
                user={user} 
                onUpdate={handleUserUpdate}
              />

              {/* Two-Factor Authentication (Other methods) */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Other Security Options</h2>
                <p className="text-gray-600 mb-4">Additional security features coming soon</p>
                <div className="text-sm text-gray-500">
                  • SMS Authentication
                  <br />
                  • Email Verification
                  <br />
                  • Login History
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
