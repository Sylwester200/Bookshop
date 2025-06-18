import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Register = () => {
  const { register } = useContext(AuthContext);  // ← potrzebujemy metody register()
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const navigate                = useNavigate();

  const handleRegister = async () => {
    if (!username || !password) {
      setError('Wypełnij wszystkie pola');
      return;
    }
    const ok = await register(username, password);
    if (ok) {
      navigate('/login');
    } else {
      setError('Użytkownik o tej nazwie już istnieje');
    }
  };

  return (
    <div className="container mt-4">
      <h2 className="text-center">Rejestracja</h2>
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
        className="btn btn-success w-100"
        onClick={handleRegister}
      >
        Zarejestruj
      </button>
    </div>
  );
};

export default Register;
