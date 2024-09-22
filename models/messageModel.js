const mongoose = require('mongoose');
const joi = require('joi');

const MessageSchema = new mongoose.Schema({
    
    text: String,
    

    sender: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', required: true 
    },
   receiver: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', required: true 
    
    },
   conversationId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Conversation'

    },
    timestamp: {
         type: Date, 
         default: Date.now 
    },
  
  // New fields for multimedia support
  mediaType: {
      type: String, // e.g., 'image', 'video', 'audio', 'file'
      enum: ['image', 'video', 'audio', 'file', 'null'],
      default: null
  },
  mediaUrl: {
      type: String, // URL to the uploaded media
      default: null
  }
});



module.exports = mongoose.model('Message', MessageSchema);
