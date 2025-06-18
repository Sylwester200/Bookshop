Autor: Sylwester Smoroński<br />

## Opis projektu

Aplikacja sklep z książkami „Bookshop” zbudowana jest w React i Node.js z użyciem Express i MongoDB/Mongoose. Zawiera realizację typowych operacji CRUD, transakcje i agregacje raportowe.

## Architektura aplikacji
-   **Express.js** jako lekki framework HTTP
-   **Mongoose** jako ODM do modelowania danych MongoDB
-   **Routes**: moduły: `books`, `categories`, `users`, `orders`, `reports`
-   **CORS**: skonfigurowane dla frontendu `http://localhost:3000`
-   **Sesje** przez `express-session`

---

## Operacje CRUD na kolekcjach
Testy (kod w formacie JSON) zrobiłem w programie Postman.

### Książki (`/api/books`)

-   `GET /` – zwraca listę wszystkich książek
-   `GET /:id` – zwraca szczegóły jednej książki
-   `POST /` – tworzy nową książkę
-   `PUT /:id` – edytuje istniejącą książkę
-   `DELETE /:id` – usuwa książkę

**Model Mongoose:**
```javascript
const { Schema, model } = require('mongoose');

const bookSchema = new Schema({
  title: String,
  author: String,
  description: String,
  price: Number,
  image: {type: String, required: false },
  stock: Number,
  category: [{ type: Schema.Types.ObjectId, ref: 'Category' }]
});

module.exports = model('Book', bookSchema);

```

**Przykład:**
```javascript
// usunięcie książki
router.delete('/:id', async (req, res) => {
  await Book.findByIdAndDelete(req.params.id);
  res.json({ message: 'Książka usunięta' });
})
```

**Zwracany format JSON(test):**
Dla książki: 685205a93889e2283029f37c
```json
{
    "message": "Książka usunięta"
}
```

### Kategorie (`/api/categories`)

-   `GET /` – zwraca listę kategorii
-   `POST /` – tworzy nową kategorię
-   `PUT /:id` – edytuje nazwę kategorii
-   `DELETE /:id` – usuwa kategorię

**Model Mongoose:**
```javascript
const { Schema, model } = require('mongoose');

const categorySchema = new Schema({
  name: { type: String, required: true, unique: true }
});

module.exports = model('Category', categorySchema);
```

**Przykład:**
```javascript
// edycja kategorii
router.put('/:id', async (req, res) => {
  const cat = await Category.findByIdAndUpdate(req.params.id,
    { name: req.body.name },
    { new: true }
  );
  res.json(cat);
});
```

**Wpisany format JSON:**
```json
{
    "name": "Fantasy"
}
```

**Zwracany format JSON:**
```json
{
    "_id": "68515523884a599de33c14c4",
    "name": "Fantasy",
    "__v": 0
}
```

### Użytkownicy (`/api/users`)

-   `POST /register` – rejestracja użytkownika (zapis do MongoDB)
-   `POST /login` – uwierzytelnianie (porównanie danych)
-   `POST /logout` – niszczenie sesji
-   `GET /` – zwraca listę użytkowników (bez haseł)

**Model Mongoose:**
```js
const { Schema, model } = require('mongoose');

const userSchema = new Schema({
  username: { type: String, unique: true },
  password: String,
  orders: [{ type: Schema.Types.ObjectId, ref: 'Order' }]
});

module.exports = model('User', userSchema);

```

**Przykład logowania:**
```javascript
// Logowanie
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username, password });
    if (!user) return res.status(400).json({ message: 'Nieprawidłowy login lub hasło' });
    res.json({ message: 'Zalogowano pomyślnie', userId: user._id });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
```

**Wpisany format JSON:**
```json
{
    "username": "login",
    "password": "haslo"
}
```

**Zwracany format JSON:**
```json
{
    "message": "Zalogowano pomyślnie",
    "userId": "68515115c680e31bf0515704"
}
```

### Zamówienia (`/api/orders`)

-   `GET /` – zwraca wszystkie zamówienia
-   `GET /user/:userId` – historia zamówień konkretnego użytkownika
-   `POST /` – składanie zamówienia (w transakcji)
-   `POST /:orderId/cancel` – anulowanie zamówienia (w transakcji)

