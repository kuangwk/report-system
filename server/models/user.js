const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
  username: 'string',
  password: 'string'
})

module.exports = new mongoose.model('User', userSchema)