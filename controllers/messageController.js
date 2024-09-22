// messageController.js
const mongoose = require('mongoose');
const Message = require('../models/messageModel');
const { wss } = require('../websocket'); // Import the WebSocket server instance
const multer = require('multer');
const conversationModel = require('../models/conversationModel');

const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, 'uploads/'); // Specify the directory to save files
  },
  filename: function(req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname)); // Save file with a unique name
  }
});

const upload = multer({ storage }).single('file');


exports.sendMessage = async (req, res, next) => {
  try {
    const { text, receiver, sender, } = req.body;

    if (!receiver || !mongoose.Types.ObjectId.isValid(receiver)) {
      return res.status(400).send({ message: 'Invalid receiver ID' });
    }

    if (!sender || !mongoose.Types.ObjectId.isValid(sender)) {
      return res.status(400).send({ message: 'Invalid sender ID' });
    }

    // Create and save the message
    let conversation = await conversationModel.findOne({
      participants: { $all: [sender, receiver] }
    });

    if (!conversation) {
      conversation = new conversationModel({
        participants: [sender, receiver]
      });
      await conversation.save();
    }
    const message = new Message({
      text,
      sender: sender,
      receiver: receiver,
      conversationId: conversation._id,
 
    });

    await message.save();

    // Broadcast the message to all connected clients
    if (wss && wss.clients) {
      wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          try {
            client.send(JSON.stringify(message));
          } catch (err) {
            console.error('Error sending message to client:', err);
          }
        } else {
          console.log('Client not connected');
        }
      });
    } else {
      console.warn('WebSocket server not initialized or no clients connected');
    }

    res.send({ message: 'Message sent successfully' });
  } catch (err) {
    console.error('Error sending message:', err);
    next(err); // Pass the error to the global error handler
  }
};

exports.getConversationByUsers = async (req, res) => {
  try {
    const { userIds } = req.body; // Expect user IDs in the request body

    if (!Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({ error: 'Invalid user IDs' });
    }

    // Find conversations where all provided user IDs are participants
    const conversation = await conversationModel.findOne({
      participants: { $all: userIds }
    }).select('_id'); // Select only the _id field

    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    res.json(conversation); // Return the found conversation with its ID
  } catch (error) {
    console.error('Error retrieving conversation by user IDs:', error);
    res.status(500).json({ error: 'Error retrieving conversation' });
  }
};


exports.getMessages = async (req, res, next) => {
  try {
    const { conversationId } = req.params;

    // Validate the conversationId
    if (!mongoose.Types.ObjectId.isValid(conversationId)) {
      return res.status(400).send({ message: 'Invalid conversation ID' });
    }

    const messages = await Message.find({ conversationId }).populate('sender receiver', 'name');
    res.json(messages);
  } catch (err) {
    console.error('Error retrieving messages:', err);
    next(err); // Pass the error to the global error handler
  }
};
