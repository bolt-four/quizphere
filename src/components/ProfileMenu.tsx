import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { UserCircle, LogOut, Lock } from 'lucide-react';
import { toast } from './ui/toast';
import Modal from './Modal';

interface PasswordChangeFormData {
  newPassword: string;
  confirmPassword: string;
}

export default function ProfileMenu() {
  const navigate = useNavigate();
  const { userId, accessToken, logout } = useAuthStore();
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [formData, setFormData] = useState<PasswordChangeFormData>({
    newPassword: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.newPassword !== formData.confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match",
        variant: "destructive"
      });
      return;
    }

    if (formData.newPassword.length < 6) {
      toast({
        title: "Error",
        description: "Password must be at least 6 characters long",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`http://localhost:8001/users/${userId}/password?new_password=${encodeURIComponent(formData.newPassword)}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Password updated successfully",
        });
        setShowPasswordModal(false);
        setFormData({ newPassword: '', confirmPassword: '' });
      } else {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to update password');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : 'Failed to update password',
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative group/menu">
      <button className="p-2 hover:bg-gray-100 rounded-full">
        <UserCircle className="w-6 h-6 text-gray-600" />
      </button>

      <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 
        opacity-0 invisible group-hover/menu:visible group-hover/menu:opacity-100 
        transition-all duration-200 ease-in-out 
        hover:visible hover:opacity-100">
        <button
          onClick={() => setShowPasswordModal(true)}
          className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center"
        >
          <Lock className="w-4 h-4 mr-2" />
          Change Password
        </button>
        <button
          onClick={handleLogout}
          className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Log Out
        </button>
      </div>

      <Modal
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
        title="Change Password"
      >
        <form onSubmit={handlePasswordChange} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              New Password
            </label>
            <input
              type="password"
              value={formData.newPassword}
              onChange={(e) => setFormData(prev => ({ ...prev, newPassword: e.target.value }))}
              className="mt-1 block w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-black"
              required
              minLength={6}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Confirm New Password
            </label>
            <input
              type="password"
              value={formData.confirmPassword}
              onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
              className="mt-1 block w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-black"
              required
              minLength={6}
            />
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={() => setShowPasswordModal(false)}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
            >
              {loading ? 'Updating...' : 'Update Password'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}