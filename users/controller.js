require('dotenv').config()

const connection = require("../db/index");
const { Router } = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const registerUser = async (req, res) => {
    const search = `SELECT * FROM Users WHERE email = "${req.body.email}"`
    const insert = "INSERT INTO Users SET ?";
    const user = req.body;
    user.isModerator = false;

    try {
        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        user.password = hashedPassword;
    } catch (error) {
        res.sendStatus(500);
    }

    try {
        connection.query(search, (err, result) => {
            if (err) throw err;
            if (result.length) {
                res.status(200).json({ msg: "Email already registered" })
            } else {
                try {
                    connection.query(insert, user, (err, result) => {
                        if (err) throw err;
                        res.status(201).json({ msg: "User Created" })
                    });
                }
                catch (error) {
                    res.sendStatus(500);
                }
            }
        });
    }
    catch (error) {
        res.sendStatus(500);
    }
};

const loginUser = (req, res) => {
    const sql = "SELECT * FROM Users WHERE email = ?";
    const email = req.body.email;

    try {
        connection.query(sql, email, async (err, result) => {
            if (err) throw err;
            const user = result[0];
            if (user) {
                try {
                    if (await bcrypt.compare(req.body.password, user.password)) {
                        const accessToken = jwt.sign(JSON.parse(JSON.stringify(user)), process.env.ACCESS_TOKEN_SECRET)
                        res.status(201).json({ accessToken: accessToken })
                    } else {
                        res.status(200).json({ msg: "Username or Password Incorrect" })
                    }
                } catch (err) {
                    res.sendStatus(500);
                }
            } else {
                res.status(200).json({ msg: "Username or Password Incorrect" })
            }

        })
    } catch (error) {
        res.sendStatus(500);
    }

}

const getUser = (req, res) => {
    try {
        const user = req.user
        res.status(200).json({
            id: user.id,
            firstname: user.firstname,
            lastname: user.lastname,
            email: user.email,
            street: user.street,
            city: user.city,
            state: user.state,
            zip: user.zip,
            isModerator: user.isModerator
        });
    } catch (error) {
        res.sendStatus(500);
    }
}

const isModerator = (req, res) => {
    try {
        if (req.user.isModerator) {
            res.sendStatus(200);
        } else {
            res.sendStatus(401);
        }
    } catch (error) {
        res.sendStatus(500);
    }
}

const editUser = async (req, res) => {
    const id = req.params.id;
    const search = `SELECT * FROM Users WHERE email = "${req.body.email}"`
    const email = req.body.email;
    const user = req.body;
    const sql = "UPDATE Users SET ? WHERE id = ?"

    if (req.body.password) {
        try {
            const hashedPassword = await bcrypt.hash(req.body.password, 10);
            user.password = hashedPassword;
        } catch (error) {
            res.sendStatus(500);
        }
    }

    try {
        connection.query(search, (err, result) => {
            if (err) throw err;
            if (result.length && result[0].id != id) {
                res.status(200).json({ msg: "Email already registered" })
            } else {
                try {
                    connection.query(sql, [user, id], (err, result) => {
                        if (err) throw err;
                        res.status(200).json({ msg: "User Updated" })
                    });
                }
                catch (error) {
                    res.sendStatus(500);
                }
            }
        }
        );
    } catch (error) {
        res.sendStatus(500);
    }
}

function authToken(req, res, next) {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1];

    if (token == null) return res.status(401).json({ msg: "No Token" })

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
        if (err) return res.status(403).json({ msg: "Bad Token" })
        req.user = user
        next()
    })
}

const router = Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/user", authToken, getUser);
router.get("/mod", authToken, isModerator);
router.put("/user/:id", editUser);

module.exports = router;