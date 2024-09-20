import mongoose from 'mongoose';

export const schemaDefaults = {
  created: {
    type: Date,
    default: Date.now,
  },
  updated: {
    type: Date,
    default: Date.now,
  },
};

export interface BaseModel {
  created: Date,
  updated: Date,
}

try {
  await mongoose.connect(process.env.DB_URL || 'mongodb://localhost/test');
  console.log(`connected to ${process.env.DB_NAME} database`);
} catch (err) {
  console.log('database connection Failed:\n' + err);
  process.exit(1);
}
