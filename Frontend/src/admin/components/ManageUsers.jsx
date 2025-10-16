import React, { useState, useEffect, useRef } from 'react';
import * as api from '../../api';
import { format } from 'date-fns';
import './ManageUsers.css';
import { MoreVertical, Trash2, UserX, UserCheck, ChevronLeft, ChevronRight, UserPlus, X } from 'lucide-react';
import { useAuth } from '../../context/AuthProvider';

const ManageUsers = () => {
    const { user } = useAuth();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [openMenuId, setOpenMenuId] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
    const [inviteEmail, setInviteEmail] = useState('');
    const [inviteMessage, setInviteMessage] = useState({ type: '', text: '' });
    const [isInviting, setIsInviting] = useState(false);
    
    const menuRef = useRef(null);

    const fetchUsers = async (page) => {
        setLoading(true);
        try {
            const data = await api.getAllUsers(page);
            setUsers(data.users);
            setTotalPages(data.totalPages);
            setCurrentPage(data.currentPage);
            setError(''); // Clear previous errors on success
        } catch (err) {
            setError('Failed to fetch users.');
        } finally {
            setLoading(false);
        }
    };

    // Effect to fetch users on component mount
    useEffect(() => {
        fetchUsers(currentPage);
    }, [currentPage]);

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
                setUsers(currentUsers => 
                    currentUsers.map(u => 
                        u._id === userId ? { ...u, isDisabled: !u.isDisabled } : u
                    )
                );
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
                fetchUsers(currentPage); 
            } catch (err) {
                alert('Failed to delete user.');
            } finally {
                setOpenMenuId(null);
            }
        }
    };
    
    // Pagination Handlers
    const handleNextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
        }
    };

    const handlePrevPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    const handleInviteUser = async (e) => {
        e.preventDefault();
        setIsInviting(true);
        setInviteMessage({ type: '', text: '' });
        try {
            await api.inviteUser(inviteEmail);
            setInviteMessage({ type: 'success', text: `Invitation sent successfully to ${inviteEmail}!` });
            setInviteEmail(''); // Clear input on success
        } catch (err) {
            setInviteMessage({ type: 'error', text: err.message || 'Failed to send invite.' });
        } finally {
            setIsInviting(false);
        }
    };

    if (loading) return <div className="loading-container"><p>Loading users...</p></div>;
    if (error) return <div className="error-container"><p>{error}</p></div>;

    return (
        <>
        <div className="page-container">
            <div className="page-header">
                <h1 className="page-title-manage-users">User Management</h1>
                <button className="invite-user-button" onClick={() => setIsInviteModalOpen(true)}>
                    <UserPlus size={16} />
                    <span>Invite User</span>
                </button>
            </div>
            <div className="table-wrapper">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>User</th>
                            <th>Location</th>
                            <th>Models</th>
                            <th>Last Login</th>
                            <th>Status</th>
                            {user && user.role === 'admin' && <th>Actions</th>}
                        </tr>
                    </thead>
                    <tbody>
                        {users.length > 0 ? (
                            users.map(listUser => (
                                <tr key={listUser._id}>
                                    <td>
                                        <div className="user-info-cell">
                                            <img className="avatar" src={listUser.profilePicture || `https://ui-avatars.com/api/?name=${listUser.username}&background=random`} alt="avatar" />
                                            <div>
                                                <div className="user-name">{listUser.username}</div>
                                                <div className="user-email">{listUser.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td>{listUser.city && listUser.country ? `${listUser.city}, ${listUser.country}` : 'N/A'}</td>
                                    <td>{listUser.modelCount}</td>
                                    <td>{listUser.lastLogin ? format(new Date(listUser.lastLogin), 'PPp') : 'Never'}</td>
                                    <td>
                                        <span className={`status-badge ${listUser.isDisabled ? 'status-disabled' : 'status-active'}`}>
                                            {listUser.isDisabled ? 'Disabled' : 'Active'}
                                        </span>
                                    </td>
                                    {user && user.role === 'admin' && (
                                        <td className="actions-cell">
                                            <button onClick={() => setOpenMenuId(openMenuId === listUser._id ? null : listUser._id)} className="actions-trigger">
                                                <MoreVertical size={16} />
                                            </button>
                                            {openMenuId === listUser._id && (
                                                <div className="actions-menu" ref={menuRef}>
                                                    <button onClick={() => handleToggleStatus(listUser._id, listUser.isDisabled)} className="action-item">
                                                        {listUser.isDisabled ? <UserCheck size={16}/> : <UserX size={16}/>}
                                                        <span>{listUser.isDisabled ? 'Enable User' : 'Disable User'}</span>
                                                    </button>
                                                    <button onClick={() => handleDeleteUser(listUser._id)} className="action-item action-delete">
                                                        <Trash2 size={16} />
                                                        <span>Delete User</span>
                                                    </button>
                                                </div>
                                            )}
                                        </td>
                                    )}
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={user.role === 'admin' ? 6 : 5} className="loading-text">No users found.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {totalPages > 1 && (
                <div className="pagination-controls">
                    <button onClick={handlePrevPage} disabled={currentPage === 1 || loading} className="pagination-button">
                        <ChevronLeft size={18} />
                        <span>Previous</span>
                    </button>
                    <span className="pagination-text">
                        Page {currentPage} of {totalPages}
                    </span>
                    <button onClick={handleNextPage} disabled={currentPage === totalPages || loading} className="pagination-button">
                        <span>Next</span>
                        <ChevronRight size={18} />
                    </button>
                </div>
            )}
        </div>
        {isInviteModalOpen && (
            <div className="invite-modal-overlay">
                <div className="invite-modal-card">
                    <div className="invite-modal-header">
                        <h2>Invite a New User</h2>
                        <button onClick={() => setIsInviteModalOpen(false)} className="close-button">
                            <X size={20} />
                        </button>
                    </div>
                    <div className="invite-modal-content">
                        <p>An email with temporary login credentials will be sent to the user.</p>
                        {inviteMessage.text && (
                            <div className={`message ${inviteMessage.type === 'success' ? 'message-success' : 'message-error'}`}>
                                {inviteMessage.text}
                            </div>
                        )}
                        <form onSubmit={handleInviteUser}>
                            <label htmlFor="email">Email Address</label>
                            <input
                                id="email"
                                type="email"
                                value={inviteEmail}
                                onChange={(e) => setInviteEmail(e.target.value)}
                                placeholder="new.user@example.com"
                                required
                            />
                            <button type="submit" disabled={isInviting}>
                                {isInviting ? 'Sending...' : 'Send Invite'}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        )}
        </>
    );
};

export default ManageUsers;