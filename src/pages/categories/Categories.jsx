import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../api/client';
import Select from '../../components/ui/Select';
import './Categories.css';

const Categories = () => {
    const queryClient = useQueryClient();
    const [name, setName] = useState('');
    const [scope, setScope] = useState('general');
    
    const { data, isLoading } = useQuery({
        queryKey: ['categories'],
        queryFn: () => apiClient.get('/categories'),
    });

    const createMutation = useMutation({
        mutationFn: (newCategory) => apiClient.post('/categories', newCategory),
        onSuccess: () => {
            queryClient.invalidateQueries(['categories']);
            setName('');
        }
    });

    const deleteMutation = useMutation({
        mutationFn: (id) => apiClient.delete(`/categories/${id}`),
        onSuccess: () => {
            queryClient.invalidateQueries(['categories']);
        }
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        createMutation.mutate({ name, scope });
    };

    if (isLoading) return <div>Loading categories...</div>;

    const categories = data?.data || [];
    const systemCategories = categories.filter(c => !c.user_id);
    const customCategories = categories.filter(c => c.user_id);

    return (
        <div className="categories-page">
            <div className="add-category-panel glass-panel">
                <h2>Add Custom Category</h2>
                <form className="add-category-form" onSubmit={handleSubmit}>
                    <div className="input-group">
                        <label>Category Name</label>
                        <input type="text" required value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Groceries" />
                    </div>
                    <div className="input-group">
                        <label>Scope</label>
                        <Select 
                            value={scope} 
                            onChange={e => setScope(e.target.value)}
                            options={[
                                { value: 'general', label: 'General' },
                                { value: 'payment', label: 'Payment' },
                                { value: 'subscription', label: 'Subscription' }
                            ]}
                        />
                    </div>
                    <button type="submit" className="btn-primary" disabled={createMutation.isPending || !name.trim()}>
                        <span className="material-symbols-outlined">add</span>
                        Add Category
                    </button>
                </form>
            </div>

            <div className="categories-lists">
                <div className="category-section glass-panel">
                    <h3>Your Custom Categories</h3>
                    {customCategories.length === 0 ? (
                        <p className="empty-state">No custom categories yet.</p>
                    ) : (
                        <div className="cat-list">
                            {customCategories.map(cat => (
                                <div key={cat.id} className="cat-item hover-glow">
                                    <div className="cat-info">
                                        <span className="cat-name">{cat.name}</span>
                                        <span className="cat-scope">{cat.scope}</span>
                                    </div>
                                    <button 
                                        className="btn-icon danger" 
                                        onClick={() => deleteMutation.mutate(cat.id)}
                                        title="Delete Category"
                                    >
                                        <span className="material-symbols-outlined">delete</span>
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="category-section glass-panel">
                    <h3>System Categories</h3>
                    <div className="cat-list">
                        {systemCategories.map(cat => (
                            <div key={cat.id} className="cat-item system">
                                <div className="cat-info">
                                    <span className="cat-name">{cat.name}</span>
                                    <span className="cat-scope">{cat.scope}</span>
                                </div>
                                <span className="material-symbols-outlined lock-icon" title="System categories cannot be deleted">lock</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Categories;
