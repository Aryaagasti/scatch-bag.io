const express = require("express");
const cookieParser = require("cookie-parser");
const path = require('path');
const ownersRouter = require('./routes/ownersRouter.js');
const productsRouter = require('./routes/productsRouter.js');
const usersRouter = require('./routes/usersRouter.js');
const indexRouter = require('./routes/index.js');
const userModel = require('./models/user-models.js')
const dotenv = require("dotenv")
const cors = require("cors")
const stripe = require("stripe")("sk_test_51PUKza2LGrAf9sT3yd8ClyOGb4sDMWRECcN9jukm9q8k5jABsJHd2nV9gmWvCRxCV5iAcDuxmBqqaEx0NECFzF7500HXJfmKZg")
const expressSession = require("express-session");
const flash = require("connect-flash");
const isLoggedin = require('./middlewares/isLoggedin.js')


dotenv.config({
    path: './.env'
})

const app = express();
app.use(cors(
    {
        origin: [""],
        methods: ["POST", "GET"],
        credentials: true
    }
))


// Set views directory
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Express Session middleware
app.use(expressSession({
    secret: "mysession", // Provide your secret here
    resave: false,
    saveUninitialized: false
}));

// Flash messages middleware
app.use(flash());

// Routes
app.use("/", indexRouter);
app.use("/owners", ownersRouter);
app.use("/users", usersRouter);
app.use("/products", productsRouter);
app.use(async (req, res, next) => {
    res.locals.currentUser = req.user; // Assuming req.user is set after authentication
    next();
});



app.get('/', (req, res) => {
    res.render('index', { currentUser: req.user });
});

app.post('/api/create-checkout-session', isLoggedin, async (req, res) => {
  try {
      let user = await userModel.findOne({ email: req.user.email }).populate("cart");

      let totalAmount = 0;
      user.cart.forEach(item => {
          totalAmount += (Number(item.price) + 20 - Number(item.discount));
      });

      const session = await stripe.checkout.sessions.create({
          payment_method_types: ['card'],
          line_items: user.cart.map(item => ({
              price_data: {
                  currency: 'inr', // Adjust currency as per your requirements
                  product_data: {
                      name: item.name,
                      // Remove or replace the images field with a valid URL
                      // images: item.image ? [item.image.toString('base64').slice(0, 1024)] : [],
                  },
                  unit_amount: (Number(item.price) + 20 - Number(item.discount)) * 100, // Amount in cents
              },
              quantity: 1, // Assuming each item is added once
          })),
          mode: 'payment',
          success_url: `${req.protocol}://${req.get('host')}/success`,
          cancel_url: `${req.protocol}://${req.get('host')}/cart`,
      });

      res.json({ id: session.id }); // Redirect to Stripe checkout
  } catch (error) {
      console.error("Error creating Stripe checkout session:", error);
      res.status(500).send("Server error");
  }
});

  

module.exports = app;
