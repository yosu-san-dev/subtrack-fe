import { Outlet, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

const MainLayout = () => {
    const { isAuthenticated } = useAuth();
    const location = useLocation();

    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    const getPageTitle = () => {
        const path = location.pathname;
        if (path === '/') return 'Dashboard';
        if (path.startsWith('/subscriptions')) return 'Subscriptions';
        if (path.startsWith('/payments')) return 'Expenses';
        if (path.startsWith('/categories')) return 'Categories';
        if (path.startsWith('/profile')) return 'Profile';
        return 'Subtrack';
    };

    return (
        <div className="app-layout">
            <Sidebar />
            <div className="main-content">
                <Topbar title={getPageTitle()} />
                <main className="page-container">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default MainLayout;
