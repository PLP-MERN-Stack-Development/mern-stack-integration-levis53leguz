const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  post: { type: mongoose.Schema.Types.ObjectId, ref: 'Post', required: true },
  authorName: { type: String, required: true },
  authorEmail: { type: String },
  text: { type: String, required: true },
  approved: { type: Boolean, default: false } // moderation
},{ timestamps: true });

module.exports = mongoose.model('Comment', commentSchema);
