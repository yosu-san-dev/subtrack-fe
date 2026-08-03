import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useAccount } from '../../context/AccountContext';
import Select from '../ui/Select';
import clsx from 'clsx';
import './Sidebar.css';

const Sidebar = () => {
    const { logout } = useAuth();
    const { accounts, activeAccount, switchAccount } = useAccount();

    const navItems = [
        { path: '/', label: 'Dashboard', icon: 'dashboard' },
        { path: '/subscriptions', label: 'Subscriptions', icon: 'subscriptions' },
        { path: '/payments', label: 'Expenses', icon: 'receipt_long' },
        { path: '/categories', label: 'Categories', icon: 'category' },
    ];

    return (
        <aside className="sidebar glass-panel">
            <div className="sidebar-header">
                <h2>Subtrack</h2>
            </div>
            
            <nav className="sidebar-nav">
                {navItems.map(item => (
                    <NavLink 
                        key={item.path} 
                        to={item.path} 
                        className={({ isActive }) => clsx('nav-item', { active: isActive })}
                    >
                        <span className="material-symbols-outlined">{item.icon}</span>
                        {item.label}
                    </NavLink>
                ))}
            </nav>

            <div className="sidebar-footer">
                <div className="account-switcher">
                    <label>Active Account</label>
                    <Select 
                        value={activeAccount?.id?.toString() || ''} 
                        onChange={(e) => switchAccount(Number(e.target.value))}
                        options={accounts.map(acc => ({ value: acc.id.toString(), label: acc.name }))}
                    />
                </div>
                
                <button className="nav-item logout-btn" onClick={logout}>
                    <span className="material-symbols-outlined">logout</span>
                    Logout
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
