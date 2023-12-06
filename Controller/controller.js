const User = require('../Model/userSchema')
const jwt = require('jsonwebtoken');
const bcrypt = require("bcrypt");

//For creating New user
const createUser = async (req, res) => {
  const { name, email, password, address, latitude, longitude, status } = req.body;
  try {
    const existingUser = await User.findOne({ email: email });
    if (existingUser) {
      return res.status(400).json({ error: "Employee Record is Already Present" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      address,
      latitude,
      longitude,
      status
    });

    await newUser.save();

    const token = jwt.sign({ userId: newUser._id }, 'AmitSingh', { expiresIn: '24h' });

    const responseData = {
      status_code: '200',
      message: 'User registered successfully',
      data: {
        name: newUser.name,
        email: newUser.email,
        address: newUser.address,
        latitude: newUser.latitude,
        longitude: newUser.longitude,
        status: newUser.status,
        register_at: new Date(),
        token
      }
    }
    res.json(responseData);
  } catch (error) {
    console.error(error);
    res.json({ status_code: '500', message: 'Internal Server Error' });
  }
};


// To change all status of user
const changeUserStatus = async (res, req) => {
  async (req, res) => {
    try {
      const userStatusToSet = await User.findOne({ _id: req.userId });
      await User.updateMany(
        {},
        { $set: { status: { $eq: ['$status', userStatusToSet.status] } } }
      );
      res.json({ status_code: 200, message: 'All users status changed successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
}

const verifyToken = (req, res, next) => {
  const token = req.header('Authorization');
  console.log(token);
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  try {
    const decoded = jwt.verify(token, 'AmitSingh');
    req.userId = decoded.userId;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};


//to get distance
const getUserCoordinatesFromToken = (token) => {
  const decoded = jwt.verify(token, 'AmitSingh'); // Use your actual secret key
  return {
    latitude: decoded.latitude,
    longitude: decoded.longitude,
  };
};

const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Radius of the Earth in kilometers
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // Distance in kilometers
  return distance;
};
const calculateUserDistance = (req, res, next) => {
  const token = req.header('Authorization');
  const destinationCoordinates = {
    latitude: parseFloat(req.query.Destination_Latitude),
    longitude: parseFloat(req.query.Destination_Longitude),
  };

  if (!token || isNaN(destinationCoordinates.latitude) || isNaN(destinationCoordinates.longitude)) {
    return res.status(400).json({ error: 'Invalid request parameters' });
  }

  try {
    const userCoordinates = getUserCoordinatesFromToken(token);
    const distance = calculateDistance(
      userCoordinates.latitude,
      userCoordinates.longitude,
      destinationCoordinates.latitude,
      destinationCoordinates.longitude
    );

    req.distance = distance;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};
const getUserDistance = async (req, res) => {
  res.json({
    status_code: '200',
    message: '----------',
    distance: `${req.distance.toFixed(2)}km`,
  });
}

//listing 
const getUserListingByWeek = async (req, res) => { }

module.exports = { createUser, changeUserStatus, verifyToken, getUserDistance, calculateUserDistance, getUserListingByWeek }