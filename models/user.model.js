const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  avatar: {
    type: String,
  },
  
  role: {
    type: String,
    enum: ['member','admin'],
    default: "member"
  },
  active: {
    type: Boolean,
    default: true,
  },
  artworks: [
    {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'Artwork'
    }
  ],
  albums: [
    {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'Album'
    }
  ],
  followers: [
    {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'User'
    }
  ],
    following: [
    {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'User'
    }
  ],
  likes: [ // liked artworks
    {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'Artwork'
    }
  ],
  orders: [
    {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'Order'
    }
  ],

}, {timestamps: true});

module.exports = mongoose.model("User", userSchema);
