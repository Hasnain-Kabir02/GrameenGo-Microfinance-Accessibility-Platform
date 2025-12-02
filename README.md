# GrameenGo - Microfinance Accessibility Platform

<div align="center">
  <img src="https://via.placeholder.com/150/1E9A56/FFFFFF?text=G" alt="GrameenGo Logo" width="120" height="120">
  
  <h3>Connecting Small Businesses with Microfinance Opportunities in Bangladesh</h3>
  
  [![Made with FastAPI](https://img.shields.io/badge/FastAPI-0.110.1-009688.svg?logo=fastapi)](https://fastapi.tiangolo.com)
  [![Made with React](https://img.shields.io/badge/React-19.0.0-61DAFB.svg?logo=react)](https://reactjs.org)
  [![MongoDB](https://img.shields.io/badge/MongoDB-4.5.0-47A248.svg?logo=mongodb)](https://www.mongodb.com)
  [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
</div>

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [API Documentation](#api-documentation)
- [Authentication](#authentication)
- [Sample Data](#sample-data)
- [Contributing](#contributing)
- [License](#license)

---

## 🌟 Overview

**GrameenGo** is a comprehensive web platform that bridges the gap between small and medium business owners and microfinance institutions (MFIs) in Bangladesh. The platform enables borrowers to discover, compare, and apply for microfinance loans from trusted institutions like Grameen Bank, BRAC, ASA, and more.

Built with a focus on **accessibility**, **usability**, and **Human-Computer Interaction (HCI)** principles, GrameenGo provides a seamless experience for borrowers, loan officers, and administrators.

### 🎯 Mission

To democratize access to microfinance by providing a transparent, user-friendly platform that empowers entrepreneurs to find the best financing options for their businesses.

---

## ✨ Features

### For Borrowers
- 🏦 **MFI Discovery** - Browse and compare 10+ microfinance institutions
- 📊 **Loan Comparison** - Filter by interest rates, loan amounts, and processing time
- 📝 **Easy Application** - Step-by-step loan application wizard
- 📈 **Application Tracking** - Real-time status updates (Submitted → Under Review → Approved → Disbursed)
- 🔔 **Notifications** - Get instant updates on application progress
- 📄 **PDF Export** - Download application summaries and reports
- 💳 **Dashboard** - View all applications and stats in one place

### For Loan Officers
- 👥 **Application Management** - Review and process loan applications
- ✅ **Approve/Reject** - Manage application workflow with notes and feedback
- 📊 **Analytics** - View approval trends and performance metrics
- 📈 **Reports** - Generate detailed analytics reports

### For Admins
- ⚙️ **System Management** - Manage users, MFIs, and loan products
- 📊 **Platform Analytics** - Monitor overall platform performance
- 🔐 **Role Management** - Assign roles and permissions
- 📥 **Data Import/Export** - Bulk operations support

### Design & UX
- ♿ **Accessible** - WCAG-compliant with high contrast and screen reader support
- 📱 **Responsive** - Mobile-first design that works on all devices
- 🎨 **Modern UI** - Clean, professional interface with Shadcn UI components
- ⚡ **Fast** - Optimized performance with lazy loading and caching
- 🌐 **Multilingual Ready** - Architecture supports multiple languages

---

## 🛠 Tech Stack

### Backend
- **Framework**: FastAPI (Python 3.11)
- **Database**: MongoDB with Motor (async driver)
- **Authentication**: JWT + Google OAuth (Emergent Integration)
- **Security**: Bcrypt password hashing, CORS protection
- **API Documentation**: Auto-generated with OpenAPI/Swagger

### Frontend
- **Framework**: React 19.0
- **Styling**: TailwindCSS + Shadcn UI
- **Routing**: React Router v7
- **State Management**: React Context API
- **HTTP Client**: Axios
- **Charts**: Recharts
- **PDF Generation**: jsPDF with jspdf-autotable
- **Notifications**: Sonner (toast notifications)
- **Forms**: React Hook Form + Zod validation

### DevOps
- **Process Manager**: Supervisor
- **Deployment**: Docker-ready architecture
- **Environment**: Environment variables for configuration

---

## 🚀 Getting Started

### Prerequisites

- Python 3.11+
- Node.js 18+ and Yarn
- MongoDB 4.5+
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/grameengo.git
   cd grameengo
   ```

2. **Backend Setup**
   ```bash
   cd backend
   
   # Create virtual environment
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   
   # Install dependencies
   pip install -r requirements.txt
   
   # Create .env file
   cp .env.example .env
   # Edit .env with your MongoDB URL and secret key
   
   # Initialize sample data
   python init_sample_data.py
   ```

3. **Frontend Setup**
   ```bash
   cd frontend
   
   # Install dependencies
   yarn install
   
   # Create .env file
   cp .env.example .env
   # Edit .env with your backend URL
   ```

4. **Start the Application**

   **Backend** (Terminal 1):
   ```bash
   cd backend
   uvicorn server:app --reload --host 0.0.0.0 --port 8001
   ```

   **Frontend** (Terminal 2):
   ```bash
   cd frontend
   yarn start
   ```

5. **Access the Application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8001
   - API Docs: http://localhost:8001/docs

### Environment Variables

**Backend (.env)**
```env
MONGO_URL=mongodb://localhost:27017
DB_NAME=grameengo_db
SECRET_KEY=your-secret-key-here
CORS_ORIGINS=http://localhost:3000
```

**Frontend (.env)**
```env
REACT_APP_BACKEND_URL=http://localhost:8001
```

---

## 📁 Project Structure

```
grameengo/
├── backend/
│   ├── models/
│   │   ├── user.py              # User & UserSession models
│   │   ├── mfi.py               # MFI & LoanProduct models
│   │   ├── application.py       # LoanApplication model
│   │   └── notification.py      # Notification model
│   ├── utils/
│   │   └── auth.py              # Authentication utilities
│   ├── server.py                # Main FastAPI application
│   ├── init_sample_data.py      # Sample data initialization
│   ├── requirements.txt         # Python dependencies
│   └── .env                     # Environment variables
│
├── frontend/
│   ├── public/                  # Static assets
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/             # Shadcn UI components
│   │   │   └── Layout.js       # Main layout wrapper
│   │   ├── pages/
│   │   │   ├── Landing.js      # Landing page
│   │   │   ├── Login.js        # Login page
│   │   │   ├── Register.js     # Registration page
│   │   │   ├── Dashboard.js    # User dashboard
│   │   │   ├── MFIDirectory.js # MFI listing
│   │   │   └── Applications.js # Applications page
│   │   ├── context/
│   │   │   └── AuthContext.js  # Authentication context
│   │   ├── utils/
│   │   │   ├── api.js          # API client & methods
│   │   │   └── pdfExport.js    # PDF generation utilities
│   │   ├── App.js              # Root component
│   │   ├── App.css             # Global styles
│   │   └── index.css           # Tailwind imports
│   ├── package.json            # Node dependencies
│   └── .env                    # Environment variables
│
└── README.md
```

---

## 🔌 API Documentation

### Authentication Endpoints

#### Register
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepassword",
  "role": "borrower"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "securepassword"
}
```

#### Get Current User
```http
GET /api/auth/me
Authorization: Bearer <token>
```

### MFI Endpoints

#### Get All MFIs
```http
GET /api/mfis
```

#### Get MFI by ID
```http
GET /api/mfis/{mfi_id}
```

### Application Endpoints

#### Get All Applications
```http
GET /api/applications
Authorization: Bearer <token>
```

#### Create Application
```http
POST /api/applications
Authorization: Bearer <token>
Content-Type: application/json

{
  "mfi_id": "uuid",
  "business_name": "My Business",
  "business_type": "Retail",
  "business_age_years": 2,
  "monthly_revenue": 50000,
  "loan_amount": 100000,
  "loan_purpose": "Expansion",
  "tenure_months": 12
}
```

#### Update Application
```http
PATCH /api/applications/{app_id}
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "approved",
  "officer_notes": "Application approved"
}
```

### Analytics Endpoints

#### Get Statistics
```http
GET /api/analytics/stats
Authorization: Bearer <token>
```

#### Get Trends
```http
GET /api/analytics/trends
Authorization: Bearer <token>
```

---

## 🔐 Authentication

GrameenGo supports two authentication methods:

### 1. JWT Email/Password Authentication
- Standard email and password registration
- Secure password hashing with Bcrypt
- JWT tokens for session management
- 7-day token expiration

### 2. Google OAuth (Emergent Integration)
- One-click Google sign-in
- Automatic account creation
- Secure session management
- No password required

#### Emergent Auth Flow
1. User clicks "Sign in with Google"
2. Redirected to Emergent Auth service
3. After Google authentication, redirected back with session_id
4. Frontend exchanges session_id for user data and session_token
5. User is logged in and redirected to dashboard

---

## 📊 Sample Data

The platform comes with pre-populated sample data:

### Microfinance Institutions (10)
1. **Grameen Bank** - 20% interest, 5K-500K loan range
2. **BRAC** - 18.5% interest, 10K-1M loan range
3. **ASA** - 19% interest, 8K-750K loan range
4. **BURO Bangladesh** - 21% interest, 5K-500K loan range
5. **Sajida Foundation** - 17.5% interest, 10K-800K loan range
6. **Shakti Foundation** - 19.5% interest, 7K-600K loan range
7. **TMSS** - 20.5% interest, 6K-450K loan range
8. **Jagorani Chakra Foundation** - 18% interest, 8K-700K loan range
9. **Uddipan** - 21.5% interest, 5K-400K loan range
10. **PKSF** - 16.5% interest, 15K-1.5M loan range

### Loan Products (20+)
- Micro Business Loans
- SME Growth Loans
- Various tenure options (6, 12, 18, 24, 36 months)

### Test Account
- **Email**: testuser@grameengo.com
- **Password**: password123
- **Role**: Borrower

---

## 🎨 Design Principles

### Color Palette
- **Primary Green**: #1E9A56 (Represents growth and prosperity)
- **Light Green**: #E8F5E9 (Background and accents)
- **Dark Green**: #16794A (Hover states and emphasis)
- **Gray Scale**: Used for text hierarchy and borders

### Typography
- **Headings**: Space Grotesk (Modern, geometric sans-serif)
- **Body Text**: Inter (Readable, professional sans-serif)
- **Minimum Font Size**: 14px for accessibility

### HCI Principles Applied
1. **Consistency** - Uniform UI patterns across all pages
2. **Feedback** - Toast notifications and loading states
3. **Error Prevention** - Form validation and confirmation dialogs
4. **Flexibility** - Multiple authentication options
5. **Aesthetic Design** - Clean, modern interface
6. **Help & Documentation** - Tooltips and guided workflows

---

## 🧪 Testing

### Run Backend Tests
```bash
cd backend
pytest
```

### Run Frontend Tests
```bash
cd frontend
yarn test
```

### Manual Testing Checklist
- [ ] User registration and login
- [ ] MFI browsing and filtering
- [ ] Loan application submission
- [ ] Dashboard statistics accuracy
- [ ] PDF export functionality
- [ ] Responsive design on mobile
- [ ] Notification system
- [ ] Logout functionality

---

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Coding Standards
- **Python**: Follow PEP 8 style guide
- **JavaScript**: Follow Airbnb style guide
- **Commits**: Use conventional commit messages
- **Testing**: Add tests for new features

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👥 Team

- **Project Lead**: [Your Name]
- **Backend Developer**: [Name]
- **Frontend Developer**: [Name]
- **UI/UX Designer**: [Name]

---

## 🙏 Acknowledgments

- **Grameen Bank** - Inspiration for microfinance accessibility
- **BRAC** - Research on microfinance best practices
- **Emergent Labs** - Authentication integration
- **Shadcn UI** - Beautiful component library
- **FastAPI** - Modern Python web framework
- **React Community** - Excellent ecosystem and tools

---

## 📞 Contact & Support

- **Website**: https://grameengo.preview.emergentagent.com
- **Email**: support@grameengo.com
- **Issues**: [GitHub Issues](https://github.com/yourusername/grameengo/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/grameengo/discussions)

---

## 🗺 Roadmap

### Phase 1 (Current) ✅
- [x] Core authentication system
- [x] MFI directory and comparison
- [x] Loan application workflow
- [x] Dashboard and analytics
- [x] PDF export functionality

### Phase 2 (Planned)
- [ ] Document upload and verification
- [ ] Advanced analytics with ML predictions
- [ ] Mobile app (React Native)
- [ ] SMS notifications
- [ ] Multi-language support (Bengali, English)

### Phase 3 (Future)
- [ ] AI-powered loan recommendations
- [ ] Credit scoring system
- [ ] Integration with payment gateways
- [ ] Loan repayment tracking
- [ ] Automated loan disbursement

---

<div align="center">
  <p>Made with ❤️ for small business owners in Bangladesh</p>
  <p>© 2025 GrameenGo. All rights reserved.</p>
</div>
