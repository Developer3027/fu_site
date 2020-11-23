const express = require('express')
const router = express.Router()
const auth = require('../../middleware/auth')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const config = require('config')
const { check, validationResult } = require('express-validator')

const User = require('../../models/User')

// @route   Get api/auth
// @desc    Test route
// @access  Public
router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password')
    res.json(user)
  } catch (err) {
    console.error('AUTH ERROR: ', err.message)
    res.status(500).send('Server Error')
  }
})

// @route   Post api/auth
// @desc    authenticate user and get token
// @access  Public
router.post('/',
  [
    check('email', 'You need that mail address')
      .isEmail(),
    check('password', 'You gotta have a password')
      .exists()
  ], async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    // pulls the pieces out of the body for use
    const { email, password } = req.body

    try {
      // check that user exists
      let user = await User.findOne({ email })

      if (!user) {
        return res.status(400).json({ errors: [{ msg: 'Yeah, no. Typo maybe?' }] })
      }

      const matched = await bcrypt.compare(password, user.password)

      if (!matched) {
        return res.status(400).json({ errors: [{ msg: 'Yeah, no. Typo maybe?' }] })
      }

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
          if (err) throw err
          res.json({ token })
        }
      )

    } catch (err) {
      console.error(err.message)
      res.send(500).send('Server Error')
    }
  })

module.exports = router
