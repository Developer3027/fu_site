const express = require('express')
const router = express.Router()
const gravatar = require('gravatar')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const config = require('config')
const { check, validationResult } = require('express-validator')

const User = require('../../models/User')

// @route   Post api/users
// @desc    Register Users
// @access  Public
router.post('/',
  [
    check('name', 'The noun that is you')
      .not()
      .isEmpty(),
    check('email', 'Seriously, EVERY-THING requires a email these days.')
      .isEmail(),
    check('password', 'At least six characters in any order you like.')
      .isLength({ min: 6 })
  ], async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    // pulls the pieces out of the body for use
    const { name, email, password } = req.body

    try {
      // check that user exists
      let user = await User.findOne({ email })

      if (user) {
        return res.status(400).json({ errors: [{ msg: 'Seems that email is listed already. Hmm..' }] })
      }
      // get avatar
      const avatar = gravatar.url(email, {
        s: '200',
        r: 'pg',
        d: 'mm'
      })

      user = new User({
        name,
        email,
        avatar,
        password
      })
      // encrypt password
      const salt = await bcrypt.genSalt(10)

      user.password = await bcrypt.hash(password, salt)

      await user.save()
      // Return json webtoken
      const payload = {
        user: {
          id: user.id
        }
      }

      jwt.sign(
        payload,
        config.get('jwtSecret'),
        { expiresIn: 360000 },
        (err, token) => {
          if (err) throw err;
          res.json({ token })
        }
      )

    } catch (err) {
      console.error(err.message)
      res.send(500).send('Server Error')
    }
  })

module.exports = router
