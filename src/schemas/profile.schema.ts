import mongoose from "mongoose";

const ProfileSchema = new mongoose.Schema({
  discordId: String,
  username: String,
  token: String,
  subscribed: Boolean,
  level: String,
  avatar: String,
});

export const Profile = mongoose.model("Profile", ProfileSchema);