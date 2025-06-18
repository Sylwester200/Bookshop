import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api';

const Home = () => {
  const [books, setBooks] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Wszystkie');
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/books')
       .then(res => setBooks(res.data))
       .catch(console.error);
  }, []);

  // zbiór unikalnych nazw kategorii
  const categories = [
    'Wszystkie',
    ...Array.from(
      new Set(
        books.flatMap(b => (b.category || []).map(cat => cat.name))
      )
    ),
  ];

  const filteredBooks = books.filter(book => {
    const matchesSearch = book.title
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

    const matchesCategory =
      selectedCategory === 'Wszystkie' ||
      (book.category || []).some(cat => cat.name === selectedCategory);

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="container mt-4">
      <h1 className="text-center">Lista książek</h1>

      <div className="row mb-4">
        <div className="col-md-6">
          <input
            type="text"
            className="form-control"
            placeholder="Wyszukaj książkę..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="col-md-6">
          <select
            className="form-select"
            value={selectedCategory}
            onChange={e => setSelectedCategory(e.target.value)}
          >
            {categories.map((cat, i) => (
              <option key={i} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="row">
        {filteredBooks.length > 0 ? (
          filteredBooks.map(book => (
            <div className="col-md-4" key={book._id}>
              <div className="card shadow-sm mb-4">
                <div
                  onClick={() => navigate(`/book/${book._id}`)}
                  style={{ cursor: 'pointer' }}
                >
                  <img
                    src={book.image}
                    className="card-img-top"
                    alt={book.title}
                  />
                </div>
                <div className="card-body">
                  <h5 className="card-title">{book.title}</h5>
                  <p className="card-text">{book.author}</p>
                  <p className="card-text fw-bold">
                    {book.price.toFixed(2)} zł
                  </p>
                  <Link
                    to={`/book/${book._id}`}
                    className="btn btn-primary"
                  >
                    Zobacz więcej
                  </Link>
                </div>
              </div>
            </div>
          ))
        ) : (
          <p className="text-center text-muted">Nie znaleziono książek.</p>
        )}
      </div>
    </div>
  );
};

export default Home;
