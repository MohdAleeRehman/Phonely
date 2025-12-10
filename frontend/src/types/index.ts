export interface User {
  _id: string;
  id?: string; // Some responses include id instead of _id
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  city: string;
  role: 'user' | 'admin';
  isVerified: boolean;
  createdAt: string;
}

export interface AuthResponse {
  status: string;
  token: string;
  refreshToken?: string;
  data: {
    user: User;
  };
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  phone: string;
  password: string;
  city: string;
}

export interface VerifyEmailData {
  token: string;
}

export interface ResendVerificationData {
  email: string;
}

export interface VerifyOTPData {
  phone: string;
  otp: string;
}

export interface Phone {
  brand: string;
  model: string;
  storage: string;
  ram?: string;
  color?: string;
  imei?: string;
  warranty?: {
    hasWarranty: boolean;
    type?: string;
    expiryDate?: string;
  };
}

export interface Location {
  city: string;
  area?: string;
  address?: string;
  coordinates?: {
    type: 'Point';
    coordinates: [number, number]; // [longitude, latitude]
  };
}

export interface Listing {
  _id: string;
  title: string;
  description: string;
  price: number;
  priceNegotiable?: boolean;
  ptaApproved?: boolean;
  condition: 'excellent' | 'good' | 'fair' | 'poor';
  phone: Phone;
  images: Array<string | { url: string; type?: string; order?: number }>;
  location: Location;
  seller: User;
  status: 'draft' | 'active' | 'sold' | 'removed';
  views: number;
  functionalityIssues?: string[];
  physicalDamage?: string[];
  repairHistory?: string[];
  cosmeticCondition?: {
    screenCondition?: string;
    bodyCondition?: string;
    backCondition?: string;
    cameraCondition?: string;
  };
  conditionDetails?: {
    batteryHealth?: number;
    screenCondition?: string;
    bodyCondition?: string;
    displayQuality?: 'flawless' | 'minor-scratches' | 'noticeable-wear' | 'cracked';
    allFeaturesWorking?: boolean;
    functionalIssues?: string[];
    additionalNotes?: string;
  };
  accessories?: {
    box?: boolean;
    charger?: boolean;
    cable?: boolean;
    earphones?: boolean;
    case?: boolean;
    screenProtector?: boolean;
  };
  batteryHealth?: {
    percentage?: number;
    cycleCount?: number;
  };
  inspectionReport?: {
    reportId: string;
    conditionScore: number;
    detectedIssues: string[];
    authenticityScore: number;
    completedAt: string;
    aiSuggestedPriceRange?: {
      min: number;
      max: number;
    };
  };
  priceRange?: {
    min: number;
    max: number;
  };
  marketPriceRange?: {
    min: number;
    max: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreateListingData {
  title: string;
  description: string;
  price: number;
  condition: 'excellent' | 'good' | 'fair' | 'poor';
  priceNegotiable?: boolean;
  conditionDetails?: {
    screenCondition?: string;
    bodyCondition?: string;
    batteryHealth?: number;
    functionalIssues?: string[];
  };
  phone: Phone;
  location: Location;
  accessories?: {
    box?: boolean;
    charger?: boolean;
    cable?: boolean;
    earphones?: boolean;
    case?: boolean;
    screenProtector?: boolean;
  };
  images?: Array<{
    url: string;
    type?: string;
    order?: number;
  }>;
}

export interface Chat {
  _id: string;
  listing: Listing | string;
  participants: (User | string)[];
  messages?: Message[]; // Messages are embedded in the chat document
  lastMessage?: {
    content: string;
    sender: User | string;
    createdAt: string;
  };
  unreadCount?: Record<string, number>;
  status: 'active' | 'archived' | 'blocked';
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  _id: string;
  chat: string;
  sender: User | string;
  content: string;
  message?: string; // Deprecated, keeping for backward compatibility
  type?: 'text' | 'image' | 'offer' | 'system' | 'phone';
  metadata?: {
    offerPrice?: number;
    offerStatus?: 'pending' | 'accepted' | 'rejected' | 'countered';
    imageUrl?: string;
    phoneNumber?: string;
  };
  read: boolean;
  readBy?: Array<{
    user: string;
    readAt: string;
  }>;
  createdAt: string;
}

export interface ChatData {
  chat: Chat;
  messages: Message[];
}

export interface Inspection {
  _id: string;
  listing: string;
  user: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  visionAnalysis?: {
    conditionScore: number;
    condition: string;
    detectedIssues: Array<{ type: string; severity: string }>;
    authenticityScore: number;
  };
  textAnalysis?: {
    descriptionQuality: string;
    completeness: number;
    consistency: boolean;
  };
  pricingAnalysis?: {
    suggestedMinPrice: number;
    suggestedMaxPrice: number;
    marketAverage: number;
    confidenceLevel: string;
  };
  processingTime?: number;
  createdAt: string;
  updatedAt: string;
}

export interface ApiError {
  status: string;
  message: string;
  error?: string | Record<string, unknown>;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sort?: string;
}

export interface PaginatedResponse<T> {
  status: string;
  results: number;
  data: {
    listings: T[];
    pagination?: {
      currentPage: number;
      totalPages: number;
      totalItems: number;
    };
  };
}

export interface ChatResponse {
  status: string;
  results: number;
  data: {
    chats: Chat[];
  };
}
