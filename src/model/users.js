// import authy from "authy";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import twilio from "twilio";
require("dotenv").config();

// Create authenticated Authy and Twilio API clients
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const authyKey = process.env.AUTHY_API_KEY;

const twilioClient = new twilio(accountSid, authToken);
const authy = require("authy")(authyKey);

const SALT_WORK_FACTOR = 10;
const Schema = mongoose.Schema;

const UserSchema = new Schema({
  fullName: {
    type: String,
    required: true,
  },
  countryCode: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },
  phoneVerified: {
    type: Boolean,
    default: false,
  },
  authyId: String,
  email: {
    type: String,
    unique: true,
  },
  emailVerified: {
    type: Boolean,
    default: false,
  },
  password: {
    type: String,
    required: true,
  },
});

// Middleware executed before save - hash the user's password
UserSchema.pre("save", function (next) {
  const self = this;

  // only hash the password if it has been modified (or is new)
  if (!self.isModified("password")) return next();

  // generate a salt
  bcrypt.genSalt(SALT_WORK_FACTOR, function (err, salt) {
    if (err) return next(err);

    // hash the password using our new salt
    bcrypt.hash(self.password, salt, function (err, hash) {
      if (err) return next(err);

      // override the cleartext password with the hashed one
      self.password = hash;
      next();
    });
  });
});

// Test candidate password
UserSchema.methods.comparePassword = function (candidatePassword, cb) {
  const self = this;
  bcrypt.compare(candidatePassword, self.password, function (err, isMatch) {
    if (err) return cb(err);
    cb(null, isMatch);
  });
};

// Send a verification token to this user
UserSchema.methods.sendAuthyToken = function (cb) {
  var self = this;

  if (!self.authyId) {
    // Register this user if it's a new user
    authy.register_user(
      self.email,
      self.phone,
      self.countryCode,
      (err, response) => {
        if (err || !response.user) return cb.call(self, err);
        self.authyId = response.user.id;
        self.save((err, doc) => {
          if (err || !doc) return cb.call(self, err);
          self = doc;
          sendToken();
        });
      }
    );
  } else {
    // Otherwise send token to a known user
    sendToken();
  }

  // With a valid Authy ID, send the 2FA token for this user
  function sendToken() {
    authy.request_sms(self.authyId, true, (err, response) => {
      cb.call(self, err);
    });
  }
};

// Test a 2FA token
UserSchema.methods.verifyAuthyToken = (otp, cb) => {
  const self = this;
  authy.verify(self.authyId, otp, function (err, response) {
    cb.call(self, err, response);
  });
};

// Send a text message via twilio to this user
UserSchema.methods.sendMessage = function (
  message,
  successCallback,
  errorCallback
) {
  const self = this;
  const toNumber = `+${self.countryCode}${self.phone}`;

  twilioClient.messages
    .create({
      to: toNumber,
      from: config.twilioNumber,
      body: message,
    })
    .then(() => {
      successCallback();
    })
    .catch((err) => {
      errorCallback(err);
    });
};

const User = mongoose.model("User", UserSchema);
export default User;
