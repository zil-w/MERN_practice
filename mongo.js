const mongoose = require('mongoose')
if (process.argv.length < 3) {
  console.log('please enter your password')
  process.exit(-1)
}

const connectionString = process.env.DB_CONN_STRING

mongoose.connect(connectionString, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false, useCreateIndex: true })

const personSchema = new mongoose.Schema({ //okay we are missing a step here first we need to define a schema, then we need to register it with mongoose, through model
  //id: Number, //let's see what would happen by removing this
  name: String,
  number: String
})

const Person = mongoose.model('Person', personSchema)//"registering a schema"

if (process.argv.length === 3) {
  Person.find({})
    .then(result => {
      if (result.length === 0) {
        console.log('no entry')
      }
      else {
        result.forEach(person => console.log(person))
      }
      mongoose.connection.close()
    })
}
else if (process.argv.length === 5) {
  const newPerson = new Person({
    //id: Math.floor(Math.random()*10000000000),
    name: process.argv[3],
    number: process.argv[4]
  })

  newPerson.save().then(result => {
    console.log(result)
    console.log(`added ${newPerson.name} number ${newPerson.number} to the phonebook`)
    mongoose.connection.close()
  })
}
else {
  console.log('invalid argument length')
  mongoose.connection.close()
  process.exit(-1)
}