**Model Mongoose:**
```javascript
const { Schema, model } = require('mongoose');

const orderSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  items: [{ 
    book: { type: Schema.Types.ObjectId, ref: 'Book' }, 
    quantity: { type: Number, required: true }, 
    price: { type: Number, required: true } 
  }],
  total: { type: Number, required: true },
  status: { type: String, default: 'active', enum: ['active', 'cancelled'] }
}, { timestamps: true });

module.exports = model('Order', orderSchema);
```

**Przykład:**
```js
// Pobranie zamówień konkretnego użytkownika
router.get('/user/:userId', async (req, res) => {
  const orders = await Order.find({ user: req.params.userId })
    .populate('items.book', 'title');
  res.json(orders);
});
```

**Zwrócony format JSON:**
Dla usera: 68515115c680e31bf0515704
```json
[
    {
        "_id": "685157942dc2a78414ee3c6e",
        "user": "68515115c680e31bf0515704",
        "items": [
            {
                "book": {
                    "_id": "68515711b7ea9d3bc5ae1aee",
                    "title": "Władca Pierścieni"
                },
                "quantity": 2,
                "price": 49.99,
                "_id": "685157942dc2a78414ee3c6f"
            },
            {
                "book": {
                    "_id": "68515711b7ea9d3bc5ae1aef",
                    "title": "Hobbit"
                },
                "quantity": 1,
                "price": 39.99,
                "_id": "685157942dc2a78414ee3c70"
            }
        ],
        "total": 139.97,
        "createdAt": "2025-06-17T11:55:00.605Z",
        "__v": 0,
        "status": "cancelled"
    },
    {
        "status": "active",
        "_id": "685160a57e306287f45367b1",
        "user": "68515115c680e31bf0515704",
        "items": [
            {
                "book": {
                    "_id": "68515711b7ea9d3bc5ae1aee",
                    "title": "Władca Pierścieni"
                },
                "quantity": 2,
                "price": 49.99,
                "_id": "685160a57e306287f45367b2"
            },
            {
                "book": {
                    "_id": "68515711b7ea9d3bc5ae1aef",
                    "title": "Hobbit"
                },
                "quantity": 1,
                "price": 39.99,
                "_id": "685160a57e306287f45367b3"
            }
        ],
        "total": 139.97,
        "createdAt": "2025-06-17T12:33:41.291Z",
        "__v": 0
    },
    {
        "_id": "6851659ef26b0fc21f1b72d6",
        "user": "68515115c680e31bf0515704",
        "items": [
            {
                "book": {
                    "_id": "68515711b7ea9d3bc5ae1aee",
                    "title": "Władca Pierścieni"
                },
                "quantity": 1,
                "price": 49.99,
                "_id": "6851659ef26b0fc21f1b72d7"
            },
            {
                "book": {
                    "_id": "68515711b7ea9d3bc5ae1aef",
                    "title": "Hobbit"
                },
                "quantity": 1,
                "price": 39.99,
                "_id": "6851659ef26b0fc21f1b72d8"
            }
        ],
        "total": 89.98,
        "status": "active",
        "createdAt": "2025-06-17T12:54:54.262Z",
        "__v": 0
    },
    {
        "_id": "685165bdf26b0fc21f1b72e7",
        "user": "68515115c680e31bf0515704",
        "items": [
            {
                "book": {
                    "_id": "68515711b7ea9d3bc5ae1aee",
                    "title": "Władca Pierścieni"
                },
                "quantity": 2,
                "price": 49.99,
                "_id": "685165bdf26b0fc21f1b72e8"
            },
            {
                "book": {
                    "_id": "68515711b7ea9d3bc5ae1aef",
                    "title": "Hobbit"
                },
                "quantity": 1,
                "price": 39.99,
                "_id": "685165bdf26b0fc21f1b72e9"
            }
        ],
        "total": 139.97,
        "status": "cancelled",
        "createdAt": "2025-06-17T12:55:25.279Z",
        "__v": 0
    }
]
```
---

## Transakcje i kontrola równoczesnego dostępu

### Składanie zamówienia

