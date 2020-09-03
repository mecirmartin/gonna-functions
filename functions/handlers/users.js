const { db, admin } = require('../util/admin');
const firebaseConfig = require('../util/config');

const firebase = require('firebase');
firebase.initializeApp(firebaseConfig);

const {
  validateSignupData,
  validateLoginData,
  reduceUserDetails,
} = require('../util/validators');

exports.signup = async (req, res) => {
  const newUser = {
    username: req.body.username,
    email: req.body.email,
    password: req.body.password,
    confirmPassword: req.body.confirmPassword,
    age: req.body.age,
  };

  const { valid, errors } = validateSignupData(newUser);

  if (!valid) return res.status(400).json(errors);

  const noImg = 'no-img.png';

  try {
    const doc = await db.doc(`/users/${newUser.username}`).get();
    if (doc.exists) {
      return res
        .status(400)
        .json({ username: 'This username is already taken' });
    } else {
      const data = await firebase
        .auth()
        .createUserWithEmailAndPassword(newUser.email, newUser.password);

      const token = await data.user.getIdToken();
      const userCredentials = {
        username: newUser.username,
        email: newUser.email,
        userId: data.user.uid,
        age: newUser.age,
        imageUrl: `https://firebasestorage.googleapis.com/v0/b/${firebaseConfig.storageBucket}/o/${noImg}?alt=media`,
      };

      await db.doc(`/users/${newUser.username}`).set(userCredentials);

      return res.status(201).json({ token });
    }
  } catch (error) {
    console.error(error);
    if (error.code === 'auth/email-already-in-use') {
      return res.status(400).json({ email: 'Email is already in use' });
    } else {
      return res
        .status(500)
        .json({ general: 'Something went wrong, please try again' });
    }
  }
};

exports.login = async (req, res) => {
  const user = {
    email: req.body.email,
    password: req.body.password,
  };

  const { valid, errors } = validateLoginData(user);

  if (!valid) return res.status(400).json(errors);

  try {
    const data = await firebase
      .auth()
      .signInWithEmailAndPassword(user.email, user.password);
    const token = await data.user.getIdToken();
    return res.json({ token });
  } catch (err) {
    console.error(err);
    return res
      .status(403)
      .json({ general: 'Wrong credentials, please try again' });
  }
};

exports.getUsers = async (req, res) => {
  try {
    const data = await db.collection('users').get();
    let users = [];
    data.forEach((doc) => {
      users.push({
        userId: doc.id,
        ...doc.data(),
      });
    });
    return res.json(users);
  } catch (error) {
    console.log(error);
  }
};

// Add user details
exports.addUserDetails = async (req, res) => {
  let userDetails = reduceUserDetails(req.body);

  try {
    await db.doc(`/users/${req.user.username}`).update(userDetails);
    return res.json({ message: 'Details added successfully' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.code });
  }
};

exports.uploadImage = async (req, res) => {
  const BusBoy = require('busboy');
  const path = require('path');
  const os = require('os');
  const fs = require('fs');

  const busboy = new BusBoy({ headers: req.headers });

  let imageFileName;
  let imageToBeUploaded;

  busboy.on('file', (fieldname, file, filename, encoding, mimetype) => {
    if (mimetype !== 'image/jpeg' && mimetype !== 'image/png') {
      return res.status(400).json({ error: 'Wrong file type submitted' });
    }

    const imageExtension = filename.split('.')[filename.split('.').length - 1];
    imageFileName = `${Math.floor(
      Math.random() * 100000000
    )}.${imageExtension}`;
    const filepath = path.join(os.tmpdir(), imageFileName);
    imageToBeUploaded = { filepath, mimetype };

    file.pipe(fs.createWriteStream(filepath));
  });
  busboy.on('finish', async () => {
    try {
      await admin
        .storage()
        .bucket()
        .upload(imageToBeUploaded.filepath, {
          resumable: false,
          metadata: {
            contentType: imageToBeUploaded.mimetype,
          },
        });
      const imageUrl = `https://firebasestorage.googleapis.com/v0/b/${firebaseConfig.storageBucket}/o/${imageFileName}?alt=media`;
      await db.doc(`/users/${req.user.username}`).update({ imageUrl });
      return res.json({ message: 'Image uploaded successfully' });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: err.code });
    }
  });
  busboy.end(req.rawBody);
};

// Get any user userdetails
exports.getUserDetails = async (req, res) => {
  let userData = {};

  try {
    const doc = await db.doc(`/users/${req.params.username}`).get();
    if (doc.exists) {
      userData.user = doc.data();
      const data = await db
        .collection('events')
        .where('username', '==', req.params.username)
        .orderBy('time', 'desc')
        .get();
      userData.events = [];
      data.forEach((event) => {
        userData.events.push({
          desc: event.data().desc,
          time: event.data().time,
          username: event.data().username,
          userImage: event.data().userImage,
          gonnaCount: event.data().gonnaCount,
          commentCount: event.data().commentCount,
          eventName: event.data().eventName,
          place: event.data().place,
          eventId: event.id,
        });
      });
      return res.json(userData);
    } else {
      return res.status(404).json({ error: 'User not found' });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.code });
  }
};

exports.markNotificationsRead = async (req, res) => {
  let batch = db.batch();
  req.body.forEach((notificationId) => {
    const notification = db.doc(`/notifications/${notificationId}`);
    batch.update(notification, { read: true });
  });
  try {
    await batch.commit();
    return res.json({ message: 'Notifications marked read' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.code });
  }
};

exports.getOneUser = async (req, res) => {
  try {
    let userData = {};
    const doc = await db.doc(`/users/${req.user.username}`).get();
    if (doc.exists) {
      userData.credentials = doc.data();
      const data = await db
        .collection('gonnas')
        .where('username', '==', req.user.username)
        .get();
      userData.gonnas = [];
      data.forEach((doc) => {
        userData.gonnas.push(doc.data());
      });

      const notifications = await db
        .collection('notifications')
        .where('recipient', '==', req.user.username)
        .orderBy('createdAt', 'desc')
        .limit(10)
        .get();

      userData.notifications = [];
      notifications.forEach((notification) =>
        userData.notifications.push({
          recipient: notification.data().recipient,
          sender: notification.data().sender,
          createdAt: notification.data().createdAt,
          eventId: notification.data().eventId,
          type: notification.data().type,
          read: notification.data().read,
          notificationId: notification.id,
        })
      );

      return res.json(userData);
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.code });
  }
};
