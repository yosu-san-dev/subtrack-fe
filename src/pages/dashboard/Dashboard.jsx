import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../api/client';
import { useAccount } from '../../context/AccountContext';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import './Dashboard.css';

const Dashboard = () => {
    const { activeAccount, isLoading: accountLoading } = useAccount();

    const { data: paymentsData, isLoading: paymentsLoading } = useQuery({
        queryKey: ['payments', activeAccount?.id],
        queryFn: () => apiClient.get('/payments'),
        enabled: !!activeAccount,
    });

    const { data: renewalsData, isLoading: renewalsLoading } = useQuery({
        queryKey: ['renewals', activeAccount?.id],
        queryFn: () => apiClient.get('/subscriptions/upcoming-renewals'),
        enabled: !!activeAccount,
    });

    const { data: subscriptionsData, isLoading: subscriptionsLoading } = useQuery({
        queryKey: ['subscriptions', activeAccount?.id],
        queryFn: () => apiClient.get('/subscriptions'),
        enabled: !!activeAccount,
    });

    if (accountLoading || paymentsLoading || renewalsLoading || subscriptionsLoading) {
        return <div className="loading-state">Loading dashboard...</div>;
    }

    const payments = paymentsData?.data || [];
    const renewals = renewalsData?.data || [];
    const subscriptions = subscriptionsData?.data || [];

    // Calculate Summary Stats
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    const monthlySpend = payments
        .filter(p => {
            const d = new Date(p.payment_date);
            return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
        })
        .reduce((sum, p) => sum + p.amount, 0);

    const yearlySpend = payments
        .filter(p => new Date(p.payment_date).getFullYear() === currentYear)
        .reduce((sum, p) => sum + p.amount, 0);

    // Chart Data Preparation (Mock trend for now based on recent payments)
    const trendData = payments
        .slice(-10)
        .map(p => ({
            name: new Date(p.payment_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            amount: p.amount
        }));

    // Category Pie Data
    const categoryTotals = {};
    payments.forEach(p => {
        categoryTotals[p.category] = (categoryTotals[p.category] || 0) + p.amount;
    });
    const pieData = Object.entries(categoryTotals).map(([name, value]) => ({ name, value }));
    const COLORS = ['#D99B7F', '#A56F63', '#FFFFFF', '#464858'];

    return (
        <div className="dashboard-grid">
            {/* Summary Cards */}
            <div className="summary-cards">
                <div className="summary-card glass-panel hover-glow">
                    <div className="card-icon"><span className="material-symbols-outlined">payments</span></div>
                    <div className="card-content">
                        <h3>Monthly Spend</h3>
                        <p className="card-value">${monthlySpend.toFixed(2)}</p>
                    </div>
                </div>
                <div className="summary-card glass-panel hover-glow">
                    <div className="card-icon"><span className="material-symbols-outlined">calendar_month</span></div>
                    <div className="card-content">
                        <h3>Yearly Spend</h3>
                        <p className="card-value">${yearlySpend.toFixed(2)}</p>
                    </div>
                </div>
                <div className="summary-card glass-panel hover-glow">
                    <div className="card-icon"><span className="material-symbols-outlined">subscriptions</span></div>
                    <div className="card-content">
                        <h3>Active Subs</h3>
                        <p className="card-value">{subscriptions.length}</p>
                    </div>
                </div>
            </div>

            <div className="dashboard-charts">
                <div className="chart-container glass-panel hover-glow">
                    <h3>Recent Spending Trend</h3>
                    <div style={{ width: '100%', height: 300 }}>
                        <ResponsiveContainer>
                            <AreaChart data={trendData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="var(--accent-primary)" stopOpacity={0.8}/>
                                    <stop offset="95%" stopColor="var(--accent-primary)" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <XAxis dataKey="name" stroke="var(--text-muted)" />
                                <YAxis stroke="var(--text-muted)" />
                                <Tooltip 
                                    contentStyle={{ background: 'var(--bg-secondary)', border: '1px solid var(--glass-border)', borderRadius: '8px' }}
                                    itemStyle={{ color: 'var(--accent-primary)' }}
                                />
                                <Area type="monotone" dataKey="amount" stroke="var(--accent-primary)" fillOpacity={1} fill="url(#colorAmount)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="chart-container glass-panel hover-glow">
                    <h3>Spend by Category</h3>
                    <div style={{ width: '100%', height: 300 }}>
                        {pieData.length > 0 ? (
                            <ResponsiveContainer>
                                <PieChart>
                                    <Pie
                                        data={pieData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={100}
                                        paddingAngle={5}
                                        dataKey="value"
                                        stroke="none"
                                    >
                                        {pieData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip 
                                        contentStyle={{ background: 'var(--bg-secondary)', border: 'none', borderRadius: '8px' }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="empty-chart">No payment data yet.</div>
                        )}
                    </div>
                </div>
            </div>

            <div className="renewals-widget glass-panel hover-glow">
                <h3>Upcoming Renewals (7 Days)</h3>
                {renewals.length === 0 ? (
                    <p className="empty-state">No upcoming renewals.</p>
                ) : (
                    <div className="renewals-list">
                        {renewals.map(sub => (
                            <div key={sub.id} className="renewal-item">
                                <div className="renewal-info">
                                    <h4>{sub.name}</h4>
                                    <span className="renewal-category">{sub.category}</span>
                                </div>
                                <div className="renewal-meta">
                                    <span className="renewal-date">{new Date(sub.renewal_date).toLocaleDateString()}</span>
                                    <span className="renewal-price">${sub.price}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Dashboard;
