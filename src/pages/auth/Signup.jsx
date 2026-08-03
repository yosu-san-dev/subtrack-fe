import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import './Auth.css';

const Signup = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            await register(name, email, password);
            navigate('/');
        } catch (err) {
            setError(err.message || 'Signup failed');
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card glass-panel">
                <h1 className="text-gradient">Join Subtrack</h1>
                <p className="auth-subtitle">Create your account</p>
                
                {error && <div className="error-alert">{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="input-group">
                        <label>Name</label>
                        <input 
                            type="text" 
                            required 
                            value={name} 
                            onChange={e => setName(e.target.value)}
                            placeholder="John Doe"
                        />
                    </div>
                    
                    <div className="input-group">
                        <label>Email</label>
                        <input 
                            type="email" 
                            required 
                            value={email} 
                            onChange={e => setEmail(e.target.value)}
                            placeholder="you@example.com"
                        />
                    </div>
                    
                    <div className="input-group">
                        <label>Password</label>
                        <input 
                            type="password" 
                            required 
                            value={password} 
                            onChange={e => setPassword(e.target.value)}
                            placeholder="••••••••"
                        />
                    </div>

                    <button type="submit" className="btn-primary w-full mt-4">
                        Create Account
                        <span className="material-symbols-outlined">person_add</span>
                    </button>
                </form>

                <p className="auth-switch">
                    Already have an account? <Link to="/login">Sign in</Link>
                </p>
            </div>
        </div>
    );
};

export default Signup;
