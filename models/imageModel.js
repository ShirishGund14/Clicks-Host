const mongoose =require('mongoose');
const commentModel = require('./commentModel');

const ImageSchema = new mongoose.Schema({
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',

    },
    url: {
      type: String,
    },
    caption: {
      type: String,
      default: ''
    },
    description: {
      type: String,
      default: ''
    },
    likes: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }],
    comments: [ {type: mongoose.Schema.Types.ObjectId,
        ref: 'Comment'}],

    createdAt: {
      type: Date,
      default: Date.now
    }
  });
  
  module.exports = mongoose.model('Image', ImageSchema);