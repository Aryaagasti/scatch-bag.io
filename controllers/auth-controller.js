const userModel = require('../models/user-models.js')
const bcrypt = require('bcrypt')
const  {generateToken} = require('../utils/generateToken.js')


module.exports.registerUser = async (req, res) => {
    const { email, fullname, password } = req.body;

    try {
        // Check if email already exists
        const existingUser = await userModel.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: 'Email already exists' });
        }

        // Hash the password
        bcrypt.genSalt(10, (err, salt) => {
            if (err) {
                console.error('Error generating salt:', err);
                return res.status(500).json({ error: 'Server error' });
            }

            bcrypt.hash(password, salt, async (err, hash) => {
                if (err) {
                    console.error('Error hashing password:', err);
                    return res.status(500).json({ error: 'Server error' });
                }

                try {
                    // Create new user
                    const newUser = await userModel.create({
                        email,
                        password: hash,
                        fullname
                    });

                    // Generate JWT token
                    const token = generateToken(newUser);

                    // Set token as HTTP-only cookie
                    res.cookie('token', token, { httpOnly: true });

                    res.status(201).send('User created successfully');
                } catch (err) {
                    console.error('Error creating user:', err);
                    res.status(500).json({ error: 'Server error' });
                }
            });
        });
    } catch (err) {
        console.error('Error registering user:', err);
        res.status(500).json({ error: 'Server error' });
    }
};

module.exports.loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await userModel.findOne({ email: email });
        
        if (!user) {
            req.flash('error_msg', 'Invalid credentials');
            return res.redirect('/');
        }
        
        bcrypt.compare(password, user.password, (err, result) => {
            if (result) {
                const token = generateToken(user);
                res.cookie('token', token);
                res.redirect('/shop');
            } else {
                req.flash('error_msg', 'Email or password incorrect');
                res.redirect('/');
            }
        });
    } catch (err) {
        console.error('Error logging in user:', err);
        req.flash('error_msg', 'Server error');
        res.status(500).json({ error: 'Server error' });
    }
}


module.exports.logout = async = (req,res)=>{
    try{
         res.clearCookie('token')
         res.redirect("/")
    }catch(err){
        console.error('Error logging out:', err);
        res.status(500).json({ error: 'Server error' });
    }

}