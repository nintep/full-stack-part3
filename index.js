const express = require('express')
var morgan = require('morgan')

const app = express()

app.use(express.json())
app.use(express.static('build'))

//app.use(morgan('tiny'))

morgan.token('content', function (req, res) {
  if(req.method === "POST"){
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


let persons = [
  {
    "name": "Arto Hellas",
    "number": "040-123456",
    "id": 1
  },
  {
    "name": "Ada Lovelace",
    "number": "39-44-5323523",
    "id": 2
  },
  {
    "name": "Dan Abramov",
    "number": "12-43-234345",
    "id": 3
  },
  {
    "name": "Mary Poppendieck",
    "number": "39-23-6423122",
    "id": 4
  }
]


app.get('/api/persons', (req, res) => {
  res.json(persons)
})

app.get('/info', (req, res) => {
  const nofPeople = persons.length
  const responseText = `<p>Phonebook has info for ${nofPeople} people.</p><p> ${new Date()}</p>`
  res.send(responseText) 
})

app.get('/api/persons/:id', (req, res) => {
  const id = Number(req.params.id)
  const person = persons.find(person => person.id === id)

  if (person) {
    res.json(person)
  } else {
    res.status(404).end()
  }
})

app.delete('/api/persons/:id', (req, res) => {
  const id = Number(req.params.id)
  persons = persons.filter(person => person.id !== id)

  res.status(204).end()
})


app.post('/api/persons', (req, res) => {
  const body = req.body

  if(!body.name) {
    return res.status(400).json({ 
      error: 'Name missing' 
    })
  }

  if(!body.number) {
    return res.status(400).json({ 
      error: 'Number missing' 
    })
  }

  if(persons.map(person => person.name).includes(body.name)){
    return res.status(400).json({ 
      error: 'Name must be unique' 
    })
  }

  const person = {
    name: body.name,
    number: body.number,
    id: Math.floor(Math.random() * 1000000),
  }

  persons = persons.concat(person)

  res.json(person)

})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})