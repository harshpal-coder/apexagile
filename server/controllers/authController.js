const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User, Workspace } = require('../models');
const { JWT_SECRET } = require('../middleware/auth');
const { OAuth2Client } = require('google-auth-library');

const signToken = (id) => {
  return jwt.sign({ id }, JWT_SECRET, { expiresIn: '30d' });
};

exports.register = async (req, res) => {
  try {
    const { username, email, password, role } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide all required fields' });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'User already exists with this email' });
    }

    const usernameExists = await User.findOne({ username });
    if (usernameExists) {
      return res.status(400).json({ success: false, message: 'Username is already taken' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      username,
      email,
      password: hashedPassword,
      role: role || 'Member',
      avatar: `https://api.dicebear.com/7.x/adventurer/svg?seed=${username}`,
      workspaces: []
    });

    const workspaceSlug = `${username.toLowerCase().replace(/[^a-z0-9]/g, '')}-workspace`;
    const workspace = await Workspace.create({
      name: `${username}'s Workspace`,
      slug: workspaceSlug,
      description: `Default workspace for ${username}`,
      owner: user._id,
      members: [user._id]
    });

    await User.findByIdAndUpdate(user._id, {
      $push: { workspaces: workspace._id }
    });

    const token = signToken(user._id);

    return res.status(201).json({
      success: true,
      token,
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        workspaces: [workspace._id],
        subscription: user.subscription || { plan: 'Free', status: 'Active' }
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const token = signToken(user._id);

    return res.json({
      success: true,
      token,
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        workspaces: user.workspaces || [],
        subscription: user.subscription || { plan: 'Free', status: 'Active' }
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    return res.json({
      success: true,
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        workspaces: user.workspaces || [],
        subscription: user.subscription || { plan: 'Free', status: 'Active' }
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { username, email, avatar, password } = req.body;
    const updates = {};

    if (username) updates.username = username;
    if (email) updates.email = email;
    if (avatar) updates.avatar = avatar;

    if (password) {
      const salt = await bcrypt.genSalt(10);
      updates.password = await bcrypt.hash(password, salt);
    }

    const updatedUser = await User.findByIdAndUpdate(req.user._id, updates, { new: true });

    return res.json({
      success: true,
      user: {
        _id: updatedUser._id,
        username: updatedUser.username,
        email: updatedUser.email,
        role: updatedUser.role,
        avatar: updatedUser.avatar,
        workspaces: updatedUser.workspaces || [],
        subscription: updatedUser.subscription || { plan: 'Free', status: 'Active' }
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

exports.googleLogin = async (req, res) => {
  try {
    const { credential } = req.body;
    if (!credential) {
      return res.status(400).json({ success: false, message: 'Google credential token is required' });
    }

    const clientId = process.env.GOOGLE_CLIENT_ID;
    if (!clientId) {
      console.warn('Warning: GOOGLE_CLIENT_ID is not configured in environment variables');
    }

    const client = new OAuth2Client(clientId);
    let payload;
    try {
      const ticket = await client.verifyIdToken({
        idToken: credential,
        audience: clientId
      });
      payload = ticket.getPayload();
    } catch (verifyError) {
      console.error('Google token verification failed:', verifyError);
      return res.status(400).json({ success: false, message: 'Invalid Google token' });
    }

    const { email, name, picture } = payload;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Google token does not contain email' });
    }

    let user = await User.findOne({ email });

    if (!user) {
      let baseUsername = name ? name.toLowerCase().replace(/[^a-z0-9]/g, '') : email.split('@')[0];
      if (!baseUsername) baseUsername = 'googleuser';
      
      let username = baseUsername;
      let usernameExists = await User.findOne({ username });
      let counter = 1;
      while (usernameExists) {
        username = `${baseUsername}${counter}`;
        usernameExists = await User.findOne({ username });
        counter++;
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15), salt);

      user = await User.create({
        username,
        email,
        password: hashedPassword,
        role: 'Member',
        avatar: picture || `https://api.dicebear.com/7.x/adventurer/svg?seed=${username}`,
        workspaces: []
      });

      const workspaceSlug = `${username}-workspace`;
      const workspace = await Workspace.create({
        name: `${name || username}'s Workspace`,
        slug: workspaceSlug,
        description: `Default workspace created for ${name || username}`,
        owner: user._id,
        members: [user._id]
      });

      user = await User.findByIdAndUpdate(user._id, {
        $push: { workspaces: workspace._id }
      }, { new: true });
    }

    const token = signToken(user._id);

    return res.status(200).json({
      success: true,
      token,
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        workspaces: user.workspaces || [],
        subscription: user.subscription || { plan: 'Free', status: 'Active' }
      }
    });
  } catch (error) {
    console.error('Google login error:', error);
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};
