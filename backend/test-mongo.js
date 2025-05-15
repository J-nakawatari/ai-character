require('dotenv').config();
const { MongoClient } = require('mongodb');
const dns = require('dns');

dns.setDefaultResultOrder('ipv4first');

async function testConnection() {
  console.log('Testing MongoDB connection...');
  
  const uri = process.env.MONGO_URI;
  console.log('Connection URI:', uri.replace(/\/\/([^:]+):([^@]+)@/, '//\$1:****@'));
  
  const client = new MongoClient(uri, {
    serverSelectionTimeoutMS: 30000,
    socketTimeoutMS: 45000
  });
  
  try {
    await client.connect();
    console.log('Connected successfully to MongoDB');
    await client.db().admin().ping();
    console.log('Database ping successful');
    await client.close();
  } catch (err) {
    console.error('Connection error:', err);
  }
}

testConnection();