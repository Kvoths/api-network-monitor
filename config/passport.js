const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const mongoose = require('mongoose');
const User = require('../src/app/users/user');


passport.use(new LocalStrategy({
    usernameField: 'mail'
  },
  function(username, password, done) {
    User.findOne({ mail: username }, function (err, user) {
        if (err) {
            return done(err); 
        }

        if ( !user ) {
            return done(null, false, {
                message: 'User not found'
            });
        }
        // Return if password is wrong
        if (!user.checkPassword(password)) {
            return done(null, false, {
                message: 'Password is wrong'
            });
        }
        // If credentials are correct, return the user object
        return done(null, user);
    });
  }
));