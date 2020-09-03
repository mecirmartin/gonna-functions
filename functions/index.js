const functions = require('firebase-functions');

const express = require('express');
const app = express();
const { db } = require('./util/admin');

const {
  getAllEvents,
  createOneEvent,
  getEvent,
  commentOnEvent,
  gonnaEvent,
  ungonnaEvent,
  deleteEvent,
} = require('./handlers/events');
const {
  signup,
  login,
  getUsers,
  uploadImage,
  addUserDetails,
  getUserDetails,
  markNotificationsRead,
  getOneUser,
} = require('./handlers/users');
const FBAuth = require('./util/fbAuth');

//Event routes
app.get('/events', FBAuth, getAllEvents);
app.post('/event', FBAuth, createOneEvent);
app.get('/event/:eventId', FBAuth, getEvent);
app.delete('/event/:eventId', FBAuth, deleteEvent);
app.get('/event/:eventId/gonna', FBAuth, gonnaEvent);
app.get('/event/:eventId/ungonna', FBAuth, ungonnaEvent);
app.post('/event/:eventId/comment', FBAuth, commentOnEvent);

// users routes
app.post('/signup', signup);
app.post('/login', login);
app.get('/users', FBAuth, getUsers);
app.get('/user', FBAuth, getOneUser);
app.post('/user/image', FBAuth, uploadImage);
app.post('/user', FBAuth, addUserDetails);
app.get('/user/:username', FBAuth, getUserDetails);
app.post('/notifications', FBAuth, markNotificationsRead);

exports.api = functions.region('europe-west1').https.onRequest(app);

exports.createNotificationOnGonna = functions
  .region('europe-west1')
  .firestore.document('gonnas/{id}')
  .onCreate(async (snapshot) => {
    try {
      const document = await db.doc(`/events/${snapshot.data().eventId}`).get();
      if (
        document.exists &&
        document.data().username !== snapshot.data().username
      ) {
        await db.doc(`/notifications/${snapshot.id}`).set({
          createdAt: new Date().toISOString(),
          recipient: document.data().username,
          sender: snapshot.data().username,
          type: 'gonna',
          read: false,
          eventId: document.id,
        });
        console.log(db.doc());
      }
    } catch (err) {
      console.error(err);
      return;
    }
  });

exports.deleteNotificationOnUnGonna = functions
  .region('europe-west1')
  .firestore.document('gonnas/{id}')
  .onDelete(async (snapshot) => {
    try {
      await db.doc(`/notifications/${snapshot.id}`).delete();
      return;
    } catch (err) {
      console.error(err);
      return;
    }
  });

exports.createNotificationOnComment = functions
  .region('europe-west1')
  .firestore.document('comments/{id}')
  .onCreate(async (snapshot) => {
    try {
      const doc = await db.doc(`/events/${snapshot.data().eventId}`).get();
      if (doc.exists && doc.data().username !== snapshot.data().username) {
        await db.doc(`/notifications/${snapshot.id}`).set({
          createdAt: new Date().toISOString(),
          recipient: doc.data().username,
          sender: snapshot.data().username,
          type: 'comment',
          read: false,
          eventId: doc.id,
        });
        return;
      }
    } catch (err) {
      console.error(err);
      return;
    }
  });

exports.onUserImageChange = functions
  .region('europe-west1')
  .firestore.document('/users/{userId}')
  .onUpdate(async (change) => {
    let batch = db.batch();
    if (change.before.data().imageUrl !== change.after.data().imageUrl) {
      try {
        data = await db
          .collection('events')
          .where('username', '==', change.before.data().username)
          .get();
        data.forEach((doc) => {
          const event = db.doc(`/events/${doc.id}`);
          batch.update(event, { userImage: change.after.data().imageUrl });
        });
        return batch.commit();
      } catch (err) {
        console.error(err);
        return res.status(500).json({ error: err });
      }
    } else return true;
  });

exports.onEventDelete = functions
  .region('europe-west1')
  .firestore.document('/events/{eventId}')
  .onDelete(async (snapshot, context) => {
    const eventId = context.params.eventId;
    const batch = db.batch();
    try {
      let data = await db
        .collection('gonnas')
        .where('eventId', '==', eventId)
        .get();
      data.forEach((doc) => {
        batch.delete(db.doc(`/gonnas/${doc.id}`));
      });
      data = await db
        .collection('comments')
        .where('eventId', '==', eventId)
        .get();
      data.forEach((doc) => {
        batch.delete(db.doc(`/comments/${doc.id}`));
      });
      data = await db
        .collection('notifications')
        .where('eventId', '==', eventId)
        .get();
      data.forEach((doc) => {
        batch.delete(db.doc(`/notifications/${doc.id}`));
      });
      return batch.commit();
    } catch (err) {
      console.error(err);
    }
  });
