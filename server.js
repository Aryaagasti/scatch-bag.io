const dotenv = require("dotenv");
const connectDB = require("./database/db.js");
const app = require("./app.js");


// Load environment variables from .env file (if it exists)
dotenv.config({
    path: './.env'
});




// Connect to the database
connectDB()
  .then(() => {
    // Start the server only after successful database connection
    const port = process.env.PORT || 8000; // Use environment variable or default

    app.listen(port, () => {
      console.log(`Server is running on port: ${port}`);
    });
  })
  .catch((error) => {
    console.error("Error connecting to MongoDB:", error);
    process.exit(1); // Exit the application with an error code
  });

