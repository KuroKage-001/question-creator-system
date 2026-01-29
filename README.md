# Full-Stack Application – Developer Guide  
**React (Client) + Laravel (Server)**

This repository contains a **full-stack web application** with:
- **React + TypeScript (Vite)** for the frontend
- **Laravel** for the backend API

---

## 📁 Root Structure

root
│
├─ client
└─ server 

---

## 📁 Client (React Frontend)

client/
│
├─ src
│ ├─ assets
│ ├─ components
│ ├─ context
│ ├─ hooks
│ ├─ layouts
│ ├─ pages
│ ├─ utils
│ ├─ App.tsx
│ ├─ index.css
│ └─ main.tsx
│
├─ package.json
├─ tsconfig.json
└─ vite.config.ts


---

### 📂 `client/src/`

Contains all frontend source code.

---

### `assets/`
Static frontend resources such as images, icons, and fonts.

---

### `components/`
Reusable UI components.

**Rules:**
- UI-only
- No API calls
- Reusable across pages

---

### `context/`
Global state management using **Context API + Reducer pattern**.

Each context feature must contain **three files**:

context/
└─ feature-name/
  ├─ FeatureContext.tsx
  ├─ FeatureReducer.ts
  └─ FeatureState.ts


**Responsibilities:**

- `FeatureContext.tsx`  
  Creates the context, provider, and connects reducer/state

- `FeatureReducer.ts`  
  Pure reducer payload and action handling

- `FeatureState.ts`  
  Initial state 

**Rules:**
- One feature per folder
- No UI inside context
- No API calls in reducers

---

### `hooks/`
Reusable logic and side effects.

**Examples:**
- API calls to Laravel
- Auth handling
- Data fetching

---

### `layouts/`
Page wrappers such as Navbar, Sidebar, and Footer.

---

### `pages/`
Route-based views.

**Rules:**
- One page per route
- Pages may call APIs

---

### `utils/`
Pure helper functions and constants.

---

### Core Client Files

- `App.tsx` – Routing, layout, providers
- `main.tsx` – App entry point
- `index.css` – Global styles

---

## 📁 Server (Laravel Backend)


server/
│
├─ app
│ ├─ Http
│ │ ├─ Controllers
│ │ ├─ Request
│ │ └─ Middleware
│ ├─ Models
│ └─ Providers
│
├─ database
│ ├─ migrations
│ ├─ seeders
│ └─ factories
│
├─ routes
│ ├─ api.php
│ └─ web.php
│
├─ config
├─ storage
├─ public
└─ .env



---

### 📂 `routes/api.php`
Defines all API endpoints consumed by the React client.

**Guidelines:**
- Use RESTful routes
- Group routes with middleware
- Prefer `Route::apiResource` when possible

---

### 📂 `app/Http/Controllers`
Handles API logic and request processing.

**Rules:**
- Controllers should be thin
- Business logic should be delegated to services (if applicable)

---

### 📂 `app/Models`
Eloquent models representing database tables.

---

### 📂 `database/`
Contains:
- Migrations
- Seeders
- Factories

---

### 📂 `config/`
Laravel configuration files.

---

### 📂 `storage/`
Logs, cache, and file uploads.

---

## 🔗 Client ↔ Server Communication

- React communicates with Laravel via **REST API**
- API base URL is configured in the client (`.env`)
- Authentication typically handled via:
  - Laravel Sanctum (recommended)
  - JWT (optional)

**Example API Flow:**

React Page → Custom Hook → Axios → Laravel API → Controller → Model → Response