1.  Start sesji Mongoose i transakcji.
2.  Weryfikacja użytkownika (`User.findById().session(session)`).
3.  Dla każdej pozycji w zamówieniu, weryfikacja stanu magazynowego i zmniejszenie `book.stock`, a następnie `book.save({ session })`.
4.  Utworzenie dokumentu `Order` i zapis w ramach sesji.
5.  Dodanie referencji do zamówienia w `user.orders` i `user.save({ session })`.
6.  Zatwierdzenie transakcji (`commitTransaction()`) lub jej wycofanie (`abortTransaction()`) w bloku `catch`.

Obsługa błędów pozwala zachować spójność danych nawet przy równoczesnych żądaniach zakupu tej samej książki.

**Kod:**
```js
// Złożenie zamówienia
router.post('/', async (req, res) => {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();
    const { userId, items } = req.body;

    // Pobranie użytkownika
    const user = await User.findById(userId).session(session);
    if (!user) throw new Error('Nieprawidłowy użytkownik');

    // Przygotowanie pozycji i zmniejszenie stock
    let total = 0;
    const orderItems = [];
    for (const { bookId, quantity } of items) {
      const book = await Book.findById(bookId).session(session);
      if (!book) throw new Error(`Książka o ID ${bookId} nie istnieje`);
      if (book.stock < quantity) throw new Error(`Niewystarczający stan dla ${book.title}`);
      book.stock -= quantity;
      await book.save({ session });
      total += book.price * quantity;
      orderItems.push({ book: book._id, quantity, price: book.price });
    }

    // Zapisanie zamówienia
    const order = new Order({
      user: user._id,
      items: orderItems,
      total
    });
    await order.save({ session });

    // Dodanie referencji do użytkownika
    user.orders.push(order._id);
    await user.save({ session });

    await session.commitTransaction();
    session.endSession();

    res.json(order);
  } catch (err) {
      await session.abortTransaction();
      session.endSession();
      res.status(400).json({ error: err.message });
  }
});
```

**Wpisany format JSON:**
```json
{
  "userId": "685194efacd3ac82a59b94b4",
  "items": [
    {
      "bookId": "68515711b7ea9d3bc5ae1af0",
      "quantity": 2
    },
    {
      "bookId": "68515711b7ea9d3bc5ae1aef",
      "quantity": 3
    }
  ]
}
```

**Zwrócony format JSON:**
```json
{
    "user": "685194efacd3ac82a59b94b4",
    "items": [
        {
            "book": "68515711b7ea9d3bc5ae1af0",
            "quantity": 2,
            "price": 39.99,
            "_id": "685206e43889e2283029f387"
        },
        {
            "book": "68515711b7ea9d3bc5ae1aef",
            "quantity": 3,
            "price": 39.99,
            "_id": "685206e43889e2283029f388"
        }
    ],
    "total": 199.95,
    "status": "active",
    "_id": "685206e43889e2283029f386",
    "createdAt": "2025-06-18T00:23:00.401Z",
    "updatedAt": "2025-06-18T00:23:00.401Z",
    "__v": 0
}
```

### Anulowanie zamówienia
1.  Pobranie zamówienia i jego pozycji w ramach nowej sesji transakcyjnej.
2.  Przywrócenie stanów magazynowych dla każdej książki (`$inc: { stock: +quantity }`).
3.  Usunięcie referencji do zamówienia z tablicy `user.orders`.
4.  Zmiana statusu zamówienia na `order.status='cancelled'` i zapis.
5.  Zatwierdzenie (`commit`) lub wycofanie (`rollback`) transakcji.

**Kod:**
```js
// Anulowanie zamówienia
router.post('/:orderId/cancel', async (req, res) => {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();

    const order = await Order.findById(req.params.orderId).session(session);
    if (!order || order.status === 'cancelled')
      return res.status(400).json({ message: 'Zamówienie nie istnieje lub już anulowane' });

    // Przywrócenie ilości
    for (const it of order.items) {
      await Book.findByIdAndUpdate(
        it.book,
        { $inc: { stock: it.quantity } },
        { session }
      );
    }

    // Usuięcie referencji z użytkownika
    await User.findByIdAndUpdate(
      order.user,
      { $pull: { orders: order._id } },
      { session }
    );

    order.status = 'cancelled';
    await order.save({ session });

    await session.commitTransaction();
    res.json({ message: 'Anulowano', order });
  } catch (e) {
    await session.abortTransaction();
    res.status(500).json({ error: e.message });
  } finally {
    session.endSession();
  }
});
```

