import React, { useState, useEffect, useRef } from 'react';
import * as api from '../../api'; // Go up to the root src folder for api.js
import { format } from 'date-fns';
import './ManageUsers.css'; // We will create this CSS file next
import MoreVertIcon from '../assets/icons/dummy logo.svg';
import UserCheckIcon from '../assets/icons/dummy logo.svg';
import UserXIcon from '../assets/icons/dummy logo.svg';
import TrashIcon from '../assets/icons/dummy logo.svg';

const ManageUsers = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [openMenuId, setOpenMenuId] = useState(null);
    const menuRef = useRef(null);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const data = await api.getAllUsers();
            setUsers(data);
        } catch (err) {
            setError('Failed to fetch users.');
        } finally {
            setLoading(false);
        }
    };
    
    // Effect to fetch users on component mount
    useEffect(() => {
        fetchUsers();
    }, []);

    // Effect to close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setOpenMenuId(null);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);


    const handleToggleStatus = async (userId, currentStatus) => {
        const action = currentStatus ? "enable" : "disable";
        if (window.confirm(`Are you sure you want to ${action} this user?`)) {
            try {
                await api.toggleUserStatus(userId);
                fetchUsers(); // Refresh the user list
            } catch (err) {
                alert('Failed to update user status.');
            } finally {
                setOpenMenuId(null);
            }
        }
    };

    const handleDeleteUser = async (userId) => {
         if (window.confirm("Are you sure you want to PERMANENTLY DELETE this user and all their models? This action is irreversible.")) {
            try {
                await api.deleteUser(userId);
                fetchUsers(); // Refresh list
            } catch (err) {
                alert('Failed to delete user.');
            } finally {
                setOpenMenuId(null);
            }
        }
    };

    if (loading) return <div className="loading-container"><p>Loading users...</p></div>;
    if (error) return <div className="error-container"><p>{error}</p></div>;

    return (
        <div className="page-container">
            <h1 className="page-title">User Management</h1>
            <div className="table-wrapper">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>User</th>
                            <th>Location</th>
                            <th>Models</th>
                            <th>Last Login</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map(user => (
                            user.role !== 'admin' && ( // Don't show the admin in the list
                                <tr key={user._id}>
                                    <td>
                                        <div className="user-info-cell">
                                            <img className="avatar" src={user.profilePicture || `https://ui-avatars.com/api/?name=${user.username}&background=random`} alt="avatar" />
                                            <div>
                                                <div className="user-name">{user.username}</div>
                                                <div className="user-email">{user.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td>{user.city && user.country ? `${user.city}, ${user.country}` : 'N/A'}</td>
                                    <td>{user.modelCount}</td>
                                    <td>{user.lastLogin ? format(new Date(user.lastLogin), 'PPp') : 'Never'}</td>
                                    <td>
                                        <span className={`status-badge ${user.isDisabled ? 'status-disabled' : 'status-active'}`}>
                                            {user.isDisabled ? 'Disabled' : 'Active'}
                                        </span>
                                    </td>
                                    <td className="actions-cell">
                                        <button onClick={() => setOpenMenuId(openMenuId === user._id ? null : user._id)} className="actions-trigger">
                                            <img src={MoreVertIcon} alt="Actions"/>
                                        </button>
                                        {openMenuId === user._id && (
                                            <div className="actions-menu" ref={menuRef}>
                                                <button onClick={() => handleToggleStatus(user._id, user.isDisabled)} className="action-item">
                                                    <img src={user.isDisabled ? UserCheckIcon : UserXIcon} alt="Toggle Status" />
                                                    <span>{user.isDisabled ? 'Enable User' : 'Disable User'}</span>
                                                </button>
                                                <button onClick={() => handleDeleteUser(user._id)} className="action-item action-delete">
                                                    <img src={TrashIcon} alt="Delete"/>
                                                    <span>Delete User</span>
                                                </button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            )
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ManageUsers;