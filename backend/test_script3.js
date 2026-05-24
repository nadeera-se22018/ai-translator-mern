const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

async function test() {
  await mongoose.connect(process.env.MONGO_URI);
  try {
    const googleId = 'noemail123';
    const email = undefined;

    let user = await User.findOne({ $or: [{ googleId }, { email }] });
    console.log('Found user:', user);
  } catch (err) {
    console.error('Error in findOne:', err);
  } finally {
    mongoose.disconnect();
  }
}
test();
