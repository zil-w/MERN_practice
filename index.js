require('dotenv').config()//so that the process.env can be used in person module
const Person = require('./models/person')
const mongoose = require('mongoose')

const expressConstructor = require('express')
const app = expressConstructor()
app.use(expressConstructor.json())
app.use(expressConstructor.static('build'))

const cors = require('cors')
app.use(cors())

let morgan = require('morgan')

//configuring morgan, add a token 'body' to receive the JSON from request entity-boody
morgan.token('body', (req) => {
  if(typeof(req.body) === 'object'){
    return (JSON.stringify(req.body))
  }
  else{
    return req.body
  }
})

//app.use(morgan(':method :url :status -:response-time ms :body'))

app.get('/',(_request, response) => {
  response.send('<h1>Hello World!</h1>')
})

app.get('/api/persons',(_request, response) => {
  Person.find({})
    .then(results => {
      response.json(results)
    })
})

app.get('/info',(_request, response) => {
  let entriesNum = 0
  Person.find({}).then(results => {
    entriesNum = results.length
    response.send(`<p>There are ${entriesNum} entries in the phone book.</p><br/><p>${new Date()}</p>`)
  })
})

app.get('/api/persons/:id',(request, response, next) => {
  Person
    .findById(request.params.id)
    .then(person => {
      console.log(person)
      if(person !== null){
        response.json(person)
      }
      else{
        response.status(404).end()
      }
    })
    .catch(error => next(error))
    //will we need to send a 404 here?
})

app.delete('/api/persons/:id',(request,response, next) => {
  Person.findByIdAndRemove(request.params.id)//alternative would be deleteOne, and you would need to cast id to ObjectId
    .then(res => {
      console.log('object returned by deletion', res)
      if(res){
        response.status(204).end()
      }
      else{
        response.status(404).end()
      }
    })
    .catch(error => next(error))
})

app.post('/api/persons', (request, response, next) => {
  const receivedPerson = request.body

  if(!receivedPerson.name || !receivedPerson.number){
    console.log('missing field error')
    return(response.status(400).end())
  }

  else{
    const newPerson = new Person({ //we rely on mongoDB to generate id automatically
      name:receivedPerson.name,
      number:receivedPerson.number
    })

    newPerson.save()
      .then(result => {
        const personID = result._id.toString()
        response.status(201).json({ id:personID })
      })
      .catch(error => {
        console.log('are we receiving error? \n', error)
        next(error)
      })
  }
})

app.put('/api/persons/:id', (request, response, next) => {
  const objectId = mongoose.Types.ObjectId(request.params.id)
  const returnAndValidatorOption = { new:true, runValidators: true, context: 'query' }
  console.log('stuff in put body: \n', request.body, '\n id is: \n', objectId)

  Person.findOneAndUpdate({ _id:objectId }, request.body, returnAndValidatorOption)
    .then(updatedPerson => {
      if(updatedPerson){
        response.json(updatedPerson)
      }
      else{
        response.status(404).end()
      }
    })
    .catch(error => next(error))
})

const undefinedPathHandler = (_request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

app.use(undefinedPathHandler)

const errorHandler = (error, request, response, next) => {
  // console.log('error occured while processing the request, request in question: \n', request, '\n')
  // console.log('error is: \n', error, "\n")
  if(error.name === 'CastError'){
    response.status(400).send({ error: 'malformatted ID' })
  }
  else if(error.name === 'ValidationError'){
    response.status(400).send({ error: error.message })
  }
  else{
    console.log('error occured while processing the request, request in question: \n', request, '\n')
    console.log('error is: \n', error, '\n')
    response.status(400).end()
  }
  next(error)
}

app.use(errorHandler)

const portNum = process.env.PORT||3001

app.listen(portNum, () => console.log(`app is running on port ${portNum}`))