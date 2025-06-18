import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Login = () => {
  const { login } = useContext(AuthContext);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async () => {
    const success = await login(username, password);
    if (success) {
      navigate('/');
    } else {
      setError('Nieprawidłowy login lub hasło.');
    }
  };

  return (
    <div className="container mt-4">
      <h2 className="text-center">Logowanie</h2>
      <div className="mb-3">
        <input
          type="text"
          className="form-control"
          placeholder="Login"
          value={username}
          onChange={e => setUsername(e.target.value)}
        />
      </div>
      <div className="mb-3">
        <input
          type="password"
          className="form-control"
          placeholder="Hasło"
          value={password}
          onChange={e => setPassword(e.target.value)}
        />
      </div>
      {error && <p className="text-danger">{error}</p>}
      <button
        className="btn btn-primary w-100"
        onClick={handleLogin}
      >
        Zaloguj
      </button>
      <p className="mt-3 text-center">
        Nie masz konta? <a href="/register">Zarejestruj się</a>
      </p>
    </div>
  );
};

export default Login;
