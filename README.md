
# Salon Booking System

A full-stack online salon booking platform with three separate roles — **Admin**, **Vendor**, and **User (Customer)** — each with their own dashboard and permissions.

Built with a **Laravel REST API** backend and a **React (Vite)** frontend.

---

## 🚀 Features

### 🔑 Admin Panel
- Manage all vendors (approve, reject, suspend)
- Manage all users
- View and manage all bookings across the platform
- Manage service categories and global settings
- View platform-wide revenue and analytics
- Manage offers / promotions

### 🏪 Vendor Panel
- Vendor registration & profile management
- Add/manage own salon services and pricing
- Manage working hours and availability
- View and manage incoming bookings
- Track earnings and booking history

### 👤 User (Customer) Panel
- Browse salons and services
- Book, reschedule, or cancel appointments
- View booking history
- Leave ratings & reviews
- Manage profile

---

## 🛠️ Tech Stack

| Layer      | Technology              |
|------------|--------------------------|
| Frontend   | React + Vite             |
| Backend    | Laravel (REST API)       |
| Database   | MySQL                    |
| Auth       | Laravel Sanctum          |
| Styling    | Tailwind CSS             |

---

## 📁 Project Structure

```
beauty-saloon/
├── backend/              # Laravel API
│   ├── app/
│   ├── routes/
│   │   └── api.php       # Admin, Vendor, User API routes
│   ├── database/
│   │   └── migrations/
│   └── .env.example
│
├── frontend/             # React + Vite app
│   ├── src/
│   │   ├── admin/        # Admin panel components/pages
│   │   ├── vendor/       # Vendor panel components/pages
│   │   ├── user/         # User panel components/pages
│   │   ├── components/   # Shared/reusable components
│   │   ├── routes/       # Route definitions per role
│   │   └── services/     # API calls (axios instances etc.)
│   ├── public/
│   └── package.json
│
└── README.md
```

---

## ⚙️ Installation & Setup

### 1. Clone the repository
```bash
git clone https://github.com/your-username/salon-booking-system.git
cd salon-booking-system
```

### 2. Backend Setup (Laravel)
```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
```
Update your `.env` with database credentials, then:
```bash
php artisan migrate --seed
php artisan serve
```
Backend will run at: `http://127.0.0.1:8000`

**Sanctum setup note:** make sure `SANCTUM_STATEFUL_DOMAINS` and `SESSION_DOMAIN` in your `.env` match your frontend URL (e.g. `localhost:5173`), and that `config/cors.php` has `supports_credentials` set to `true` if you're using cookie-based SPA auth.

### 3. Frontend Setup (React + Vite)
```bash
cd frontend
npm install
npm run dev
```
Frontend will run at: `http://localhost:5173`

> Make sure your frontend `.env` (or config file) points to the correct backend API base URL, e.g.:
> ```
> VITE_API_BASE_URL=http://127.0.0.1:8000/api
> ```

---

## 🔐 Roles & Access

| Role   | Access                                                   |
|--------|-----------------------------------------------------------|
| Admin  | Full control over vendors, users, bookings, and settings |
| Vendor | Manages own salon, services, and bookings                |
| User   | Browses salons and books appointments                     |

Each role has its own protected routes and dashboard on the frontend, and its own set of API endpoints/middleware on the backend (e.g. `role:admin`, `role:vendor`, `role:user`).

---

## 📸 Screenshots

*(Add screenshots of Admin, Vendor, and User dashboards here)*

---

## 📌 Roadmap / To-Do

- [ ] Payment gateway integration
- [ ] Email/SMS booking notifications
- [ ] Vendor subscription plans
- [ ] Multi-location salon support

---

## 🤝 Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you'd like to change.

---

## 📄 License

This project is licensed under the MIT License — update this section if you choose a different license.

