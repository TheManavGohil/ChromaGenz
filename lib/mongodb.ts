import mongoose from 'mongoose';

// TODO: Replace this with your actual MongoDB connection string
// Example: 'mongodb://localhost:27017/your-database-name'
// Or for MongoDB Atlas: 'mongodb+srv://username:password@cluster.mongodb.net/database-name'
const HARDCODED_MONGODB_URI = 'mongodb+srv://manav25gohil:NBOFnjuXZ8XWPVHw@cluster0.7du3n.mongodb.net/colorizer';

function getMongoURI(): string {
  // First try environment variable
  const envUri = process.env.MONGODB_URI;
  if (envUri) {
    return envUri;
  }
  
  // // Fallback to hardcoded URI
  // if (HARDCODED_MONGODB_URI && HARDCODED_MONGODB_URI !== 'YOUR_MONGODB_URI_HERE') {
  //   return HARDCODED_MONGODB_URI;
  // }
  
  throw new Error('Please set MONGODB_URI in .env file or update HARDCODED_MONGODB_URI in lib/mongodb.ts');
}

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  var mongoose: MongooseCache | undefined;
}

let cached: MongooseCache = global.mongoose || { conn: null, promise: null };

if (!global.mongoose) {
  global.mongoose = cached;
}

async function connectDB(): Promise<typeof mongoose> {
  try {
    const MONGODB_URI = getMongoURI();
    
    if (cached.conn) {
      return cached.conn;
    }

    if (!cached.promise) {
      const opts = {
        bufferCommands: false,
      };

      cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
        return mongoose;
      });
    }

    cached.conn = await cached.promise;
    return cached.conn;
  } catch (e: any) {
    cached.promise = null;
    console.error('MongoDB connection error:', e);
    throw new Error(`Failed to connect to MongoDB: ${e.message}`);
  }
}
export default connectDB;

