import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../api/client';
import { useAccount } from '../../context/AccountContext';
import Select from '../../components/ui/Select';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import '../../components/ui/DatePicker.css';
import './Subscriptions.css';

const Subscriptions = () => {
    const { activeAccount } = useAccount();
    const queryClient = useQueryClient();
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    // Form State
    const [formData, setFormData] = useState({
        name: '', price: '', frequency: 'monthly', category: '', payment_method: '', start_date: ''
    });

    const { data, isLoading } = useQuery({
        queryKey: ['subscriptions', activeAccount?.id],
        queryFn: () => apiClient.get('/subscriptions'),
        enabled: !!activeAccount,
    });

    const { data: categoriesData } = useQuery({
        queryKey: ['categories'],
        queryFn: () => apiClient.get('/categories'),
    });

    const createMutation = useMutation({
        mutationFn: (newSub) => apiClient.post('/subscriptions', newSub),
        onSuccess: () => {
            queryClient.invalidateQueries(['subscriptions']);
            queryClient.invalidateQueries(['renewals']);
            setIsModalOpen(false);
            setFormData({ name: '', price: '', frequency: 'monthly', category: '', payment_method: '', start_date: '' });
        }
    });

    const cancelMutation = useMutation({
        mutationFn: (id) => apiClient.put(`/subscriptions/${id}/cancel`),
        onSuccess: () => {
            queryClient.invalidateQueries(['subscriptions']);
            queryClient.invalidateQueries(['renewals']);
        }
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        
        // Format date to YYYY-MM-DD string for backend if it's a Date object
        const formattedDate = formData.start_date instanceof Date 
            ? formData.start_date.toISOString().split('T')[0] 
            : formData.start_date;

        createMutation.mutate({
            ...formData,
            price: Number(formData.price),
            start_date: formattedDate
        });
    };

    if (isLoading) return <div>Loading subscriptions...</div>;

    const subscriptions = data?.data || [];
    const categories = categoriesData?.data || [];

    return (
        <div className="subscriptions-page">
            <div className="page-header">
                <button className="btn-primary" onClick={() => setIsModalOpen(true)}>
                    <span className="material-symbols-outlined">add</span>
                    Add Subscription
                </button>
            </div>

            <div className="subs-grid">
                {subscriptions.length === 0 ? (
                    <div className="empty-state glass-panel">No subscriptions found for this account.</div>
                ) : (
                    subscriptions.map(sub => (
                        <div key={sub.id} className="sub-card glass-panel hover-glow">
                            <div className="sub-header">
                                <h3>{sub.name}</h3>
                                <span className={`status-badge ${sub.status}`}>{sub.status}</span>
                            </div>
                            <div className="sub-price">
                                ${sub.price} <span>/ {sub.frequency}</span>
                            </div>
                            <div className="sub-details">
                                <p><strong>Category:</strong> <span className="cat-tag">{sub.category}</span></p>
                                <p><strong>Next Renewal:</strong> {sub.status !== 'cancelled' ? new Date(sub.renewal_date).toLocaleDateString() : '-'}</p>
                            </div>
                            <div className="sub-actions">
                                {sub.status !== 'cancelled' && (
                                    <button 
                                        className="btn-secondary danger-btn"
                                        onClick={() => cancelMutation.mutate(sub.id)}
                                    >
                                        Cancel Sub
                                    </button>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>

            {isModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content glass-panel">
                        <h2>New Subscription</h2>
                        <form onSubmit={handleSubmit}>
                            <div className="input-group">
                                <label>Name</label>
                                <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                            </div>
                            <div className="input-row">
                                <div className="input-group">
                                    <label>Price</label>
                                    <div className="input-with-icon">
                                        <span className="currency-symbol">$</span>
                                        <input 
                                            type="number" 
                                            step="0.01" 
                                            required 
                                            value={formData.price} 
                                            onChange={e => setFormData({...formData, price: e.target.value})}
                                            style={{ paddingLeft: '32px' }}
                                        />
                                    </div>
                                </div>
                                <div className="input-group">
                                    <label>Frequency</label>
                                    <Select 
                                        value={formData.frequency} 
                                        onChange={e => setFormData({...formData, frequency: e.target.value})}
                                        options={[
                                            { value: 'monthly', label: 'Monthly' },
                                            { value: 'yearly', label: 'Yearly' },
                                            { value: 'weekly', label: 'Weekly' }
                                        ]}
                                    />
                                </div>
                            </div>
                            <div className="input-group">
                                <label>Category</label>
                                <Select 
                                    value={formData.category}
                                    onChange={e => setFormData({...formData, category: e.target.value})}
                                    options={[
                                        { value: '', label: 'Select a category' },
                                        ...(categories || []).map(c => ({ value: c.name, label: c.name }))
                                    ]}
                                />
                            </div>
                            <div className="form-row">
                                <div className="input-group">
                                    <label>Payment Method</label>
                                    <Select 
                                        value={formData.payment_method} 
                                        onChange={e => setFormData({...formData, payment_method: e.target.value})}
                                        options={[
                                            { value: 'Credit Card', label: 'Credit Card' },
                                            { value: 'PayPal', label: 'PayPal' },
                                            { value: 'Bank Transfer', label: 'Bank Transfer' }
                                        ]}
                                        placeholder="Select method"
                                    />
                                </div>
                                <div className="input-group">
                                    <label>Start Date</label>
                                    <DatePicker
                                        selected={formData.start_date ? new Date(formData.start_date) : null}
                                        onChange={(date) => setFormData({...formData, start_date: date})}
                                        dateFormat="MM/dd/yyyy"
                                        placeholderText="Select date"
                                        className="date-picker-input"
                                        required
                                    />
                                </div>
                            </div>
                            <div className="modal-actions">
                                <button type="button" className="btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
                                <button type="submit" className="btn-primary" disabled={createMutation.isPending}>
                                    {createMutation.isPending ? 'Saving...' : 'Save Subscription'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Subscriptions;
