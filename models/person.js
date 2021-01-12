const mongoose = require('mongoose')
const uniqueValidator = require('mongoose-unique-validator')

console.log('connecting to mongoDB')

mongoose.connect(process.env.DB_CONN_STRING, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false, useCreateIndex: true })
  // eslint-disable-next-line no-unused-vars
  .then(_result => console.log('successfully connected to mongoDB'))
  .catch(error => console.log('connection failed', error.message))



const personSchema = new mongoose.Schema({
  name: {
    type: String,
    minlength: 3,
    unique: true
  },
  number: {
    type: String,
    minlength: 8
  }
})

personSchema.plugin(uniqueValidator)

personSchema.set('toJSON', {
  transform: (_document, returnedObj) => {
    returnedObj.id = returnedObj._id.toString()
    delete returnedObj._id
    delete returnedObj.__v
  }
})

// noteSchema.set('toJSON', {
//     transform: (document, returnedObject) => {
//       returnedObject.id = returnedObject._id.toString()
//       delete returnedObject._id
//       delete returnedObject.__v
//     }
//   })

module.exports = mongoose.model('Person', personSchema)