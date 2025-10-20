import React, { useState, useEffect } from 'react';
import axios from 'axios';
import * as api from '../../api';
import { X } from 'lucide-react';
import './ManageUsers.css'; // Reuse styles from ManageUsers.css

export default function EditUserModal({ user, onClose, onUpdateSuccess }) {
    const [formData, setFormData] = useState({
        username: '',
        city: '',
        country: '',
        password: ''
    });
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    useEffect(() => {
        if (user) {
            setFormData({
                username: user.username || '',
                city: user.city || '',
                country: user.country || '',
                password: '' // Always start password field empty
            });
            setImagePreview(user.profilePicture || `https://ui-avatars.com/api/?name=${user.username}&background=random`);
        }
    }, [user]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ type: '', text: '' });

        let updatedData = { ...formData };

        try {
            if (imageFile) {
                const cloudFormData = new FormData();
                cloudFormData.append('file', imageFile);
                cloudFormData.append('upload_preset', import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET);

                const response = await axios.post(
                    `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload`,
                    cloudFormData
                );
                updatedData.profilePicture = response.data.secure_url;
            }
            
            if (!updatedData.password) {
                delete updatedData.password;
            }

            await api.updateUserByAdminOrEditor(user._id, updatedData);
            setMessage({ type: 'success', text: 'User updated successfully!' });
            
            setTimeout(() => {
                onUpdateSuccess();
                onClose();
            }, 1000);

        } catch (err) {
            setMessage({ type: 'error', text: err.message || 'Failed to update user.' });
            setLoading(false); // Only stop loading on error to show success message
        }
    };

    if (!user) return null;

    return (
        <div className="invite-modal-overlay">
            <div className="invite-modal-card" style={{ maxWidth: '500px' }}>
                <div className="invite-modal-header">
                    <h2>Edit User: {user.username}</h2>
                    <button onClick={onClose} className="close-button">
                        <X size={20} />
                    </button>
                </div>
                <div className="invite-modal-content">
                    {message.text && (
                        <div className={`message ${message.type === 'success' ? 'message-success' : 'message-error'}`}>
                            {message.text}
                        </div>
                    )}
                    <form onSubmit={handleSubmit} className="edit-user-form">
                        <div className="form-row profile-pic-row">
                            <img src={imagePreview} alt="Profile Preview" className="avatar" />
                            <div className="form-group">
                                <label htmlFor="profilePicture">Update Profile Picture</label>
                                <input id="profilePicture" type="file" accept="image/*" onChange={handleImageChange} />
                            </div>
                        </div>

                        <div className="form-group">
                            <label htmlFor="username">Username</label>
                            <input id="username" name="username" type="text" value={formData.username} onChange={handleChange} required />
                        </div>
                        
                        <div className="form-group">
                            <label htmlFor="password">New Password (optional)</label>
                            <input id="password" name="password" type="password" value={formData.password} onChange={handleChange} placeholder="Leave blank to keep unchanged" />
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="city">City</label>
                                <input id="city" name="city" type="text" value={formData.city} onChange={handleChange} />
                            </div>
                            <div className="form-group">
                                <label htmlFor="country">Country</label>
                                <input id="country" name="country" type="text" value={formData.country} onChange={handleChange} />
                            </div>
                        </div>

                        <button type="submit" disabled={loading}>
                            {loading ? 'Updating...' : 'Update User'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}