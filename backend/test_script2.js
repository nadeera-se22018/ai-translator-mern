const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

async function test() {
  await mongoose.connect(process.env.MONGO_URI);
  try {
    const name = 'Test User 2';
    const email = 'test2@example.com';
    const password = 'mypassword123';
    
    // 1. Create a user normally
    let normalUser = await User.create({ name, email, password });
    console.log('Created normal user:', normalUser);

    // 2. Try to google login
    const googleId = '0987654321';
    const avatar = 'http://example.com/avatar2.jpg';

    let user = await User.findOne({ $or: [{ googleId }, { email }] });
    console.log('Found user during google login:', user);

    if (user) {
      let isModified = false;
      if (!user.googleId) {
        user.googleId = googleId;
        isModified = true;
      }
      if (!user.avatar && avatar) {
        user.avatar = avatar;
        isModified = true;
      }
      if (isModified) {
        await user.save();
        console.log('User updated for google login');
      }
    } else {
      user = await User.create({ googleId, name, email, avatar });
      console.log('User created:', user);
    }
  } catch (err) {
    console.error('Error:', err);
  } finally {
    mongoose.disconnect();
  }
}
test();
