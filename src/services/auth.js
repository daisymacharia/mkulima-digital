import admin from "../utils/init-firebase";
import User from "../model/users";

// create a new user based on the form submission
export const createUser = (req, res) => {
  const user = new User();
  const { country, email, firstName, lastName, phone, password } = req.body;

  // Create a new user based on form parameters
  User.findOne({ $or: [{ phone }, { email }] }).exec((err, existing_user) => {
    if (err) return res.status(400).send({ message: "An error occured" });
    else if (existing_user) {
      return res
        .status(400)
        .send({ message: `user: with ${phone} already exists` });
    } else {
      user.fullName = firstName ? `${firstName} ${lastName}` : lastName;
      user.email = email;
      user.password = password;
      user.phone = phone;
      user.countryCode = country;
    }

    user.save((err, user) => {
      if (err) {
        res.status(400).send(err);
      } else {
        // If the user is created successfully, send them an account
        // verification token
        user.sendAuthyToken(function (err) {
          if (err) {
            res.status(400).send(err);
          }
          // Send to token verification page
          res.status(201).send({ data: { firstName, lastName, email, phone } });
          // res.redirect("/users/" + user._id + "/verify");
        });
      }
    });
  });
};

// Resend a code if it was not received
export const resend = (req, res) => {
  // Load user model
  User.findOne(req.params.phone, (err, user) => {
    if (err || !user) {
      return res.status(404).send({ data: "User not found for this ID." });
    }

    // If we find the user, let's send them a new code
    user.sendAuthyToken(postSend);
  });

  // Handle send code response
  function postSend(err) {
    if (err) {
      return res.status(400).send({
        data: "There was a problem sending you the code - please " + "retry.",
      });
    }

    req.status(200).send({ data: `successes, Code re-sent!` });
  }

  res.redirect("/users/" + req.params.id + "/verify");
};

// Handle submission of verification token
export const verify = (req, res) => {
  let user = {};

  // Load user model
  User.findById(req.params.id, function (err, doc) {
    if (err || !doc) {
      return res.status(404).send({ data: "User not found for this ID." });
    }

    // If we find the user, let's validate the token they entered
    user = doc;
    user.verifyAuthyToken(req.body.code, postVerify);
  });

  // Handle verification response
  function postVerify(err) {
    if (err) {
      return res
        .status(400)
        .send({ data: "The token you entered was invalid - please retry." });
    }

    // If the token was valid, flip the bit to validate the user account
    user.phoneVerified = true;
    user.save(postSave);
  }

  // after we save the user, handle sending a confirmation
  function postSave(err) {
    if (err) {
      return res.status(400).send({
        data: `There was a problem validating your account
      - please enter your token again.`,
      });
    }

    // Send confirmation text message
    const message = "You did it! Signup complete :)";
    user.sendMessage(
      message,
      () => {
        // show success page
        res.send("successes", message);
        res.redirect(`/users/${user._id}`);
      },
      (err) => {
        res.send({
          data: `You are signed up, but we could not send you a message.`,
        });
      }
    );
  }

  // res.redirect("/users/" + request.params.id + "/verify"); //error
};

export const login = (req, res) => {
  const { phone, password } = req.body;
  User.findOne({ phone }).exec((err, user) => {
    user.comparePassword(password, (error, match) => {
      if (error) {
        return res.status(400).send({ data: "The password is invalid" });
      } else if (match) {
        admin
          .auth()
          .createCustomToken(user.phone)
          .then((customToken) => {
            res.status(200).send({ data: { phone, token: customToken } });
          })
          .catch((error) => {
            console.log("Error creating custom token:", error);
          });
      }
    });
    if (err) return res.status(500).send({ data: "An error occured" });
  });
};

// // Show details about the user
// exports.showUser = function (request, response, next) {
//   // Load user model
//   User.findById(request.params.id, function (err, user) {
//     if (err || !user) {
//       // 404
//       return next();
//     }

//     response.render("users/show", {
//       title: "Hi there " + user.fullName + "!",
//       user: user,
//       // any errors
//       errors: request.flash("errors"),
//       // any success messages
//       successes: request.flash("successes"),
//     });
//   });
// };

// function verifyEmail(email) {
//   return admin.auth().generateEmailVerificationLink(email, actionCodeSettings);
// }

// // const newUser = new Users();

// // newUser.name = firstName ? `${firstName} ${lastName}` : lastName;
// // newUser.email = email;
// // newUser.country = country;
// // newUser.phoneNumber = phoneNumber;
// // newUser.save().then(() => res.status(201).send({ data: user }));
