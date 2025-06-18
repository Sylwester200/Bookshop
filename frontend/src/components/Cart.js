import React, { useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { CartContext } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';

const Cart = () => {
  const { cart, removeFromCart, clearCart } = useContext(CartContext);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) navigate('/');
  }, [user, navigate]);

  // Grupowanie duplikatów
  const groupedCart = cart.reduce((acc, book) => {
    const ex = acc.find(i => i.id === book.id);
    if (ex) ex.quantity += 1;
    else acc.push({ ...book, quantity: 1 });
    return acc;
  }, []);

  const totalPrice = groupedCart
    .reduce((sum, b) => sum + b.price * b.quantity, 0)
    .toFixed(2);

  const handleOrder = async () => {
    try {
      const items = groupedCart.map(b => ({
        bookId: b.id,
        quantity: b.quantity
      }));
      await api.post('/orders', { userId: user.id, items });
      clearCart();
      navigate('/orders');
    } catch (err) {
      console.error(err);
      alert('Nie udało się złożyć zamówienia');
    }
  };

  return (
    <div className="container mt-4">
      <h2 className="text-center">Koszyk</h2>
      {groupedCart.length === 0 ? (
        <p className="text-center text-muted">Twój koszyk jest pusty.</p>
      ) : (
        <>
          <table className="table table-striped">
            <thead>
              <tr>
                <th>Książka</th>
                <th>Ilość</th>
                <th>Cena (szt.)</th>
                <th>Łączna cena</th>
                <th>Akcja</th>
              </tr>
            </thead>
            <tbody>
              {groupedCart.map(book => (
                <tr key={book.id}>
                  <td>{book.title}</td>
                  <td>{book.quantity}</td>
                  <td>{book.price.toFixed(2)} zł</td>
                  <td>{(book.price * book.quantity).toFixed(2)} zł</td>
                  <td>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => removeFromCart(book.id)}
                    >
                      Usuń
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="text-end">
            <h4>
              Łączna wartość:{' '}
              <span className="fw-bold">{totalPrice} zł</span>
            </h4>
          </div>

          <div className="text-end mt-3">
            <button
              className="btn btn-success"
              onClick={handleOrder}
            >
              Złóż zamówienie
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default Cart;
