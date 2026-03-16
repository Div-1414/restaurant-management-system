# 🍽️ Restro Management System

A **Full SaaS Restaurant Management Platform** built to digitally manage restaurant operations including ordering, kitchen workflow, table management, billing, and parcel services.

This platform is designed for **restaurants, cafes, hotels, and cloud kitchens** to modernize their operations with a powerful digital system.

---

# 🚀 Key Features

## 📱 QR Based Customer Ordering
Customers scan a QR code placed on the table and order food directly from their phone.

Features include:
- Digital menu browsing
- Item options (butter, cheese, etc.)
- Quantity selection (including half plates)
- Real-time order placement

---

## 🍳 Kitchen Dashboard (Real-Time)

Kitchen staff receive orders instantly with:

- Real-time order updates
- Order timers
- Item completion tracking
- Parcel order handling
- Sound alerts for new orders

Powered by **WebSockets for instant updates**.

---

## 🪑 Table Management System

Restaurants can manage their tables and floor layout.

Includes:

- Table creation
- Hall/section management
- Table combining
- Table transferring
- Table session tracking

---

## 📦 Parcel Order System

Restaurants can manage takeaway orders through:

- Parcel order queue
- Order acceptance
- Kitchen preparation tracking
- Billing integration

---

## 💳 Billing System

Complete billing workflow including:

- Bill generation
- Paid / unpaid tracking
- Payment mode selection
- Printable bill format

---

## 👨‍💼 Multi-Role Dashboard System

The platform supports multiple roles with separate dashboards:

- Super Admin
- Restaurant Owner
- Manager
- Kitchen Staff
- Customer

Each role has **specific permissions and workflows**.

---

## 📊 Restaurant Analytics

Restaurant owners can monitor:

- Daily sales
- Order statistics
- Restaurant performance
- Operational insights

---

## 📧 Automated Email System

When a restaurant account is created:

- Owner credentials are generated
- Login information is automatically emailed to the owner

---

# 🔐 Login Routes

### Super Admin
/login


### Owner

/owner-login


### Manager

/manager-login


### Kitchen Staff

/kitchen-login


---

# 🏗️ Tech Stack

Frontend:
- React (Vite)
- React Router
- Axios
- Tailwind CSS

Backend:
- Django
- Django REST Framework
- Django Channels

Database:
- SQLite (Development)

Real-time Communication:
- WebSockets

---

# 📂 Project Architecture


restaurant-management-system/
│
├── backend/ # Django backend
│
├── frontend/ # React Vite frontend
│
└── README.md


---

# 🎯 Use Cases

This system is designed for:

- Restaurants
- Cafes
- Hotels
- Cloud Kitchens
- Food Courts

---

# 🧑‍💻 Developed By

**Divy Javiya Prafulbhai**

Full Stack Developer specializing in modern web technologies including React, Django, and real-time systems.

This project demonstrates the development of a complete restaurant management platform with real-time ordering, role-based dashboards, and automated workflows.






# ⚠️ License

This project is **proprietary software**.

Unauthorized copying, modification, distribution, or use of this code is strictly prohibited.

See the `LICENSE` file for details.