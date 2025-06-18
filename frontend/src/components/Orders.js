import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { AuthContext } from '../context/AuthContext';

const Orders = () => {
  const { user } = useContext(AuthContext);
  const [orders, setOrders] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/');
      return;
    }
    api.get(`/orders/user/${user.id}`)
       .then(res => setOrders(res.data))
       .catch(console.error);
  }, [user, navigate]);

  return (
    <div className="container mt-4">
      <h2 className="text-center">Historia zamówień</h2>
      {orders.length > 0 ? (
        orders.map(o => {
          const grouped = o.items.reduce((acc, it) => {
            const ex = acc.find(x => x.book._id === it.book._id);
            if (ex) ex.quantity += it.quantity;
            else acc.push({ ...it });
            return acc;
          }, []);
          return (
            <div key={o._id} className="card mb-3">
              <div className="card-body">
                <h5 className="card-title">
                  Zamówienie z {new Date(o.createdAt).toLocaleString()}
                </h5>
                <ul>
                  {grouped.map((it, i) => (
                    <li key={i}>
                      {it.book.title} – {it.price.toFixed(2)} zł (Ilość: {it.quantity})
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          );
        })
      ) : (
        <p className="text-center text-muted">Brak zamówień.</p>
      )}
    </div>
  );
};

export default Orders;
