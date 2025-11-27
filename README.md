# Phonely - AI-Powered Phone Marketplace 📱

A modern marketplace for buying and selling used phones with AI-powered inspection and verification powered by CrewAI and GPT-5.1.

## 🎯 Features

### Core Features
- **AI-Powered Inspection**: Automated phone condition assessment using CrewAI with 3 specialized agents
- **Vision Analysis**: 9-image comprehensive phone inspection (front, back, sides, cameras, display)
- **Authenticity Verification**: AI-powered authenticity scoring (0-100%)
- **Smart Pricing**: Market-based price suggestions using real-time analysis
- **Real-time Chat**: WebSocket-based messaging between buyers and sellers
- **Email Notifications**: Automated listing approval notifications
- **Secure Authentication**: JWT-based auth with email verification

### AI Inspection System
- **Processing Time**: ~11 seconds (optimized from 90s)
- **Cost**: ~$0.01 per inspection (reduced by 80%)
- **Accuracy**: Real-time analysis (no template copying)
- **Three Agent Architecture**:
  1. **Vision Agent**: Analyzes phone condition from 9 images
  2. **Text Agent**: Evaluates listing description completeness
  3. **Pricing Agent**: Suggests fair market price range

## 🏗️ Architecture

```
phonely/
├── frontend/           # React + Vite + TypeScript + TailwindCSS
├── backend/            # Node.js + Express + MongoDB
├── crew-ai-service/    # CrewAI + GPT-5.1 (FastAPI)
└── docker-compose.yml  # Docker orchestration
```

## 🚀 Tech Stack

### Frontend
- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: TailwindCSS v4
- **State Management**: Zustand + React Query
- **Routing**: React Router v6
- **Animations**: Framer Motion
- **Form Handling**: React Hook Form + Zod
- **Real-time**: Socket.IO Client

### Backend
- **Runtime**: Node.js + Express
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT + bcrypt
- **File Upload**: Cloudinary
- **Email**: Nodemailer
- **Caching**: Redis
- **Real-time**: Socket.IO

### AI Service
- **Framework**: CrewAI
- **Model**: OpenAI GPT-5.1
- **API**: FastAPI (Python)
- **Processing**: Async background tasks
- **Architecture**: 3 sequential agents

## 📦 Installation

### Prerequisites
- Node.js 18+
- Python 3.11+
- MongoDB
- Redis (optional)
- OpenAI API Key

### 1. Clone Repository
```bash
git clone <repository-url>
cd Phonely
```

### 2. Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your credentials
npm run dev
```

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### 4. AI Service Setup
```bash
cd crew-ai-service/phonely_ai
pip install uv
uv sync
# Create .env with OPENAI_API_KEY
uv run python src/phonely_ai/api.py
```

## 🔧 Configuration

### Backend Environment Variables
```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/phonely
JWT_SECRET=your_jwt_secret
OPENAI_API_KEY=your_openai_key
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email
EMAIL_PASSWORD=your_email_password
```

### AI Service Environment Variables
```env
OPENAI_API_KEY=your_openai_key
BACKEND_URL=http://localhost:3000
AI_SERVICE_API_KEY=fb74a5dd46fde77fa343d4d6b081f4d6
```

## 🎨 Key Optimizations

### AI Processing Performance
- **Before**: 90 seconds, $0.05/request, 5000+ tokens
- **After**: 11 seconds, $0.01/request, 1200 tokens
- **Improvements**:
  - Simplified task descriptions (139 → 28 lines)
  - Removed verbose outputs and example values
  - Explicit "NO reasoning/suggestions" instructions
  - Sequential agent execution with context passing

## 📱 API Endpoints

### Authentication
- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/verify-email/:token` - Verify email
- `POST /api/v1/auth/forgot-password` - Password reset request
- `POST /api/v1/auth/reset-password/:token` - Reset password

### Listings
- `GET /api/v1/listings` - Get all active listings (paginated)
- `GET /api/v1/listings/:id` - Get listing by ID
- `POST /api/v1/listings` - Create new listing (protected)
- `PATCH /api/v1/listings/:id` - Update listing (protected)
- `DELETE /api/v1/listings/:id` - Delete listing (protected)
- `GET /api/v1/listings/my-listings` - Get user's listings (protected)

