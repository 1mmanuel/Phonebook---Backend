require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const cors = require("cors");

const app = express();

const Person = require("./models/person");

morgan.token("type", function (req, res) {
  return JSON.stringify(req.body);
});

app.use(express.json());
app.use(
  morgan(":method :url :status :res[content-length] - :response-time ms :type")
);

app.use(cors());
app.use(express.static("dist"));

const errorHandler = (error, request, response, next) => {
  console.error(error.message);

  if (error.name === "CastError") {
    return response.status(400).send({ error: "malformatted id" });
  } else if (error.name === "ValidationError") {
    return response.status(400).json({ error: error.message });
  } else if (error.name === "Internal Server Error") {
    return response.status(500).json({ error: error.message });
  }

  next(error);
};

app.use(errorHandler);

const requestReceivedTime = new Date();

app.get("/info", (request, response) => {
  console.log(requestReceivedTime);

  Person.find({}).then((persons) => {
    response.send(`<p>Phonebook has info for ${persons.length} people </p>
    <p>${requestReceivedTime}</p>`);
  });
});

app.get("/api/phonebook", (request, response) => {
  Person.find({}).then((persons) => {
    response.json(persons);
  });
});

app.get("/api/phonebook/:id", (request, response, next) => {
  const id = request.params.id;
  console.log(request.params.id);

  Person.findById(id)
    .then((persons) => {
      response.json(persons);
    })
    .catch((error) => next(error));
});

app.delete("/api/phonebook/:id", (request, response, next) => {
  Person.findByIdAndDelete(request.params.id)
    .then((result) => {
      response.status(204).end();
    })
    .catch((error) => next(error));
});

app.post("/api/phonebook", (request, response, next) => {
  const personContent = request.body;
  const personName = personContent.person;

  Person.find({ person: personName }).then((persons) => {
    if (persons.length > 0) {
      console.log(persons);
      Person.findByIdAndUpdate(persons[0].id, personContent, {
        new: true,
        runValidators: true,
      })
        .then((updatedPerson) => {
          response.json(updatedPerson);
        })
        .catch((error) => next(error));
    } else {
      if (personContent.person === undefined) {
        return response.status(400).json({
          error: "content missing",
        });
      }

      const person = new Person({
        person: personContent.person,
        number: personContent.number,
      });

      person
        .save()
        .then((savedPerson) => {
          response.json(savedPerson);
        })
        .catch((error) => next(error));
    }
  });
});

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
