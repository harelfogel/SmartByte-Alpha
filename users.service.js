const User = require('./User');
const jwt = require('jsonwebtoken');

const signInUser = async (email, password) => {
  const user = await User.findOne({ email });
  if (!user) {
    return { status: 400, message: 'User not found' };
  }

  const isPasswordValid = await user.comparePassword(password);
  if (!isPasswordValid) {
    return { status: 400, message: 'Invalid password' };
  }

  const token = jwt.sign({ _id: user._id, role: user.role }, process.env.JWT_SECRET_KEY, {
    expiresIn: '1h',
  });

  const userData = {
    _id: user._id,
    fullName: user.fullName,
    email: user.email,
    role: user.role,
  };

  return { status: 200, message: 'Sign in successful', token, user: userData };
};

const registerUser = async (fullName, email, password, role) => {
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return { status: 400, message: 'User with this email already exists' };
  }

  const user = new User({ fullName, email, password, role });
  await user.save();
  return { status: 201, message: 'User created successfully' };
};


module.exports = {
  signInUser,
  registerUser,
};