**Zwrócony format JSON:**
dla zamówienia: 685206e43889e2283029f386
```json
{
    "message": "Anulowano",
    "order": {
        "_id": "685206e43889e2283029f386",
        "user": "685194efacd3ac82a59b94b4",
        "items": [
            {
                "book": "68515711b7ea9d3bc5ae1af0",
                "quantity": 2,
                "price": 39.99,
                "_id": "685206e43889e2283029f387"
            },
            {
                "book": "68515711b7ea9d3bc5ae1aef",
                "quantity": 3,
                "price": 39.99,
                "_id": "685206e43889e2283029f388"
            }
        ],
        "total": 199.95,
        "status": "cancelled",
        "createdAt": "2025-06-18T00:23:00.401Z",
        "updatedAt": "2025-06-18T00:27:44.533Z",
        "__v": 0
    }
}
```

---

## Raportowanie i agregacje

### Sprzedaż i przychód na książke (`api/reports/sales-per-book`)
- **End-point**  
  `GET /api/reports/sales-per-book`

- **Opis**  
  Dla każdej książki sumuje się liczbę sprzedanych egzemplarzy (`totalSold`) oraz łączny przychód (`revenue = price * quantity`) na podstawie wszystkich zamówień (pola `items` w kolekcji `orders`).

**Zwracany format JSON(test):**  
```json
[
    {
        "totalSold": 3,
        "revenue": 119.97,
        "bookId": "68515711b7ea9d3bc5ae1af0",
        "title": "Harry Potter i Kamień Filozoficzny"
    },
    {
        "totalSold": 7,
        "revenue": 349.93,
        "bookId": "68515711b7ea9d3bc5ae1aee",
        "title": "Władca Pierścieni"
    },
    {
        "totalSold": 5,
        "revenue": 199.95000000000002,
        "bookId": "68515711b7ea9d3bc5ae1aef",
        "title": "Hobbit"
    },
    {
        "totalSold": 2,
        "revenue": 59.98,
        "bookId": "68515711b7ea9d3bc5ae1af2",
        "title": "Sherlock Holmes"
    }
]
```

**Kod:**
```js
// sprzedaż i przychód na książke
router.get('/sales-per-book', async (_, res) => {
  const result = await Order.aggregate([
    { $unwind: '$items' },
    { $group: {
        _id: '$items.book',
        totalSold: { $sum: '$items.quantity' },
        revenue:   { $sum: { $multiply: ['$items.price', '$items.quantity'] } }
    }},
    { $lookup: {
        from: 'books',
        localField: '_id',
        foreignField: '_id',
        as: 'book'
    }},
    { $unwind: '$book' },
    { $project: {
        _id: 0,
        bookId: '$_id',
        title: '$book.title',
        totalSold: 1,
        revenue: 1
    }}
  ]);
  res.json(result);
});
```

### Sprzedaż wg kategorii (`api/reports/sales-per-category`)
- **End-point**: `GET /api/reports/sales-per-category`
- **Opis**  
  Dla każdej książki sumuje się liczbę sprzedanych egzemplarzy (`totalSold`) oraz łączny przychód (`revenue = price * quantity`) na podstawie wszystkich zamówień (pola `items` w kolekcji `orders`).
  1. łączny przychód (`revenue`)

  2. łączną liczbę sprzedanych egzemplarzy (`sold`)
     na podstawie wszystkich zamówień (`orders.items`), łącząc informacje z kolekcji `books` i `categories`.

**Zwracany format JSON(test):**
```json
[
    {
        "_id": "Przygodowe",
        "revenue": 669.85,
        "sold": 15
    },
    {
        "_id": "Fantasy",
        "revenue": 669.85,
        "sold": 15
    },
    {
        "_id": "Epicka",
        "revenue": 349.93,
        "sold": 7
    },
    {
        "_id": "Dla młodzieży",
        "revenue": 119.97,
        "sold": 3
    },
    {
        "_id": "Kryminał",
        "revenue": 59.98,
        "sold": 2
    },
    {
        "_id": "Detektywistyczna",
        "revenue": 59.98,
        "sold": 2
    },
    {
        "_id": "Klasyka",
        "revenue": 59.98,
        "sold": 2
    }
]
```

