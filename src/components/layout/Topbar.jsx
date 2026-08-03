import { useAuth } from '../../context/AuthContext';
import { NavLink } from 'react-router-dom';
import './Topbar.css';

const Topbar = ({ title }) => {
    const { user } = useAuth();

    return (
        <header className="topbar">
            <h1 className="page-title">{title}</h1>
            
            <div className="topbar-actions">
                <NavLink to="/profile" className="profile-btn glass-panel">
                    <span className="material-symbols-outlined">person</span>
                    <span className="profile-name">{user?.name || 'Profile'}</span>
                </NavLink>
            </div>
        </header>
    );
};

export default Topbar;
