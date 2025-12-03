import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../../.env') });

// User schema (inline to avoid import issues)
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['buyer', 'seller', 'admin'], default: 'buyer' },
  verified: { type: Boolean, default: false },
  verificationBadge: { type: String, enum: ['none', 'bronze', 'silver', 'gold', 'platinum'], default: 'none' },
  avatar: String,
  phone: String,
  ratings: {
    average: { type: Number, default: 0 },
    count: { type: Number, default: 0 },
  },
  createdAt: { type: Date, default: Date.now },
});

const User = mongoose.models.User || mongoose.model('User', userSchema);

const seedAdmin = async () => {
  try {
    // Connect to MongoDB
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/phonely');
    console.log('✅ Connected to MongoDB');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'mohdaleerehman@gmail.com' });
    
    if (existingAdmin) {
      console.log('⚠️  Admin user already exists!');
      console.log('Email:', existingAdmin.email);
      console.log('Role:', existingAdmin.role);
      
      // Update password if needed
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('Au_Q3455', salt);
      
      existingAdmin.password = hashedPassword;
      existingAdmin.role = 'admin';
      existingAdmin.verified = true;
      existingAdmin.verificationBadge = 'platinum';
      
      // Ensure location is set
      if (!existingAdmin.location || !existingAdmin.location.city) {
        existingAdmin.location = {
          city: 'Islamabad',
          country: 'Pakistan',
        };
      }
      
      await existingAdmin.save();
      console.log('✅ Admin user updated with new password');
    } else {
      // Create new admin user
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('Au_Q3455', salt);

      const admin = await User.create({
        name: 'Admin',
        email: 'mohdaleerehman@gmail.com',
        password: hashedPassword,
        role: 'admin',
        verified: true,
        verificationBadge: 'platinum',
        phone: '+92300000000',
        avatar: 'https://ui-avatars.com/api/?name=Admin&background=6366f1&color=fff',
        location: {
          city: 'Islamabad',
          country: 'Pakistan',
        },
      });

      console.log('✅ Admin user created successfully!');
      console.log('📧 Email:', admin.email);
      console.log('🔑 Password: Au_Q3455');
      console.log('👤 Role:', admin.role);
      console.log('⭐ Badge:', admin.verificationBadge);
    }

    console.log('\n📋 Admin Login Credentials:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Email:    mohdaleerehman@gmail.com');
    console.log('Password: Au_Q3455');
    console.log('Role:     admin');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    await mongoose.connection.close();
    console.log('👋 Database connection closed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding admin:', error);
    process.exit(1);
  }
};

seedAdmin();
