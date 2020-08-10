require('dotenv').config();

const mongoose = require('mongoose');

const url = process.env.DATABASE;

const connectDB = async () => {
    try  {
        await mongoose.connect(url, {
            useNewUrlParser: true,
            useCreateIndex: true,
            useFindAndModify: true,
            useUnifiedTopology: true
        });

        console.log("connected to database");
    } catch (error) {
        console.log(error.message);
        process.exit();
    }
}

module.exports = connectDB;