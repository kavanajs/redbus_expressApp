const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ProfileSchema = new Schema({

  //schema property and form name attribute shoul be same
  photo: {
    type: [""]
  },
  firstname: {
    type: String,
    required: true
  },
  lastname: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  phonenumber: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("profile", ProfileSchema);
