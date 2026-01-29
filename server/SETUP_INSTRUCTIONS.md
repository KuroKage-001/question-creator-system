# Question Creator System - Setup Instructions

## Backend Setup (Laravel)

1. Install PHP PDF Parser package:
```bash
cd server
composer require smalot/pdfparser
```

2. Create storage link for public files:
```bash
php artisan storage:link
```

3. Run migrations:
```bash
php artisan migrate
```

4. Start Laravel server:
```bash
php artisan serve
```

## Frontend Setup (React)

1. Install dependencies (if not already done):
```bash
cd client
npm install
```

2. Start development server:
```bash
npm run dev
```

## Usage

1. Navigate to http://localhost:5173/create-questions
2. Enter a module title
3. Upload a PDF file
4. The system will automatically extract text and generate questions
5. View the generated questions below the form

## API Endpoints

- POST `/api/upload-pdf` - Upload PDF and generate questions
- GET `/api/modules` - Get all PDF modules
- GET `/api/questions/{moduleId}` - Get questions for a specific module
