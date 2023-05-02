const connection = require("../db/index");
const { Router } = require('express');

const addOrder = (req, res) => {
    const sql = "INSERT INTO Orders SET ?";
    const order = req.body;

    try {
        connection.query(sql, order, (err, result) => {
            if (err) throw err;
            res.status(201).json({ msg: "Order received" })
        })
    } catch (error) {
        res.sendStatus(500);
    }
}

const getOrder = (req, res) => {
    const sql = "SELECT * FROM Orders WHERE userid = ?";
    const userId = req.params.id;

    try {
        connection.query(sql, userId, (err, result) => {
            if (err) throw err;
            res.status(201).json(result);
        })
    } catch (error) {
        res.sendStatus(500);
    }
}

const router = Router();

router.post("/", addOrder);
router.get("/:id", getOrder);

module.exports = router;