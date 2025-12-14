import mongoose from "mongoose";

const BanSchema = new mongoose.Schema({
  discordId: String,
  username: String,
  token: String,
  subscribed: Boolean,
  level: String,
  avatar: String,
});

export const Ban = mongoose.model("Ban", BanSchema);
