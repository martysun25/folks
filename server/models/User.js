const mongoose = require('mongoose')
const bcrypt = require('bcrypt-nodejs')

const SALT_FACTOR = 10

const userSchema = mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  createAt: { type: String, default: Date.now },
  lastPosition: {
    lat: { type: Number, default: null },
    lng: { type: Number, default: null },
  },
  currentRoom: { type: String, default: null },
})

userSchema.methods.checkPassword = function(guess) {
  return new Promise((resolve, reject) => {
    bcrypt.compare(guess, this.password, (err, isMatch) => {
      if (err) {
        reject(err)
      }
      resolve(isMatch)
    })
  })
}

const noop = () => {}
userSchema.pre('save', function(done) {
  const user = this
  if (!user.isModified('password')) {
    return done()
  }
  bcrypt.genSalt(SALT_FACTOR, (err, salt) => {
    if (err) {
      return done(err)
    }
    bcrypt.hash(user.password, salt, noop, (err, hashedPassword) => {
      if (err) {
        return done(err)
      }
      user.password = hashedPassword
      done()
    })
  })
})

module.exports = mongoose.model('Users', userSchema)
