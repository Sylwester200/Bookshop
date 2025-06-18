import React, { useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api';
import { CartContext } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';

const ProductDetail = () => {
  const { id } = useParams();
  const [book, setBook] = useState(null);
  const { addToCart } = useContext(CartContext);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    api.get(`/books/${id}`)
       .then(res => setBook(res.data))
       .catch(console.error);
  }, [id]);

  if (!book) return <p className="text-center mt-4">Ładowanie…</p>;

  return (
    <div className="container mt-4">
      <div className="row">
        <div className="col-md-4">
          <img
            src={book.image}
            alt={book.title}
            className="img-fluid rounded"
          />
        </div>
        <div className="col-md-8">
          <h2>{book.title}</h2>
          <p className="text-muted">Autor: {book.author}</p>
          <p>{book.description}</p>
          <p className="h4">{book.price.toFixed(2)} zł</p>
          {user ? (
            <button
              className="btn btn-success"
              onClick={() => addToCart({
                id: book._id,
                title: book.title,
                price: book.price
              })}
            >
              Dodaj do koszyka
            </button>
          ) : (
            <p className="text-danger">Musisz się zalogować.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
