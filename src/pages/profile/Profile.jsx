import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useAccount } from '../../context/AccountContext';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../api/client';
import Select from '../../components/ui/Select';
import './Profile.css';

const Profile = () => {
    const { user, logout } = useAuth();
    const { accounts } = useAccount();
    const queryClient = useQueryClient();
    
    const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
    const [newAccountName, setNewAccountName] = useState('');
    const [newAccountType, setNewAccountType] = useState('business');

    const createAccountMutation = useMutation({
        mutationFn: (newAcc) => apiClient.post('/accounts', newAcc),
        onSuccess: () => {
            queryClient.invalidateQueries(['accounts']);
            setIsAccountModalOpen(false);
            setNewAccountName('');
        }
    });

    const handleCreateAccount = (e) => {
        e.preventDefault();
        createAccountMutation.mutate({ name: newAccountName, type: newAccountType });
    };

    return (
        <div className="profile-page">
            <div className="profile-layout">
                {/* User Details */}
                <div className="profile-card glass-panel">
                    <div className="profile-header">
                        <div className="avatar">
                            <span className="material-symbols-outlined">person</span>
                        </div>
                        <h2>{user?.name}</h2>
                        <span className="role-badge">{user?.role}</span>
                    </div>
                    
                    <div className="profile-details">
                        <div className="detail-row">
                            <span className="label">Email</span>
                            <span className="value">{user?.email}</span>
                        </div>
                        <div className="detail-row">
                            <span className="label">Joined</span>
                            <span className="value">{user?.created_at ? new Date(user.created_at).toLocaleDateString() : '-'}</span>
                        </div>
                    </div>

                    <div className="profile-actions">
                        <button className="btn-secondary danger-btn" onClick={logout}>
                            <span className="material-symbols-outlined">logout</span>
                            Logout
                        </button>
                    </div>
                </div>

                {/* Accounts Manager */}
                <div className="accounts-card glass-panel">
                    <div className="card-header">
                        <h2>Your Accounts</h2>
                        <button className="btn-primary" onClick={() => setIsAccountModalOpen(true)}>
                            <span className="material-symbols-outlined">add</span>
                            New Account
                        </button>
                    </div>

                    <div className="accounts-list">
                        {accounts.map(acc => (
                            <div key={acc.id} className="account-item">
                                <div className="acc-info">
                                    <span className="material-symbols-outlined icon">
                                        {acc.type === 'personal' ? 'person' : 'business_center'}
                                    </span>
                                    <div>
                                        <h4>{acc.name}</h4>
                                        <span className="acc-type">{acc.type}</span>
                                    </div>
                                </div>
                                <div className="acc-meta">
                                    Created {new Date(acc.created_at).toLocaleDateString()}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Create Account Modal */}
            {isAccountModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content glass-panel">
                        <h2>Create New Account</h2>
                        <form onSubmit={handleCreateAccount}>
                            <div className="input-group">
                                <label>Account Name</label>
                                <input 
                                    type="text" 
                                    required 
                                    value={newAccountName} 
                                    onChange={e => setNewAccountName(e.target.value)} 
                                    placeholder="e.g. Freelance Business"
                                />
                            </div>
                            <div className="input-group">
                                <label>Account Type</label>
                                <Select 
                                    value={newAccountType} 
                                    onChange={e => setNewAccountType(e.target.value)}
                                    options={[
                                        { value: 'personal', label: 'Personal' },
                                        { value: 'business', label: 'Business' }
                                    ]}
                                />
                            </div>
                            <div className="modal-actions">
                                <button type="button" className="btn-secondary" onClick={() => setIsAccountModalOpen(false)}>Cancel</button>
                                <button type="submit" className="btn-primary" disabled={createAccountMutation.isPending || !newAccountName.trim()}>
                                    {createAccountMutation.isPending ? 'Creating...' : 'Create Account'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Profile;
