const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

async function test() {
  await mongoose.connect(process.env.MONGO_URI);
  try {
    const googleId = '1234567890';
    const name = 'Test User';
    const email = 'test@example.com';
    const avatar = 'http://example.com/avatar.jpg';

    // Simulate finding user
    let user = await User.findOne({ $or: [{ googleId }, { email }] });
    console.log('Found user:', user);

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
        console.log('User updated');
      }
    } else {
      user = await User.create({
        googleId,
        name,
        email,
        avatar,
      });
      console.log('User created:', user);
    }
  } catch (err) {
    console.error('Error:', err);
  } finally {
    mongoose.disconnect();
  }
}
test();
