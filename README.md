# BookCourier – Backend Server

**Full-stack backend API** for the BookCourier library-to-home delivery system. Built with Express.js, MongoDB, JWT authentication, and Stripe payments.

Live API: https://bookcourier-server.vercel.app

Frontend Repo: https://github.com/TheLunatic1/bookcourier-client  
Live Site: https://bookcourier-client.vercel.app

### Features
- Role-based authentication (User / Librarian / Admin) using JWT
- Google OAuth login support
- Complete book management (add, edit, publish/unpublish, delete)
- Order system with status tracking (pending → confirmed → shipped → delivered)
- Stripe payment integration (book price + ৳150 delivery)
- Wishlist, Reviews & Ratings (only after delivery)
- Admin panel: manage users, approve librarians, view all orders
- Protected routes with middleware
- Full CRUD operations with proper validation
- CORS configured for deployed frontend

### Tech Stack
| Package        | Purpose                     |
|----------------|-----------------------------|
| Express        | API framework               |
| Mongoose       | MongoDB ODM                 |
| JWT            | Authentication              |
| Stripe         | Payment processing          |
| bcryptjs       | Password hashing            |
| cors           | Cross-origin requests       |
| dotenv         | Environment variables       |
| colors         | Console styling             |

### Environment Variables (`.env`)
```env
PORT=5000
MONGO_URI=your_mongodb_atlas_url
JWT_SECRET=your_strong_secret_key
STRIPE_SECRET_KEY=sk_test_...
CLIENT_URL=https://bookcourier-client.vercel.app
```
How to Run Locally
```Bash
git clone https://github.com/TheLunatic1/bookcourier-server.git
cd bookcourier-server
npm install
npm run dev
API will run on: http://localhost:5000
```
### API Endpoints (Key Routes)

| Method | Endpoint                              | Description                              | Access        |
|--------|---------------------------------------|------------------------------------------|---------------|
| POST   | `/api/users/register`                 | Register new user                        | Public        |
| POST   | `/api/users/login`                    | Login with email & password              | Public        |
| POST   | `/api/users/google-login`             | Login/Register with Google               | Public        |
| PATCH  | `/api/users/profile`                  | Update name & photo                      | Authenticated |
| POST   | `/api/books`                          | Add new book                             | Librarian     |
| GET    | `/api/books`                          | Get all available books                  | Public        |
| GET    | `/api/books/my`                       | Get librarian's books                    | Librarian     |
| GET    | `/api/books/:id`                      | Get single book details                  | Public        |
| PATCH  | `/api/books/:id/publish`              | Toggle availability                      | Librarian     |
| DELETE | `/api/books/:id`                      | Delete book + all orders                 | Librarian/Admin |
| POST   | `/api/orders`                         | Create new order                         | User          |
| GET    | `/api/orders/my`                      | Get user's orders                        | User          |
| GET    | `/api/orders/all`                     | Get all orders (admin/librarian)         | Admin/Librarian |
| PATCH  | `/api/orders/:id/status`              | Update order status                      | Librarian/Admin |
| POST   | `/api/payment/create-checkout-session`| Create Stripe payment session            | Authenticated |
| GET    | `/api/wishlist`                       | Get user's wishlist                      | Authenticated |
| POST   | `/api/wishlist`                       | Add book to wishlist                     | Authenticated |
| DELETE | `/api/wishlist/:bookId`               | Remove from wishlist                     | Authenticated |
| POST   | `/api/reviews/:bookId`                | Add review (after delivery)              | User          |
| GET    | `/api/admin/users`                    | Get all users                            | Admin         |
| GET    | `/api/admin/librarian-requests`       | Get pending librarian requests           | Admin         |
| PATCH  | `/api/admin/make-librarian/:id`       | Approve librarian request                | Admin         |
| PATCH  | `/api/admin/reject-librarian/:id`     | Reject librarian request                 | Admin         |
| PATCH  | `/api/admin/:id/role`                 | Change user role (user ↔ librarian)      | Admin         |

### Deployment
- Deployed on Vercel (serverless functions)