**Kod:**
```js
// sprzedaż wg kategorii
router.get('/sales-per-category', async (_, res) => {
  const report = await Order.aggregate([
    { $unwind: '$items' },
    { $lookup: {
        from: 'books',
        localField: 'items.book',
        foreignField: '_id',
        pipeline: [{ $project: { category: 1, price: '$items.price', qty: '$items.quantity' } }],
        as: 'book'
    }},
    { $unwind: '$book' },
    { $unwind: '$book.category' },
    { $lookup: {
        from: 'categories',
        localField: 'book.category',
        foreignField: '_id',
        as: 'cat'
    }},
    { $unwind: '$cat' },
    { $group: {
        _id: '$cat.name',
        revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
        sold:    { $sum: '$items.quantity' }
    }},
    { $sort: { revenue: -1 } }
  ]);
  res.json(report);
});
```

### Niski stan magazynowy (`/api/reports/low-stock`)
- **End-point**: `GET /api/reports/low-stock?threshold=X`
- Domyślny próg `threshold=5`
- Zwraca listę książek, których stan magazynowy (`stock`) jest mniejszy lub równy podanej wartości.

**Zwracany format JSON(test):**
```json
[
    {
        "_id": "68515711b7ea9d3bc5ae1af8",
        "title": "Krzyżacy",
        "stock": 4
    }
]
```

**Kod:**
```javascript
// niski stan magazynowy
router.get('/low-stock', async (req, res) => {
  const threshold = Number(req.query.threshold) || 5;
  const low = await Book.find({ stock: { $lt: threshold } }).select('title stock');
  res.json(low);
});
```

Pozwala to na dynamiczne raportowanie i proste, parametryzowane kwerendy, które mogą być wywoływane bezpośrednio z panelu administracyjnego na frontendzie.

---

## Technologie i ich możliwości

-   **Node.js + Express**
    -   Asynchroniczne operacje I/O idealne do obsługi zapytań do bazy danych bez blokowania pętli zdarzeń.
    -   Modularny routing pozwala na logiczny podział aplikacji.
-   **MongoDB + Mongoose**
    -   Elastyczne schematy dokumentowe ułatwiają ewolucję modelu danych.
    -   Transakcje ACID (dla replika-set) gwarantują spójność operacji wieloetapowych.
    -   Metoda `populate()` upraszcza "łączenie" powiązanych dokumentów (jak `JOIN` w SQL).
-   **express-session**
    -   Zarządzanie stanem sesji po stronie serwera, oparte na `cookie`.
-   **CORS**
    -   Precyzyjna kontrola dostępu dla aplikacji frontendowych, kluczowa dla bezpieczeństwa.

---

## Komentarz i dyskusja zastosowanych technik

-   **Schemat dokumentowy vs relacyjny**: Zastosowanie referencji `ObjectId` i `populate()` stanowi kompromis między denormalizacją a spójnością danych. Kategorie są osobną kolekcją, co ułatwia zarządzanie nimi, a jednocześnie są łatwo dostępne z poziomu książki.
-   **Transakcje w MongoDB**: Są kluczowe dla operacji o znaczeniu biznesowym, jak składanie i anulowanie zamówień. Wymagają one jednak odpowiedniej konfiguracji środowiska (replika-set).
-   **Wydajność**: Należy pamiętać o tworzeniu indeksów na polach często używanych do wyszukiwania (np. `username` w kolekcji `users`, `stock` w `books`). W przypadku bardziej złożonych raportów, potoki agregacji MongoDB (`aggregate`) będą znacznie wydajniejsze niż przetwarzanie danych po stronie aplikacji.
-   **Bezpieczeństwo**: Przedstawiony kod jest uproszczony. W środowisku produkcyjnym absolutnie konieczne jest:
    -   Szyfrowanie haseł użytkowników (np. za pomocą `bcrypt`).
    -   Używanie protokołu HTTPS.
    -   Zabezpieczenie ciasteczek sesyjnych (flagi `HttpOnly`, `Secure`).
    -   Implementacja mechanizmów ograniczających liczbę zapytań (`rate-limiting`).

