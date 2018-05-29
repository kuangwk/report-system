const mongoose = require('mongoose');

const { db } = require('./config')

const { host, port, database } = db

function init () {
  const url = `mongodb://${host}:${port}/${database}`
  console.log('db init', url);
  mongoose.connect(url)
  const db = mongoose.connection
  db.on('connected', ()=> {
    console.log('connect mongoDB with mongoose success')
  })
  db.on('error', (err)=> {
    console.log('connect mongoDB with mongoose fail', err)
  })
}

module.exports = {
  init
}