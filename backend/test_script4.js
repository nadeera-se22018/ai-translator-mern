const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

async function test() {
  await mongoose.connect(process.env.MONGO_URI);
  try {
    let user = await User.findOne({ $or: [{ googleId: undefined }, { email: undefined }] });
    console.log('Found user with undefined:', user);
  } catch (err) {
    console.error('Error in findOne:', err);
  } finally {
    mongoose.disconnect();
  }
}
test();
