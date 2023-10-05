const express = require("express");
const mysql = require('mysql2')
const nodemailer = require('nodemailer')
require("dotenv").config()

let transporter

nodemailer.createTestAccount().then(res => {


  transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      type: 'OAuth2',
      user: process.env.USEREMAIL,
      clientId: process.env.CLIENTID,
      clientSecret: process.env.CLIENTSECRET,
      refreshToken: process.env.CLIENTREFRESHTOKEN,
      accessToken: process.env.CLIENTACCESSTOKEN
    }
  })
})

const connection = mysql.createConnection({
  host: process.env.HOST,
  user: process.env.USER,
  password: process.env.PASSWORD,
  database: process.env.DATABASE
})
connection.connect()

const app = express()
app.use(express.json())
const port = 3000

app.get('/users', (req, res) => {
  connection.query('SELECT * FROM users', (err, rows, fields) => {
    if (err) throw err
    console.log(rows);
    console.log(typeof rows);
    res.send(rows)
  })
})

app.post('/users/:userId', (req, res) => {
  connection.query(`INSERT INTO users (last_name, first_name, patronymic, email) VALUES (
    "${req.body.last_name}", "${req.body.first_name}", ${req.body.patronymic ? `${req.body.patronymic}` : "NULL"}, "${req.body.email}"
    )
  `, (err, result) => {
    res.send(err || result)
  })
})

app.put('/users/:userId', (req, res) => {
  connection.query(`
  UPDATE users 
  SET last_name = "${req.body.last_name}", 
    first_name = "${req.body.first_name}", 
    patronymic = ${req.body.patronymic
      ? `"${req.body.patronymic}"`
      : "NULL"
    }, 
    email = "${req.body.email}"
  WHERE ID = ${req.params.userId}
  `,
    (err, result) => {
      res.send(err || result)
    })
})

app.delete('/users/:userId', (req, res) => {
  connection.query(`
  DELETE FROM users WHERE ID = ${req.params.userId}
  `, (err, result) => {
    res.send(err || result)
  })
})

app.post('/mailTo/:userId', (req, res) => {
  transporter.sendMail({
    from: process.env.FROM,
    to: req.body.to,
    subject: req.body.subject,
    text: req.body.text,
    html: req.body.html,
  }).then(result => {
    res.send(result)
  })
})

app.listen(port, () => {
  console.log(`Server is listening on port ${port}.`)
})