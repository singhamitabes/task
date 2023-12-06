const mongoose = require("mongoose")

const dbConnect = async () => {
    try {
        const connect = await mongoose.connect("mongodb://localhost:27017")
            .then(() => console.log("db is connected"))
    } catch (error) {
        console.log(error)
    }
}

module.exports = dbConnect