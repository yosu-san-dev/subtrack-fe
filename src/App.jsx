import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AccountProvider } from './context/AccountContext';

// Layouts
import MainLayout from './components/layout/MainLayout';

// Auth Pages
import Login from './pages/auth/Login';
import Signup from './pages/auth/Signup';

// Protected Pages
import Dashboard from './pages/dashboard/Dashboard';
import Subscriptions from './pages/subscriptions/Subscriptions';
import Ledger from './pages/ledger/Ledger';
import Categories from './pages/categories/Categories';
import Profile from './pages/profile/Profile';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        
        <Route path="/" element={
            <AccountProvider>
                <MainLayout />
            </AccountProvider>
        }>
            <Route index element={<Dashboard />} />
            <Route path="subscriptions" element={<Subscriptions />} />
            <Route path="payments" element={<Ledger />} />
            <Route path="categories" element={<Categories />} />
            <Route path="profile" element={<Profile />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
