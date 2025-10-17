import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthProvider';
import * as api from '../api';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Header from '../components/Header';
import { User, Lock, ShieldCheck, Send } from 'lucide-react';

export default function Profile({ inAdminPanel = false }) {
  const { user, doLogout } = useAuth();

  if (!user) {
    return <div>Loading user profile...</div>;
  }

  return (
    <>
      {!inAdminPanel ? (
        <div className="flex min-h-screen w-full flex-col bg-slate-50">
          <Header onLogout={doLogout} appName="My Profile" />
          <main className="flex-grow container mx-auto p-4 md:p-8 flex items-start justify-center">
            <ProfilePage />
          </main>
        </div>
      ) : (
        <main className="flex-1 container overflow-y-auto mx-auto p-2 md:p-4 flex items-start justify-center">
            <ProfilePage />
        </main>
      )}
    </>
  );
}

function ProfilePage() {
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
  const [message, setMessage] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState({
    profile: false,
    passwordCode: false,
    passwordChange: false,
    twoFactorGenerate: false,
    twoFactorVerify: false,
    twoFactorDisable: false,
    invite: false,
  });
  
  const [passwordStep, setPasswordStep] = useState(1);

  const [twoFactorStep, setTwoFactorStep] = useState('initial'); // initial, generate, verify, disable
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [twoFactorCode, setTwoFactorCode] = useState('');

  const [inviteForm, setInviteForm] = useState({
    email: '',
    role: 'editor' 
  });

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

  //Profile Handlers
  const handleProfileChange = (e) => setProfileForm({ ...profileForm, [e.target.name]: e.target.value });
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setLoading(prev => ({ ...prev, profile: true }));
    setMessage({ type: '', text: '' });
    let updatedProfileData = { ...profileForm };
    try {
      if (imageFile) {
        const formData = new FormData();
        formData.append('file', imageFile);
        formData.append('upload_preset', import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET);
        const response = await axios.post(`https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload`, formData);
        updatedProfileData.profilePicture = response.data.secure_url;
      }
      const data = await api.updateUserProfile(updatedProfileData);
      setUser(data.user);
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      setImageFile(null);
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Failed to update profile.' });
    } finally {
      setLoading(prev => ({ ...prev, profile: false }));
    }
  };

  //Password Handlers
  const handlePasswordChange = (e) => setPasswordForm({ ...passwordForm, [e.target.name]: e.target.value });
  const handleSendCode = async () => {
    setLoading(prev => ({ ...prev, passwordCode: true }));
    setMessage({ type: '', text: '' });
    try {
      await api.sendChangePasswordCode();
      setMessage({ type: 'success', text: 'A verification code has been sent to your email.' });
      setPasswordStep(2);
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Failed to send code.' });
    } finally {
      setLoading(prev => ({ ...prev, passwordCode: false }));
    }
  };
  const handleChangePasswordSubmit = async (e) => {
    e.preventDefault();
    setLoading(prev => ({ ...prev, passwordChange: true }));
    setMessage({ type: '', text: '' });
    try {
      await api.changePassword(passwordForm.resetCode, passwordForm.newPassword);
      setMessage({ type: 'success', text: 'Password changed successfully!' });
      setPasswordForm({ resetCode: '', newPassword: '' });
      setPasswordStep(1);
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Failed to change password.' });
    } finally {
      setLoading(prev => ({ ...prev, passwordChange: false }));
    }
  };
  
  //2FA Handlers
  const handleGenerate2FA = async () => {
    setLoading(prev => ({ ...prev, twoFactorGenerate: true }));
    setMessage({ type: '', text: '' });
    try {
      const data = await api.generate2FASecret();
      setQrCodeUrl(data.qrCodeDataURL);
      setTwoFactorStep('verify');
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Failed to generate 2FA secret.' });
    } finally {
      setLoading(prev => ({ ...prev, twoFactorGenerate: false }));
    }
  };

  const handleVerify2FA = async (e) => {
    e.preventDefault();
    setLoading(prev => ({ ...prev, twoFactorVerify: true }));
    setMessage({ type: '', text: '' });
    try {
      await api.verifyAndEnable2FA(twoFactorCode);
      setUser({ ...user, isTwoFactorEnabled: true });
      setMessage({ type: 'success', text: '2FA has been enabled!' });
      setTwoFactorStep('initial');
      setTwoFactorCode('');
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Verification failed.' });
    } finally {
      setLoading(prev => ({ ...prev, twoFactorVerify: false }));
    }
  };

  const handleDisable2FA = async (e) => {
    e.preventDefault();
    setLoading(prev => ({ ...prev, twoFactorDisable: true }));
    setMessage({ type: '', text: '' });
    try {
      await api.disable2FA(twoFactorCode);
      setUser({ ...user, isTwoFactorEnabled: false });
      setMessage({ type: 'success', text: '2FA has been disabled.' });
      setTwoFactorStep('initial');
      setTwoFactorCode('');
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Failed to disable 2FA.' });
    } finally {
      setLoading(prev => ({ ...prev, twoFactorDisable: false }));
    }
  };

  // invite Handlers
  const handleInviteChange = (e) => {
      setInviteForm({ ...inviteForm, [e.target.name]: e.target.value });
  };

  const handleInviteSubmit = async (e) => {
      e.preventDefault();
      setLoading(prev => ({ ...prev, invite: true }));
      setMessage({ type: '', text: '' });
      try {
          await api.inviteAdminOrEditor(inviteForm.email, inviteForm.role);
          setMessage({ type: 'success', text: `Invitation successfully sent to ${inviteForm.email}.` });
          setInviteForm({ email: '', role: 'editor' }); // Reset form
      } catch (err) {
          setMessage({ type: 'error', text: err.message || 'Failed to send invite.' });
      } finally {
          setLoading(prev => ({ ...prev, invite: false }));
      }
  };

  if (!user) return <div>Loading...</div>;

  return (
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
                  setPasswordStep(1);
                  setTwoFactorStep('initial');
                }}
                className={`py-3 px-6 text-sm font-medium transition-colors ${
                  activeTab === 'security' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <Lock className="inline-block mr-2 h-4 w-4" />
                Security
              </button>
              {user.role === 'admin' && (
                  <button
                      onClick={() => {
                          setActiveTab('invite');
                          setMessage({ type: '', text: '' });
                      }}
                      className={`py-3 px-6 text-sm font-medium transition-colors ${
                          activeTab === 'invite' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-slate-500 hover:text-slate-700'
                      }`}
                  >
                      <Send className="inline-block mr-2 h-4 w-4" />
                      Invite
                  </button>
              )}
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
                <Button type="submit" className="w-full md:w-auto" disabled={loading.profile}>
                  {loading.profile ? 'Saving...' : 'Save Changes'}
                </Button>
              </form>
            )}

            {activeTab === 'security' && (
              <div className="space-y-8">
                {/* Change Password Section */}
                <div className="space-y-4">
                  <CardTitle>Change Password</CardTitle>
                  {passwordStep === 1 && (
                    <div>
                      <CardDescription className="mb-4">Click the button below to send a verification code to your email address ({user.email}).</CardDescription>
                      <Button onClick={handleSendCode} disabled={loading.passwordCode}>{loading.passwordCode ? 'Sending...' : 'Send Verification Code'}</Button>
                    </div>
                  )}
                  {passwordStep === 2 && (
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
                          <Button type="submit" disabled={loading.passwordChange}>{loading.passwordChange ? 'Changing...' : 'Change Password'}</Button>
                           <Button type="button" variant="outline" onClick={() => { setPasswordStep(1); setMessage({type:'', text:''}); }}>Back</Button>
                      </div>
                    </form>
                  )}
                </div>

                <hr/>

                {/* 2FA Section */}
                <div className="space-y-4">
                  <CardTitle>Two-Factor Authentication (2FA)</CardTitle>
                  {!user.isTwoFactorEnabled && twoFactorStep === 'initial' && (
                      <div>
                          <CardDescription className="mb-4">Enhance your account security. You'll need an authenticator app like Google Authenticator or Authy.</CardDescription>
                          <Button onClick={handleGenerate2FA} disabled={loading.twoFactorGenerate}>{loading.twoFactorGenerate ? 'Generating...' : 'Enable 2FA'}</Button>
                      </div>
                  )}
                  {twoFactorStep === 'verify' && (
                      <form onSubmit={handleVerify2FA} className="space-y-4">
                          <CardDescription>Scan the QR code with your authenticator app, then enter the 6-digit code below to complete setup.</CardDescription>
                          <div className="flex justify-center p-4 bg-white rounded-lg border">
                              {qrCodeUrl && <img src={qrCodeUrl} alt="2FA QR Code Setup" />}
                          </div>
                          <Label htmlFor="2fa-code">Verification Code</Label>
                          <Input id="2fa-code" value={twoFactorCode} onChange={(e) => setTwoFactorCode(e.target.value)} placeholder="Enter 6-digit code" required />
                          <div className="flex space-x-2">
                             <Button type="submit" disabled={loading.twoFactorVerify}>{loading.twoFactorVerify ? 'Verifying...' : 'Verify & Enable'}</Button>
                             <Button variant="outline" type="button" onClick={() => setTwoFactorStep('initial')}>Cancel</Button>
                          </div>
                      </form>
                  )}
                  {user.isTwoFactorEnabled && twoFactorStep === 'initial' && (
                      <div>
                           <div className="flex items-center p-3 rounded-md bg-green-50 text-green-800 border border-green-200 mb-4">
                              <ShieldCheck className="h-5 w-5 mr-3"/>
                              <p className="text-sm font-medium">Two-Factor Authentication is currently enabled.</p>
                           </div>
                          <Button variant="destructive" onClick={() => setTwoFactorStep('disable')}>Disable 2FA</Button>
                      </div>
                  )}
                  {twoFactorStep === 'disable' && (
                       <form onSubmit={handleDisable2FA} className="space-y-4">
                          <CardDescription>To disable 2FA, please enter a valid code from your authenticator app.</CardDescription>
                          <Label htmlFor="disable-2fa-code">Current Authentication Code</Label>
                          <Input id="disable-2fa-code" value={twoFactorCode} onChange={(e) => setTwoFactorCode(e.target.value)} placeholder="Enter 6-digit code" required />
                          <div className="flex space-x-2">
                             <Button type="submit" variant="destructive" disabled={loading.twoFactorDisable}>{loading.twoFactorDisable ? 'Disabling...' : 'Confirm & Disable'}</Button>
                             <Button variant="outline" type="button" onClick={() => setTwoFactorStep('initial')}>Cancel</Button>
                          </div>
                      </form>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'invite' && user.role === 'admin' && (
              <div className="space-y-6">
                  <CardTitle>Invite a New Admin or Editor</CardTitle>
                  <CardDescription>
                      An invitation with a temporary username and password will be sent to the email address you provide.
                  </CardDescription>
                  <form onSubmit={handleInviteSubmit} className="space-y-4">
                      <div className="space-y-2">
                          <Label htmlFor="invite-email">Email Address</Label>
                          <Input 
                              id="invite-email" 
                              name="email"
                              type="email" 
                              value={inviteForm.email} 
                              onChange={handleInviteChange}
                              placeholder="new.admin@example.com"
                              required 
                          />
                      </div>
                      <div className="space-y-2">
                          <Label htmlFor="invite-role">Assign Role</Label>
                          <select 
                              id="invite-role" 
                              name="role"
                              value={inviteForm.role}
                              onChange={handleInviteChange}
                              className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                              <option value="editor">Editor</option>
                              <option value="admin">Admin</option>
                          </select>
                      </div>
                      <Button type="submit" disabled={loading.invite} className="w-full sm:w-auto">
                          {loading.invite ? 'Sending...' : 'Send Invitation'}
                      </Button>
                  </form>
              </div>
            )}
          </CardContent>
        </Card>
  );
}