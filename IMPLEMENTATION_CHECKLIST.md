# Implementation Checklist - Phonely Bug Fixes & Features

## Status: IN PROGRESS

### 1. Report Profile Functionality ✅ (Backend Complete)
**Backend:**
- ✅ Created Report.model.js
- ✅ Created report.controller.js  
- ✅ Created report.routes.js
- ✅ Added routes to server.js

**Frontend:** (TODO)
- [ ] Create report.service.ts
- [ ] Add Report types to types/index.ts
- [ ] Add ReportModal component
- [ ] Add "Report User" button to ProfilePage
- [ ] Add "Report Listing" button to ListingDetailPage

### 2. Enhanced ListingDetailPage (TODO)
- [ ] Display all accessories (box, charger, cable, etc.)
- [ ] Show warranty status
- [ ] Display purchase date/age
- [ ] Show reason for selling
- [ ] Display usage history
- [ ] Show repair history
- [ ] Display battery health details
- [ ] Show functional issues
- [ ] Display physical damage details

### 3. Detailed AI Inspection Report (TODO)
- [ ] Create AIInspectionReport component
- [ ] Fetch inspection report from backend
- [ ] Display condition score with visual indicator
- [ ] Show authenticity confidence with badge
- [ ] List all detected issues
- [ ] Display pricing breakdown
- [ ] Add comparison with market prices
- [ ] Show image analysis results per photo

### 4. Chat Performance Optimization (TODO)
- [ ] Review useEffect dependencies in ChatPage
- [ ] Optimize message rendering (React.memo)
- [ ] Implement message virtualization for long chats
- [ ] Debounce typing indicators
- [ ] Optimize socket event listeners
- [ ] Add loading states for better UX

### 5. Session Management & Auto-Logout (TODO)
**Backend:**
- [ ] Add token expiration to JWT (30 days default, 7 days without "keep logged in")
- [ ] Add refresh token rotation
- [ ] Track last activity timestamp

**Frontend:**
- [ ] Add "Keep me logged in" checkbox to LoginPage
- [ ] Implement token expiration check
- [ ] Add auto-logout after inactivity (30 mins)
- [ ] Add session expiry warning modal
- [ ] Store "remember me" preference

### 6. Monetization Strategy Document (TODO)
- [ ] Research competitive pricing models
- [ ] Document revenue streams
- [ ] Create pricing tiers
- [ ] Plan premium features

## Priority Order:
1. Report functionality (safety critical)
2. Enhanced listing details (user experience)
3. AI inspection report (key differentiator)
4. Session management (security)
5. Chat optimization (performance)
6. Monetization strategy (business)
