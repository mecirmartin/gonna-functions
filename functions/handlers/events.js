const { db } = require('../util/admin');

exports.getAllEvents = async (req, res) => {
  try {
    const data = await db.collection('events').get();
    let events = [];
    data.forEach((doc) => {
      events.push({
        eventId: doc.id,
        ...doc.data(),
      });
    });
    return res.json(events);
  } catch (error) {
    console.error(error);
  }
};

exports.createOneEvent = async (req, res) => {
  const newEvent = {
    username: req.user.username,
    eventName: req.body.eventName,
    place: req.body.place,
    desc: req.body.desc,
    time: req.body.time,
    gonnaCount: 0,
    userImage: req.user.userImage,
    commentCount: 0,
  };

  try {
    const data = await db.collection('events').add(newEvent);
    const resEvent = newEvent;
    resEvent.eventId = data.id;
    return res.json(resEvent);
  } catch (error) {
    res.status(500).json({ error: 'Something went wrong' });
    console.error(error);
  }
};

exports.getEvent = async (req, res) => {
  let eventData = {};
  try {
    const doc = await db.doc(`/events/${req.params.eventId}`).get();
    if (!doc.exists) {
      return res.status(404).json({ error: 'Event not found' });
    }
    eventData = doc.data();
    eventData.eventId = req.params.eventId;
    data = await db
      .collection('comments')
      .orderBy('createdAt', 'desc')
      .where('eventId', '==', req.params.eventId)
      .get();

    eventData.comments = [];
    data.forEach((doc) => {
      eventData.comments.push(doc.data());
    });

    return res.json(eventData);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.code });
  }
};

// Create one event
exports.commentOnEvent = async (req, res) => {
  if (req.body.body.trim() === '')
    return res.status(400).json({ comment: 'Must not be empty' });

  const newComment = {
    body: req.body.body,
    createdAt: new Date().toISOString(),
    username: req.user.username,
    eventId: req.params.eventId,
    userImage: req.user.userImage,
  };

  try {
    const doc = await db.doc(`/events/${req.params.eventId}`).get();
    if (!doc.exists) {
      return res.status(404).json({ error: 'Scream not found' });
    }
    await doc.ref.update({ commentCount: doc.data().commentCount + 1 });
    await db.collection('comments').add(newComment);
    res.json(newComment);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Something went wrong, please try again' });
  }
};

exports.gonnaEvent = async (req, res) => {
  try {
    const gonnaDocument = await db
      .collection('gonnas')
      .where('username', '==', req.user.username)
      .where('eventId', '==', req.params.eventId)
      .limit(1)
      .get();

    const eventDocument = await db.doc(`/events/${req.params.eventId}`).get();

    let eventData;

    if (eventDocument.exists) {
      eventData = eventDocument.data();
      eventData.eventId = eventDocument.eventId;
    } else {
      return res.status(404).json({ error: 'Event not found' });
    }

    if (gonnaDocument.empty) {
      await db
        .collection('gonnas')
        .add({ eventId: req.params.eventId, username: req.user.username });
      eventData.gonnaCount++;
      await db
        .doc(`/events/${req.params.eventId}`)
        .update({ gonnaCount: eventData.gonnaCount });
      return res.json(eventData);
    } else res.status(400).json({ error: 'Event already gonned' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.code });
  }
};

exports.ungonnaEvent = async (req, res) => {
  try {
    const gonnaDocument = await db
      .collection('gonnas')
      .where('username', '==', req.user.username)
      .where('eventId', '==', req.params.eventId)
      .limit(1)
      .get();

    const eventDocument = await db.doc(`/events/${req.params.eventId}`).get();

    let eventData;

    if (eventDocument.exists) {
      eventData = eventDocument.data();
      eventData.eventId = eventDocument.eventId;
    } else {
      return res.status(404).json({ error: 'Event not found' });
    }

    if (gonnaDocument.empty) {
      return res.status(400).json({ error: 'Event not gonned' });
    } else {
      await db.doc(`/gonnas/${gonnaDocument.docs[0].id}`).delete();
      eventData.gonnaCount--;
      await db
        .doc(`/events/${req.params.eventId}`)
        .update({ gonnaCount: eventData.gonnaCount });
      return res.json(eventData);
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.code });
  }
};

// Delete an event
exports.deleteEvent = async (req, res) => {
  try {
    const document = await db.doc(`/events/${req.params.eventId}`).get();
    if (!document.exists) {
      return res.status(404).json({ error: 'Event not found' });
    }

    if (document.data().username !== req.user.username) {
      return res.status(403).json({ error: 'Unauthorized action' });
    }

    await db.doc(`/events/${req.params.eventId}`).delete();

    return res.json({ message: 'Event deleted successfully' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.code });
  }
};
