import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { apiClient } from '../api/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const AccountContext = createContext();

export const useAccount = () => useContext(AccountContext);

export const AccountProvider = ({ children }) => {
    const { isAuthenticated } = useAuth();
    const queryClient = useQueryClient();
    
    // Fetch accounts
    const { data: accountsData, isLoading } = useQuery({
        queryKey: ['accounts'],
        queryFn: () => apiClient.get('/accounts'),
        enabled: isAuthenticated,
    });

    const accounts = accountsData?.data || [];
    const [activeAccount, setActiveAccount] = useState(null);

    // Initialize active account from local storage or first available account
    useEffect(() => {
        if (accounts.length > 0 && !activeAccount) {
            const savedAccountId = localStorage.getItem('activeAccountId');
            const accountToSet = accounts.find(a => a.id === Number(savedAccountId)) || accounts[0];
            
            // Switch session on backend
            apiClient.post(`/accounts/${accountToSet.id}/switch`)
                .then(() => {
                    setActiveAccount(accountToSet);
                    localStorage.setItem('activeAccountId', accountToSet.id);
                })
                .catch(err => console.error("Failed to switch account on init", err));
        }
    }, [accounts, activeAccount]);

    // Switch account mutation
    const switchAccountMutation = useMutation({
        mutationFn: (accountId) => apiClient.post(`/accounts/${accountId}/switch`),
        onSuccess: (data, accountId) => {
            const newAccount = accounts.find(a => a.id === accountId);
            setActiveAccount(newAccount);
            localStorage.setItem('activeAccountId', accountId);
            // Invalidate all queries related to specific account data (subscriptions, payments)
            queryClient.invalidateQueries(['subscriptions']);
            queryClient.invalidateQueries(['payments']);
        }
    });

    const switchAccount = (accountId) => {
        switchAccountMutation.mutate(accountId);
    };

    const value = {
        accounts,
        activeAccount,
        switchAccount,
        isSwitching: switchAccountMutation.isPending,
        isLoading
    };

    return (
        <AccountContext.Provider value={value}>
            {children}
        </AccountContext.Provider>
    );
};
