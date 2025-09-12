import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthProvider';
import * as api from '../api';
import axios from 'axios'; // Import axios for Cloudinary upload
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Header from '../components/Header';
import { User, Lock, Upload } from 'lucide-react';

export default function Profile() {
  const { user, setUser, doLogout } = useAuth();
  
  const [profileForm, setProfileForm] = useState({
    username: '',
    profilePicture: '',
    city: '',
    country: '',
  });
  const [passwordForm, setPasswordForm] = useState({
    resetCode: '',
    newPassword: '',
  });

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  
  const [activeTab, setActiveTab] = useState('profile');
  const [step, setStep] = useState(1);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setProfileForm({
        username: user.username || '',
        profilePicture: user.profilePicture || '',
        city: user.city || '',
        country: user.country || '',
      });
      setImagePreview(user.profilePicture || '');
    }
  }, [user]);

  const handleProfileChange = (e) => {
    setProfileForm({ ...profileForm, [e.target.name]: e.target.value });
  };

  const handlePasswordChange = (e) => {
    setPasswordForm({ ...passwordForm, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    let updatedProfileData = { ...profileForm };

    try {
      // If a new image file is selected, upload it to Cloudinary first
      if (imageFile) {
        const formData = new FormData();
        formData.append('file', imageFile);
        formData.append('upload_preset', import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET);

        const response = await axios.post(
          `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload`,
          formData
        );
        
        updatedProfileData.profilePicture = response.data.secure_url;
      }

      // Now, update the user profile with our backend
      const data = await api.updateUserProfile(updatedProfileData);
      setUser(data.user); // Update user in context
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      setImageFile(null); // Reset file input state
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Failed to update profile.' });
    } finally {
      setLoading(false);
    }
  };

  const handleSendCode = async () => {
    setLoading(true);
    setMessage({ type: '', text: '' });
    try {
      await api.sendChangePasswordCode();
      setMessage({ type: 'success', text: 'A verification code has been sent to your email.' });
      setStep(2);
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Failed to send code.' });
    } finally {
      setLoading(false);
    }
  };

  const handleChangePasswordSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });
    try {
      await api.changePassword(passwordForm.resetCode, passwordForm.newPassword);
      setMessage({ type: 'success', text: 'Password changed successfully! You may need to log in again.' });
      setPasswordForm({ resetCode: '', newPassword: '' });
      setStep(1);
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Failed to change password.' });
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return <div>Loading user profile...</div>;
  }

  return (
    <div className="flex min-h-screen w-full flex-col bg-slate-50">
      <Header onLogout={doLogout} appName="My Profile" />
      <main className="flex-grow container mx-auto p-4 md:p-8 flex items-start justify-center">
        <Card className="w-full max-w-2xl shadow-lg border-0 bg-white">
          <CardHeader>
            <div className="flex border-b">
              <button
                onClick={() => setActiveTab('profile')}
                className={`py-3 px-6 text-sm font-medium transition-colors ${
                  activeTab === 'profile' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <User className="inline-block mr-2 h-4 w-4" />
                Profile
              </button>
              <button
                onClick={() => {
                  setActiveTab('security');
                  setMessage({ type: '', text: '' });
                  setStep(1);
                }}
                className={`py-3 px-6 text-sm font-medium transition-colors ${
                  activeTab === 'security' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <Lock className="inline-block mr-2 h-4 w-4" />
                Security
              </button>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            {message.text && (
              <div className={`p-3 rounded-md mb-4 text-sm ${
                  message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}
              >
                {message.text}
              </div>
            )}

            {activeTab === 'profile' && (
              <form onSubmit={handleProfileSubmit} className="space-y-6">
                <div className="flex items-center space-x-4">
                    <img src={imagePreview || `https://ui-avatars.com/api/?name=${user.username}&background=random`} alt="Profile" className="h-20 w-20 rounded-full object-cover" />
                    <div className="flex-grow space-y-2">
                        <Label htmlFor="profilePicture">Change Profile Picture</Label>
                        <Input id="profilePicture" name="profilePicture" type="file" accept="image/*" onChange={handleImageChange} className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
                    </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input id="username" name="username" type="text" value={profileForm.username} onChange={handleProfileChange} required />
                </div>
                 <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" name="email" type="email" value={user.email} disabled className="bg-slate-100" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="city">City</Label>
                      <Input id="city" name="city" type="text" value={profileForm.city} onChange={handleProfileChange} placeholder="e.g., New York"/>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="country">Country</Label>
                      <Input id="country" name="country" type="text" value={profileForm.country} onChange={handleProfileChange} placeholder="e.g., United States" />
                    </div>
                </div>
                <Button type="submit" className="w-full md:w-auto" disabled={loading}>
                  {loading ? 'Saving...' : 'Save Changes'}
                </Button>
              </form>
            )}

            {activeTab === 'security' && (
              <div className="space-y-6">
                <CardTitle>Change Password</CardTitle>
                {step === 1 && (
                  <div>
                    <CardDescription className="mb-4">Click the button below to send a verification code to your email address ({user.email}).</CardDescription>
                    <Button onClick={handleSendCode} disabled={loading}>
                        {loading ? 'Sending...' : 'Send Verification Code'}
                    </Button>
                  </div>
                )}
                {step === 2 && (
                  <form onSubmit={handleChangePasswordSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="resetCode">Verification Code</Label>
                      <Input id="resetCode" name="resetCode" type="text" value={passwordForm.resetCode} onChange={handlePasswordChange} required placeholder="Enter 6-digit code"/>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="newPassword">New Password</Label>
                      <Input id="newPassword" name="newPassword" type="password" value={passwordForm.newPassword} onChange={handlePasswordChange} required placeholder="Enter new password"/>
                    </div>
                    <div className="flex space-x-2">
                        <Button type="submit" disabled={loading}>
                          {loading ? 'Changing...' : 'Change Password'}
                        </Button>
                         <Button type="button" variant="outline" onClick={() => { setStep(1); setMessage({type:'', text:''}); }}>
                          Back
                        </Button>
                    </div>
                  </form>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}