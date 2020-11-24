const express = require('express')
const router = express.Router()
const { check, validationResult } = require('express-validator')

const auth = require('../../middleware/auth')
const Profile = require('../../models/Profile')
const User = require('../../models/User')

// @route   Get api/profile/me
// @desc    Get current users profile
// @access  Private
router.get('/me', auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id }).populate('user', ['name', 'avatar'])
    if (!profile) {
      return res.status(400).json({ msg: 'I did not find a profile for that user..' })
    }

    res.status(200).json(profile)
  } catch (err) {
    console.error(err.message)
    res.status(500).send('Server Barfed on profile')
  }
})

// @route   Post api/profile
// @desc    Create or update a user profile
// @access  Private
router.post('/', [auth,
  [
    check('status', 'Everyone has a status!').not().isEmpty(),
    check('skills', 'Everyone has to have some skills').not().isEmpty()
  ]
], async (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() })
  }

  const { company, website, location, bio, status, githubusername, skills, youtube, facebook, twitter, instagram, linkedin } = req.body

  // Profile Object
  const profileFields = {}
  profileFields.user = req.user.id
  if (company) profileFields.company = company
  if (website) profileFields.website = website
  if (location) profileFields.location = location
  if (bio) profileFields.bio = bio
  if (status) profileFields.status = status
  if (githubusername) profileFields.githubusername = githubusername
  if (skills) {
    profileFields.skills = skills.split(',')
      .map(skill => skill.trim())
  }

  // Build social object
  profileFields.social = {}
  if (youtube) profileFields.social.youtube = youtube
  if (facebook) profileFields.social.facebook = facebook
  if (twitter) profileFields.social.twitter = twitter
  if (instagram) profileFields.social.instagram = instagram
  if (linkedin) profileFields.social.linkedin = linkedin

  try {
    let profile = await Profile.findOne({ user: req.user.id })

    // profile update
    if (profile) {
      profile = await Profile.findOneAndUpdate(
        { user: req.user.id },
        { $set: profileFields },
        { new: true }
      )
      return res.json(profile)
    }

    // create profile
    profile = new Profile(profileFields)

    await profile.save()
    return res.json(profile)

  } catch (error) {
    console.error({ msg: error.message })
    res.status(500).json('Server barfed. Oops')
  }
}
)

// @route   Get api/profile
// @desc    get all profiles
// @access  Public
router.get('/', async (req, res) => {
  try {
    const profiles = await Profile.find().populate('user', ['name', 'avatar'])
    res.json(profiles)
  } catch (err) {
    console.error(err.message)
    res.status(500).json('Ohh, so that happened..')
  }
})

// @route   Get api/profile/user/:user_id
// @desc    get profile by user id
// @access  Public
router.get('/user/:user_id', async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.params.user_id }).populate('user', ['name', 'avatar'])

    if (!profile) return res.status(400).json({ msg: 'Nope, No profile found' })

    res.json(profile)
  } catch (err) {
    if (err.kind == 'ObjectId') {
      return res.status(400).json({ msg: 'Nope, No profile for that id' })
    }
    console.error(err.message)
    res.status(500).json('Ohh, so that happened..')
  }
})

// @route   DELETE api/profile
// @desc    delete profile, user and posts
// @access  Private
router.delete('/', auth, async (req, res) => {
  try {
    // @todo - remove posts

    // Remove profile
    await Profile.findOneAndRemove({ user: req.user.id })
    // Remove user
    await User.findOneAndRemove({ _id: req.user.id })

    res.json({ msg: 'User Deleted' })
  } catch (err) {
    console.error(err.message)
    res.status(500).json('Ohh, so that happened..')
  }
})

module.exports = router
