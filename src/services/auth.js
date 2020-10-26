import admin from "../utils/init-firebase";

const actionCodeSettings = {
  // URL you want to redirect back to. The domain (www.example.com) for
  // this URL must be whitelisted in the Firebase Console.
  url: "http://localhost:3000/login",
  // This must be true for email link sign-in.
  handleCodeInApp: true,
};

export const createUser = (req, res) => {
  const {
    email,
    phoneNumber,
    password,
    firstName,
    lastName,
    photoUrl,
  } = req.body;

  admin
    .auth()
    .createUser({
      email,
      phoneNumber,
      password,
      displayName: `${firstName} ${lastName}`,
      photoURL: photoUrl,
    })
    .then((user) => {
      if (email) {
        admin
          .auth()
          .generateEmailVerificationLink(email, actionCodeSettings)
          .then((link) => {
            // Construct email verification template, embed the link and send
            // using custom SMTP server.
            return sendCustomVerificationEmail(useremail, displayName, link);
          })
          .catch((error) => {
            // Some error occurred.
          });
      }
      res.status(201).send({ data: user });
    })
    .catch((error) => {
      res.status(400).send({ data: error });
    });

  return res.send(user);
};

export const register = (req, res) => {
  admin
    .auth()
    .createUser({
      email: "user@example.com",
      emailVerified: false,
      phoneNumber: "+11234567890",
      password: "secretPassword",
      displayName: "John Doe",
      photoURL: "http://www.example.com/12345678/photo.png",
      disabled: false,
    })
    .then(function (userRecord) {
      // See the UserRecord reference doc for the contents of userRecord.
      console.log("Successfully created new user:", userRecord.uid);
    })
    .catch(function (error) {
      console.log("Error creating new user:", error);
    });
};

export const login = (req, res) => {
  admin
    .auth()
    .getUserByEmail("user@exame.com")
    .then(function (userRecord) {
      // See the UserRecord reference doc for the contents of userRecord.
      console.log("Successfully fetched user data:", userRecord.toJSON());
    })
    .catch(function (error) {
      console.log("Error fetching user data:", error);
    });
};
