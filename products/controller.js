const connection = require("../db/index");
const { Router } = require('express');
const path = require('node:path');

const getProducts = (req, res) => {
    const sql = "SELECT * FROM Products";
    try {
        connection.query(sql, (err, result) => {
            if (err) throw err;
            res.status(200).json(result);
        })
    } catch (error) {
        res.sendStatus(500);
    }

};

const getOneProduct = (req, res) => {
    const id = req.params.id;
    const sql = "SELECT * FROM Products WHERE id = ?";
    try {
        connection.query(sql, id, (err, result) => {
            if (err) throw err;
            res.status(200).json(result);
        })
    } catch (error) {
        res.sendStatus(500);
    }
}

const addProduct = (req, res) => {
    const product = req.body;
    const sql = "INSERT INTO Products SET ?";
    const file = req.files.file

    try {
        file.mv(path.join(__dirname, '..', "public", "assets", file.name), err => {
            if (err) {
                res.sendStatus(500);
            }
        })

        connection.query(sql, product, (err, result) => {
            if (err) throw err;
            res.status(201).json({ msg: "Product added" })
        })
    } catch (error) {
        res.sendStatus(500);
    }
}

const updateProduct = (req, res) => {
    const id = req.params.id;
    const product = req.body;
    const sql = "UPDATE Products SET ? WHERE id = ?";

    try {
        if (req.files) {
            const file = req.files.file
            file.mv(path.join(__dirname, '..', "public", "assets", file.name), err => {
                if (err) {
                    res.sendStatus(500);
                }
            })
        }

        connection.query(sql, [product, id], (err, result) => {
            if (err) throw err;
            res.status("200").json({ msg: "product updated" });
        })
    } catch (error) {
        res.sendStatus(500);
    }

}

const deleteProduct = (req, res) => {
    const id = req.params.id;
    const sql = "DELETE FROM Products WHERE id = ?";

    try {
        connection.query(sql, id, (err, result) => {
            if (err) throw err;
            res.sendStatus(204);
        })
    } catch (error) {
        res.sendStatus(500);
    }

}

const router = Router();

router.get("/", getProducts);
router.get("/:id", getOneProduct);
router.post("/", addProduct);
router.put("/:id", updateProduct);
router.delete("/:id", deleteProduct);

module.exports = router;