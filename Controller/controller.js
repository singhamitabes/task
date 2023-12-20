const User = require('../Model/userSchema')
const jwt = require('jsonwebtoken');
const bcrypt = require("bcrypt");

//For creating New user
const createUser = async (req, res) => {
  const { name, email, password, address, latitude, longitude, status } = req.body;
  try {
    if (!name || !email || !password || !address || !latitude || !longitude) {
      return res.status(400).send({error :"Please Enter all field"})
    }
    const existingUser = await User.findOne({ email: email });
    if (existingUser) {
      return res.status(400).json({ error: "Employee Record is Already Present" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);

    const registerDate = new Date();
    const options = { weekday: 'long' }; // 'long' returns the full name of the day
    const dayName = registerDate.toLocaleDateString('en-US', options);

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      address,
      latitude,
      longitude,
      RegisterDay: dayName,
      status
    });

    await newUser.save();

    const token = jwt.sign({ userId: newUser._id, latitude: newUser.latitude, longitude: newUser.longitude }, 'AmitSingh', { expiresIn: '1d' });
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
        register_at: newUser.RegisterDay,
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
const changeUserStatus = async (req, res) => {
  try {
    await User.updateMany(
      {},
      [
        {
          $set: {
            status: {
              $cond: {
                if: { $eq: ["$status", "active"] },
                then: "inactive",
                else: "active",
              },
            },
          },
        },
      ]
    )
    res.json({ status_code: 200, message: 'All users status changed successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

const verifyToken = (req, res, next) => {
  const token = req.header('Authorization');
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  try {
    const decoded = jwt.verify(token, 'AmitSingh');
    req.userId = decoded.userId;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};


//to get distance2314

const getUserCoordinatesFromToken = (token) => {
  const decoded = jwt.verify(token, 'AmitSingh');
  return {
    latitude: decoded.latitude,
    longitude: decoded.longitude,
  };
};

const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371;
  const toRadians = (angle) => angle * (Math.PI / 180);
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
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
    const { latitude, longitude } = getUserCoordinatesFromToken(token);
    //console.log(latitude, longitude);
    const distance = calculateDistance(latitude, longitude, destinationCoordinates.latitude, destinationCoordinates.longitude);
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
    distance: `${req.distance}km`,
  });
};


// listing 
const getUserListingByWeek = async (req, res) => {
  try {
    const token = req.header('Authorization');
    const weekNumbers = req.query.week_number;

    if (!token || !weekNumbers) {
      return res.status(400).json({ error: 'Invalid request parameters' });
    }

    const decoded = jwt.verify(token, 'AmitSingh');

    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    const requestedDays = weekNumbers.split(',').map(Number);

    const responseData = {};

    for (const dayIndex of requestedDays) {
      const dayOfWeek = daysOfWeek[dayIndex];
      responseData[dayOfWeek] = await getUserListing(dayOfWeek);
    }

    res.json({
      status_code: '200',
      message: 'User data fetched successfully',
      data: responseData,
    });
  } catch (error) {
    console.error('Error:', error.message);
    res.status(401).json({ error: 'Invalid token or unexpected error occurred' });
  }
};

const getUserListing = async (dayOfWeek) => {
  try {
    const users = await User.find({ RegisterDay: dayOfWeek });
    if (users.length === 0) {
      console.warn(`No users found for ${dayOfWeek}.`);
      return [];
    }
    return users.map((user) => ({
      name: user.name,
      email: user.email,
    }));
  } catch (error) {
    console.error(`Error fetching user data for ${dayOfWeek}:`, error.message);
    return [];
  }
};


module.exports = { createUser, changeUserStatus, verifyToken, getUserDistance, calculateDistance, calculateUserDistance, getUserListingByWeek }