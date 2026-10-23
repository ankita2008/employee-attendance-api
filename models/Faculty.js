
const mongoose = require("mongoose");

// Faculty data structure
const facultySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },

  email: {
    type: String,
    required: true,
    unique: true
  },

  password: {
    type: String,
    required: true
  }
});

// Export Faculty model
module.exports = mongoose.model("Faculty", facultySchema);
