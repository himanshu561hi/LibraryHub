import mongoose from 'mongoose';
import config from '../config/index.js';
import { Admin, SiteSetting } from '../models/index.js';
import logger from '../utils/logger.js';

export const runSeed = async () => {
  try {
    logger.info('Starting Library Hub database seed...');
    await mongoose.connect(config.mongo.uri, config.mongo.options);

    // 1. Check or create Super Admin
    const existingAdmin = await Admin.findOne({ email: config.seedAdmin.email.toLowerCase() });
    if (!existingAdmin) {
      const passwordHash = await Admin.hashPassword(config.seedAdmin.password);
      const newAdmin = await Admin.create({
        name: config.seedAdmin.name,
        email: config.seedAdmin.email.toLowerCase(),
        passwordHash,
        role: 'super_admin',
        isActive: true,
      });
      logger.info(`Super Admin seeded successfully: ${newAdmin.email}`);
    } else {
      logger.info(`Super Admin already exists: ${existingAdmin.email} (Skipped creation)`);
    }

    // 2. Seed Default Site Settings (Pricing & Hours)
    const defaultSettings = [
      {
        key: 'pricing_plans',
        value: {
          dayShift: { feeInPaise: 50000, name: 'Day Shift Plan (7 AM – 8 PM)' },
          nightShift: { feeInPaise: 60000, name: 'Night Shift Plan (8 PM – 8 AM)' },
          fullDay24h: { feeInPaise: 80000, name: '24 Hours Dedicated Plan (24×7)' },
        },
        description: 'Standard monthly membership shift fees in integer paise',
      },
      {
        key: 'operating_hours',
        value: '24 Hours Open (All 7 Days Open · Day & Night Shifts)',
        description: 'Official Library Hub operational schedule',
      },
      {
        key: 'attendance_policy',
        value: {
          dailyCodeExpiryHours: 24,
          maxAttemptsBeforeLockout: 5,
        },
        description: 'Daily code attendance verification parameters',
      },
    ];

    for (const setting of defaultSettings) {
      await SiteSetting.findOneAndUpdate(
        { key: setting.key },
        { $setOnInsert: setting },
        { upsert: true, new: true }
      );
    }
    logger.info('Default Site Settings seeded successfully.');

    logger.info('Database seed completed successfully!');
  } catch (error) {
    logger.error(`Seed failed: ${error.message}`);
    throw error;
  } finally {
    await mongoose.disconnect();
  }
};

// If run directly from CLI
if (process.argv[1]?.endsWith('seed.js')) {
  runSeed()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

