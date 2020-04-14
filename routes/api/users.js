const router = require('express').Router();
const User = require('../../models/user.model');
const bcrypt = require('bcryptjs')
const config = require('config')
const jwt = require('jsonwebtoken')

// @route  GET api/users
// @desc   Register new user
// @access Public
router.route('/').get((req, res) => {
  User.find()
    .then(users => res.json(users))
    .catch(err => res.status(400).json('Error: ' + err));
});

router.route('/').post((req, res) => {
  const {username, email, password}  = req.body;

  // validation for empty fields
  if(!username || !email || !password){
    return res.status(400).json({msg: 'Please enter all fields'});
  }
  // check for existing
  User.findOne({ email })
    .then(user => {
      if(user) return res.status(400).json({msg: 'User already exists'});

      const newUser = new User({username, email, password});

      //create salt & hash
      bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(newUser.password, salt, (err, hash) => {
          if(err) throw err;
          newUser.password = hash;
          newUser.save()
            .then(user => {

              jwt.sign(
                { id: user.id },
                config.get('jwtSecret'),
                { expiresIn: 3600 },
                (err, token) => {
                  if(err) throw err;
                  res.json({
                    token,
                    user: {
                      id: user.id,
                      name: user.username,
                      email: user.email
                    }
                  });
                }
              )

            });
        })
      })
    })
});

module.exports = router;