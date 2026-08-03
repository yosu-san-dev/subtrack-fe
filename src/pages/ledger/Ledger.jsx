import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../api/client';
import { useAccount } from '../../context/AccountContext';
import Select from '../../components/ui/Select';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import '../../components/ui/DatePicker.css';
import './Ledger.css';

const Ledger = () => {
    const { activeAccount } = useAccount();
    const queryClient = useQueryClient();
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    // Filter State
    const [categoryFilter, setCategoryFilter] = useState('');
    const [typeFilter, setTypeFilter] = useState('');

    // Form State
    const [formData, setFormData] = useState({
        amount: '', payment_date: '', description: '', category: '', payment_type: 'one-time', subscription_id: ''
    });

    // Fetch Payments
    const { data, isLoading } = useQuery({
        queryKey: ['payments', activeAccount?.id, categoryFilter, typeFilter],
        queryFn: () => {
            let url = '/payments?';
            if (categoryFilter) url += `category=${categoryFilter}&`;
            if (typeFilter) url += `type=${typeFilter}`;
            return apiClient.get(url);
        },
        enabled: !!activeAccount,
    });

    const { data: categoriesData } = useQuery({
        queryKey: ['categories'],
        queryFn: () => apiClient.get('/categories'),
    });

    const { data: subscriptionsData } = useQuery({
        queryKey: ['subscriptions', activeAccount?.id],
        queryFn: () => apiClient.get('/subscriptions'),
        enabled: !!activeAccount,
    });

    const createMutation = useMutation({
        mutationFn: (newPayment) => apiClient.post('/payments', newPayment),
        onSuccess: () => {
            queryClient.invalidateQueries(['payments']);
            setIsModalOpen(false);
            setFormData({ amount: '', payment_date: '', description: '', category: '', payment_type: 'one-time', subscription_id: '' });
        }
    });

    const deleteMutation = useMutation({
        mutationFn: (id) => apiClient.delete(`/payments/${id}`),
        onSuccess: () => {
            queryClient.invalidateQueries(['payments']);
        }
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        
        const formattedDate = formData.payment_date instanceof Date 
            ? formData.payment_date.toISOString().split('T')[0] 
            : formData.payment_date;

        const payload = {
            ...formData,
            amount: Number(formData.amount),
            payment_date: formattedDate
        };
        if (!payload.subscription_id) delete payload.subscription_id;
        
        createMutation.mutate(payload);
    };

    if (isLoading) return <div>Loading ledger...</div>;

    const payments = data?.data || [];
    const categories = categoriesData?.data || [];
    const subscriptions = subscriptionsData?.data || [];

    return (
        <div className="ledger-page">
            <div className="ledger-controls glass-panel">
                <div className="filters">
                    <div className="filter-group">
                        <label>Category</label>
                        <Select 
                            value={categoryFilter} 
                            onChange={e => setCategoryFilter(e.target.value)}
                            options={[
                                { value: '', label: 'All Categories' },
                                ...categories.map(c => ({ value: c.name, label: c.name }))
                            ]}
                        />
                    </div>
                    <div className="filter-group">
                        <label>Type</label>
                        <Select 
                            value={typeFilter} 
                            onChange={e => setTypeFilter(e.target.value)}
                            options={[
                                { value: '', label: 'All Types' },
                                { value: 'periodic', label: 'Periodic' },
                                { value: 'one-time', label: 'One-time' },
                                { value: 'other', label: 'Other' }
                            ]}
                        />
                    </div>
                </div>
                
                <button className="btn-primary" onClick={() => setIsModalOpen(true)}>
                    <span className="material-symbols-outlined">add</span>
                    Add Payment
                </button>
            </div>

            <div className="ledger-table glass-panel">
                <table>
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Description</th>
                            <th>Category</th>
                            <th>Type</th>
                            <th className="amount-col">Amount</th>
                            <th className="actions-col"></th>
                        </tr>
                    </thead>
                    <tbody>
                        {payments.length === 0 ? (
                            <tr>
                                <td colSpan="5" className="empty-state text-center">No payments found.</td>
                            </tr>
                        ) : (
                            payments.map(p => (
                                <tr key={p.id}>
                                    <td>{new Date(p.payment_date).toLocaleDateString()}</td>
                                    <td>{p.description}</td>
                                    <td><span className="cat-tag">{p.category}</span></td>
                                    <td className="payment-type">{p.payment_type}</td>
                                    <td className="amount-col">${p.amount.toFixed(2)}</td>
                                    <td className="actions-col">
                                        <button 
                                            className="icon-btn danger" 
                                            onClick={() => {
                                                if (window.confirm('Are you sure you want to delete this payment?')) {
                                                    deleteMutation.mutate(p.id);
                                                }
                                            }}
                                            title="Delete Payment"
                                        >
                                            <span className="material-symbols-outlined">delete</span>
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {isModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content glass-panel">
                        <h2>Add Payment</h2>
                        <form onSubmit={handleSubmit}>
                            <div className="input-row">
                                <div className="input-group">
                                    <label>Amount</label>
                                    <div className="input-with-icon">
                                        <span className="currency-symbol">$</span>
                                        <input 
                                            type="number" 
                                            step="0.01" 
                                            required 
                                            value={formData.amount} 
                                            onChange={e => setFormData({...formData, amount: e.target.value})}
                                            style={{ paddingLeft: '32px' }}
                                        />
                                    </div>
                                </div>
                                <div className="input-group">
                                    <label>Date</label>
                                    <DatePicker
                                        selected={formData.payment_date ? new Date(formData.payment_date) : null}
                                        onChange={(date) => setFormData({...formData, payment_date: date})}
                                        dateFormat="MM/dd/yyyy"
                                        placeholderText="Select date"
                                        className="date-picker-input"
                                        required
                                    />
                                </div>
                            </div>
                            
                            <div className="input-group">
                                <label>Description</label>
                                <input type="text" required value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
                            </div>

                            <div className="input-row">
                                <div className="input-group">
                                    <label>Category</label>
                                    <Select 
                                        value={formData.category} 
                                        onChange={e => setFormData({...formData, category: e.target.value})}
                                        options={[
                                            { value: '', label: 'Select a category' },
                                            ...categories.map(c => ({ value: c.name, label: c.name }))
                                        ]}
                                    />
                                </div>
                                <div className="input-group">
                                    <label>Type</label>
                                    <Select 
                                        value={formData.payment_type} 
                                        onChange={e => setFormData({...formData, payment_type: e.target.value})}
                                        options={[
                                            { value: 'one-time', label: 'One-time' },
                                            { value: 'periodic', label: 'Periodic' },
                                            { value: 'other', label: 'Other' }
                                        ]}
                                    />
                                </div>
                            </div>

                            {formData.payment_type === 'periodic' && (
                                <div className="input-group">
                                    <label>Link to Subscription (Optional)</label>
                                    <Select 
                                        value={formData.subscription_id} 
                                        onChange={e => setFormData({...formData, subscription_id: e.target.value})}
                                        options={[
                                            { value: '', label: 'None' },
                                            ...subscriptions.map(s => ({ value: s.id.toString(), label: s.name }))
                                        ]}
                                    />
                                </div>
                            )}

                            <div className="modal-actions">
                                <button type="button" className="btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
                                <button type="submit" className="btn-primary" disabled={createMutation.isPending}>
                                    {createMutation.isPending ? 'Saving...' : 'Add Payment'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Ledger;
