var mongoose = require('mongoose');

var Project = mongoose.model('Project', {
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

  creationDate :  {
    type: Date,
    default: null,
    required:true
  },

  _creator: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  
});

module.exports = {Project};
