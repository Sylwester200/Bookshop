import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api';
import { AuthContext } from '../context/AuthContext';

const Navbar = () => {
  const { user, setUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await api.post('/users/logout');
    setUser(null);
    navigate('/');
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-primary">
      <div className="container">
        <Link className="navbar-brand" to="/">Sklep z Książkami</Link>
        <ul className="navbar-nav ms-auto">
          <li className="nav-item"><Link className="nav-link" to="/">Home</Link></li>
          {user ? (
            <>
              <li className="nav-item"><Link className="nav-link" to="/cart">Koszyk</Link></li>
              <li className="nav-item"><Link className="nav-link" to="/orders">Historia</Link></li>
              <li className="nav-item">
                <button className="btn btn-danger" onClick={handleLogout}>
                  Wyloguj
                </button>
              </li>
            </>
          ) : (
            <>
              <li className="nav-item"><Link className="nav-link" to="/login">Logowanie</Link></li>
              <li className="nav-item"><Link className="nav-link" to="/register">Rejestracja</Link></li>
            </>
          )}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
