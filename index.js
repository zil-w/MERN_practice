let phonebook = {
  persons:[
    {
      id: 1,
      name: 'Dan',
      number: '123123123'
    },
    {
      id: 2,
      name: 'Vlad',
      number: '12312312424'
    },
    {
      id: 3,
      name: 'Jan',
      number:'123123124324'
    }
  ]
}

//const { request } = require('Express')
//const { request, response } = require('Express')
//   const app = http.createServer((request, response) => {
//     response.writeHead(200, { 'Content-Type': 'application/json' })
//     response.end(JSON.stringify(notes))
//   })


const expressConstructor = require('express')
const app = expressConstructor()
app.use(expressConstructor.json())

const cors = require('cors')
app.use(cors())
//example of middleware 1
// const requestLogger = (request, response, next) => {
//   console.log('Method:', request.method)
//   console.log('Path:  ', request.path)
//   console.log('Body:  ', request.body)
//   console.log('---')
//   next()
// }

//app.use(requestLogger)

//example of middleware 2, this just makes every response an error 404 tho
// const unknownEndpoint = (request, response) => {
//   response.status(404).send({ error: 'unknown endpoint' })
// }
// app.use(unknownEndpoint)

let morgan = require('morgan')

//configuring morgan
morgan.token('body', (req, res) =>{
  if(typeof(req.body === 'object')){
    return (JSON.stringify(req.body))
  }
  else{
    return req.body
  }
})

//pre-defined format tiny + body is as follow ':method :url :status -:response-time ms :body'

//app.use(morgan(':method :url :status -:response-time ms :body'))

app.get('/',(request, response)=> {
    response.send('<h1>Hello World!</h1>')
})

app.get('/api/persons',(request, response)=> {
    response.json(phonebook.persons)
})

app.get('/info',(request, response)=> {
  response.send(`<p>There are ${phonebook.persons.length} entries in the phone book.</p><br/><p>${new Date()}</p>`)
})

app.get('/api/persons/:id',(request, response)=> {
    const id = Number(request.params.id)
    const reqPerson = phonebook.persons.find(person => person.id === id)
    
    if(reqPerson === undefined){
        response.status(404).end()
    }
    else{
        response.json(reqPerson)
    }
})

app.delete('/api/persons/:id',(request,response)=>{
    const id = Number(request.params.id)
    const person = phonebook.persons.find(person => person.id === id)
    
    if(person !== undefined){
      phonebook.persons = phonebook.persons.filter(person => person.id !==id)
      response.status(204).end()
      console.log(`${person.name} has been deleted.`)
    }
    else{
      response.status(404).end()
    }
})

app.post('/api/persons', (request, response) =>{
    //console.log('processing', request)
    const receivedPerson = request.body
    //let receivedPerson = JSON.parse(request.body)
    // let receivedPerson
    // try{
    //   receivedPerson = JSON.parse(request.body)
    // }
    // catch(e){
    //   console.log('malformed request')
    //   return(response.status(400).end())
    //} //okay this fails, not only it fails but it executes the catch block everytime for some reason

    if(!receivedPerson.name || !receivedPerson.number){
      console.log('missing field error')
      return(response.status(400).end())
    }
    else if(phonebook.persons.find(person => person.name === receivedPerson.name) !== undefined){
      console.log('duplicated name error')
      return(
        response.status(409).json({error: 'name must be unique'}).end()
      )
    }
    else{
      const newPerson = {
        id: Math.floor(Math.random()*1000000000),
        name:receivedPerson.name,
        number:receivedPerson.number
      }

      phonebook.persons.push(newPerson)
      console.log('addition successful', phonebook.persons)
      response.status(201).end()
    }
})

const portNum = process.env.PORT||3001

app.listen(portNum, ()=> console.log(`app is running on port ${portNum}`))