var mongoose = require('mongoose');

var Task = mongoose.model('Task', {
  name: {
    type: String,
    required: false,
    trim: true
  },

  description:{
    type: String,
    required: false,
    trim: true
  },

  startDate :  {
    type: Date,
    default: null
  },

  isPaused: {
    type: Boolean,
    required: true,
    default: true
  },

  elapsedTime: {
    type: Number,
    required:false,
    default: null
  },

  estimatedTime : {
    type: String,
    required: true,
    default: "00:00:00"
  },

  _creator: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  
  _project: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  }

});

module.exports = {Task};
