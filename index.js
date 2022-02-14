const express = require('express')
const app = express()

const cors = require('cors')
require('dotenv').config()
var morgan = require('morgan')

const Person = require('./models/person')
const { response } = require('express')

app.use(express.static('build'))
app.use(cors())
app.use(express.json())

//app.use(morgan('tiny'))
morgan.token('content', function (req, res) {
  if (req.method === 'POST') {
    return JSON.stringify(req.body)
  }
})

app.use(morgan(function (tokens, req, res) {
  return [
    tokens.method(req, res),
    tokens.url(req, res),
    tokens.status(req, res),
    tokens.res(req, res, 'content-length'), '-',
    tokens['response-time'](req, res), 'ms',
    tokens.content(req, res)
  ].join(' ')
}))

const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  }

  next(error)
}

app.get('/api/persons', (request, response) => {
  Person.find({}).then(persons => {
    response.json(persons)
  })
})

app.get('/info', (request, response) => {
  Person.find({}).then(persons => {
    const nofPeople = persons.length
    const responseText = `<p>Phonebook has info for ${nofPeople} people.</p><p> ${new Date()}</p>`
    response.send(responseText)
  })
})

app.get('/api/persons/:id', (request, response, next) => {

  Person.findById(request.params.id)
    .then(person => {
      if (person) {
        response.json(person)
      } else {
        response.status(404).end()
      }
    })
    .catch(error => next(error))
})

app.delete('/api/persons/:id', (request, response, next) => {
  Person.findByIdAndRemove(request.params.id)
    .then(result => {
      response.status(204).end()
    })
    .catch(error => next(error))
})


app.post('/api/persons', (request, response, next) => {
  const body = request.body

  if (!body.name || body.name === '') {
    return response.status(400).json({
      error: 'Name missing'
    })
  }

  if (!body.number || body.number === '') {
    return response.status(400).json({
      error: 'Number missing'
    })
  }

  //check if name is already in phonebook?
  /* if(*name exists*) {
    return response.status(400).json({
      error: 'Name must be unique'
    })
  } */

  const person = new Person({
    name: body.name,
    number: body.number,
    id: Math.floor(Math.random() * 1000000),
  })

  person.save().then(savedPerson => {
    response.json(savedPerson)
  })
    .catch(error => next(error))
})

app.put('/api/persons/:id', (request, response, next) => {
  const { name, number } = request.body

  Person.findByIdAndUpdate(
    request.params.id,
    { name, number },
    { new: true, runValidators: true, context: 'query' }
  )
    .then(updatedPerson => {
      response.json(updatedPerson)
    })
    .catch(error => next(error))
})

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}
app.use(unknownEndpoint)


app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})