const express = require("express");
const morgan = require("morgan");
const cors = require("cors");

const app = express();

morgan.token("type", function (req, res) {
  return JSON.stringify(req.body);
});

app.use(express.json());
app.use(
  morgan(":method :url :status :res[content-length] - :response-time ms :type")
);

app.use(cors());

let phonebook = [
  {
    id: 1,
    name: "Arto Hellas",
    number: "040-123456",
  },
  {
    id: 2,
    name: "Ada Lovelace",
    number: "39-44-5323523",
  },
  {
    id: 3,
    name: "Dan Abramov",
    number: "12-43-234345",
  },
  {
    id: 4,
    name: "Mary Poppendieck",
    number: "39-23-6423122",
  },
];

const requestReceivedTime = new Date();
const phonebookLenght = phonebook.length;

app.get("/info", (request, response) => {
  console.log(requestReceivedTime);
  response.send(`<p>Phonebook has info for ${phonebookLenght} people </p>
  <p>${requestReceivedTime}</p>`);
});

app.get("/api/phonebook", (request, response) => {
  response.json(phonebook);
});

app.get("/api/phonebook/:id", (request, response) => {
  const id = Number(request.params.id);
  const persons = phonebook.find((person) => person.id === id);

  if (persons) {
    response.json(persons);
  } else {
    response.status(404).end();
  }
});

app.delete("/api/phonebook/:id", (request, response) => {
  const id = Number(request.params.id);
  phonebook = phonebook.filter((person) => person.id !== id);

  response.status(204).end();
});

app.post("/api/phonebook", (request, response) => {
  const generateId = () => {
    return Math.floor(Math.random() * 1000);
  };

  const personContent = request.body;
  const existingPerson = phonebook.find(
    (person) => person.name === personContent.name
  );

  if (!personContent.name) {
    return response.status(400).json({
      error: "content missing",
    });
  }

  if (existingPerson) {
    return response.status(409).json({
      error: "name must be unique",
    });
  }

  const person = {
    id: generateId(),
    name: personContent.name,
    number: personContent.number,
  };

  phonebook = phonebook.concat(person);

  response.json(person);
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
