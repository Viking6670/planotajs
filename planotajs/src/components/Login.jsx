// src/components/Login.jsx
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '@/styles/login.css';

function Login() {
  const [telegramId, setTelegramId] = useState('');
  const [rememberDevice, setRememberDevice] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkRememberedDevice = async () => {
      try {
        const response = await axios.get('/api/remembered-device', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        if (response.data.telegram_id) {
          setTelegramId(response.data.telegram_id);
          setRememberDevice(true);
        }
      } catch (err) {
        console.error('Nav atcerētas ierīces:', err.message);
      }
    };
    checkRememberedDevice();
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await axios.post('/api/login', { telegram_id: telegramId });
      localStorage.setItem('token', response.data.token);
      const firstName = response.data.user.first_name || 'Lietotājs';
      toast.success(`Sveiks, ${firstName}!`, { position: 'top-right', autoClose: 3000 });

      if (rememberDevice) {
        await axios.post('/api/remember-device', { telegram_id: telegramId }, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
      }
      navigate('/tasks');
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Neizdevās savienoties ar serveri.';
      toast.error(errorMessage, { position: 'top-right', autoClose: 5000 });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <h1>Plānotājs</h1>
      <form onSubmit={handleLogin}>
        <input
          type="text"
          placeholder="Ievadiet Telegram ID"
          value={telegramId}
          onChange={(e) => setTelegramId(e.target.value)}
          disabled={isLoading}
          aria-label="Telegram ID"
        />
        <label className="remember-device">
          <input
            type="checkbox"
            checked={rememberDevice}
            onChange={(e) => setRememberDevice(e.target.checked)}
            disabled={isLoading}
          />
          Atcerēties ierīci
        </label>
        <button type="submit" disabled={!telegramId || isLoading}>
          Ielogoties
        </button>
      </form>
      <ToastContainer />
    </div>
  );
}

export default Login;