### Inspections
- `POST /api/v1/inspections/start` - Start AI inspection
- `GET /api/v1/inspections/:id/status` - Get inspection status
- `POST /api/v1/inspections/:id/callback` - AI service callback (internal)

### Upload
- `POST /api/v1/upload/images` - Upload images to Cloudinary

## 🧪 Testing

### Test AI Inspection
```bash
cd crew-ai-service/phonely_ai
python test_api.py
```

### Backend Tests
```bash
cd backend
npm test
```

## 📊 Database Schema

### User Model
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  phone: String,
  avatar: String,
  verified: Boolean,
  verificationToken: String,
  activeListings: Number,
  ratings: Object,
  createdAt: Date
}
```

### Listing Model
```javascript
{
  seller: ObjectId (User),
  phone: {
    brand: String (enum),
    model: String,
    storage: String,
    ram: String,
    color: String,
    imei: String (encrypted)
  },
  condition: String (enum: excellent/good/fair/poor),
  price: Number,
  priceRange: { min: Number, max: Number },
  title: String,
  description: String,
  images: [{ url, type, order }],
  inspectionReport: {
    reportId: ObjectId (Inspection),
    conditionScore: Number (0-10),
    detectedIssues: [String],
    authenticityScore: Number (0-100)
  },
  location: { city: String, area: String },
  status: String (enum: draft/active/sold/removed),
  visibility: String (enum: public/private/hidden),
  metrics: { views, likes, shares, inquiries }
}
```

### Inspection Model
```javascript
{
  user: ObjectId (User),
  listing: ObjectId (Listing),
  images: [String],
  status: String (enum: pending/processing/completed/failed),
  visionAnalysis: {
    conditionScore: Number,
    condition: String,
    detectedIssues: [Object],
    authenticity: { score, isAuthentic }
  },
  textAnalysis: {
    descriptionQuality: String,
    completeness: Number,
    consistency: Boolean
  },
  pricingAnalysis: {
    suggestedMinPrice: Number,
    suggestedMaxPrice: Number,
    marketAverage: Number,
    confidenceLevel: String
  },
  processingTime: Object
}
```

## 🎯 CrewAI Agent Configuration

### Vision Agent
```yaml
role: Phone Condition Analyzer
goal: Analyze phone physical condition from 9 images
backstory: Expert in visual inspection with 10+ years experience
llm: gpt-5.1
```

### Text Agent
```yaml
role: Description Quality Evaluator
goal: Evaluate listing description completeness
backstory: Professional content reviewer for marketplaces
llm: gpt-5.1
```

### Pricing Agent
```yaml
role: Market Price Analyst
goal: Determine fair market price for Pakistani market
backstory: Expert in used phone market pricing
llm: gpt-5.1
```

## 🔐 Security Features

- JWT authentication with secure httpOnly cookies
- Password hashing with bcrypt (10 rounds)
- Email verification for new accounts
- Rate limiting on all endpoints
- CORS configuration
- Input validation with Zod
- Encrypted IMEI storage
- Protected routes with middleware

## 📈 Performance

- **AI Inspection**: 11 seconds average
- **API Response**: < 200ms average
- **Image Upload**: Cloudinary CDN
- **Database**: MongoDB with indexing
- **Caching**: Redis for session management

## 🐛 Known Issues & Fixes

### Fixed Issues
- ✅ Browse page not showing listings (visibility field mismatch)
- ✅ Profile page listings not displaying (response structure mismatch)
- ✅ PhoneCard TypeScript errors (condition property path)
- ✅ Image placeholder not showing (type checking)
- ✅ Detected issues not displaying (extraction logic)
- ✅ Loading modal timing issues (polling implementation)
- ✅ AI cost optimization (80% reduction)
- ✅ Emoji visibility in ProfilePage (text-transparent issue)

## 🚀 Future Enhancements

- [ ] Real-time price tracking
- [ ] OLX scraper integration
- [ ] Advanced search filters
- [ ] Payment gateway integration
- [ ] Mobile app (React Native)
- [ ] Admin dashboard enhancements
- [ ] Multi-language support
- [ ] AI confidence scoring in UI
- [ ] Batch inspection processing

## 📝 License

MIT License - See LICENSE file for details

## 👥 Contributors

- Muhammad Ali (@mohdaleerehman)

## 📞 Support

For issues and questions, please open an issue on GitHub.

---

**Built with ❤️ using CrewAI and GPT-5.1**
