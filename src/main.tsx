import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { UserProvider } from './components/client/context/UserContext'; 

const queryClient = new QueryClient();


ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <UserProvider> {/* ✅ Bọc ở đây */}
          <App />
        </UserProvider>
      </QueryClientProvider>
    </BrowserRouter>
  </React.StrictMode>,
);

