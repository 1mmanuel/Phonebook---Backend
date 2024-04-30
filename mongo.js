const mongoose = require("mongoose");

if (process.argv.length < 3) {
  console.log("give password as argument");
  process.exit(1);
}

const password = process.argv[2];

const url = `mongodb+srv://immanuel2413:${password}@cluster0.pussdcq.mongodb.net/phonebookApp?retryWrites=true&w=majority&appName=Cluster0`;

mongoose.set("strictQuery", false);

mongoose.connect(url);

const personSchema = new mongoose.Schema({
  person: String,
  number: String,
});

const Person = mongoose.model("Person", personSchema);

if (process.argv.length === 3) {
  Person.find({}).then((result) => {
    result.forEach((person) => {
      console.log(person);
    });
    mongoose.connection.close();
  });
} else if (process.argv.length > 3 && process.argv.length < 6) {
  const person = new Person({
    person: process.argv[3],
    number: process.argv[4],
  });

  person
    .save()
    .then((result) => {
      console.log(`${result}`);
      mongoose.connection.close();
    })
    .catch((error) => {
      console.error("An error occurred:", error);
      mongoose.connection.close();
    });
} else {
  console.log("invalid input");
  mongoose.connection.close();
}
