import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from '../models/User.js';

dotenv.config();

async function run() {
  const identifier = process.argv[2];
  if (!identifier) {
    console.error('Usage: node scripts/promoteAdmin.js <name-or-email>');
    process.exit(1);
  }

  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    console.error('Missing MONGODB_URI in environment.');
    process.exit(1);
  }

  try {
    await mongoose.connect(mongoUri);

    // Try find by email first, then by name
    let user = await User.findOne({ email: identifier });
    if (!user) {
      user = await User.findOne({ name: identifier });
    }

    if (!user) {
      console.error(`User not found by email or name: ${identifier}`);
      process.exit(1);
    }

    if (user.role === 'admin') {
      console.log(`User "${user.name}" (${user.email}) is already an admin.`);
      process.exit(0);
    }

    user.role = 'admin';
    await user.save();
    console.log(`Promoted "${user.name}" (${user.email}) to admin.`);
    process.exit(0);
  } catch (err) {
    console.error('Promotion failed:', err?.message || err);
    process.exit(1);
  } finally {
    try { await mongoose.disconnect(); } catch {}
  }
}

run();


