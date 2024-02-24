const express = require('express')
const mysql = require('mysql2/promise')

async function connect_mysql(resolve) {
    try {
        resolve(await mysql.createConnection('mysql://root:root@db/nodedb'))
    } catch (err) {
        console.log('waitting for database')
        // console.log(err)
        setTimeout(() => connect_mysql(resolve), 1000)
    }
}

async function bootstrap() {
    // wait-for-db on app mode
    const conn = await new Promise((resolve) => connect_mysql(resolve))
    //
    await conn.query('DROP TABLE IF EXISTS person')
    await conn.query('CREATE TABLE person (id INT AUTO_INCREMENT NOT NULL KEY,name VARCHAR(500) NOT NULL)')
    await conn.query(`INSERT INTO person (name) VALUES ('John'),('Phill'),('Carter'),('Mary'),('Will')`)
    //
    const app = express()
    app.get('/', async (req, res) => {
        try {
            const [rows,] = await conn.query('SELECT * FROM person ORDER BY name')
            let output = '<h1>Full Cycle Rocks!</h1>';
            rows.forEach((row) => output += `<p>${row.name}</p>`)
            res.send(output)
        } catch (err) {
            console.log(err)
            res.status(500).send('Database error');
        }
    })
    console.log('Listen on 3000')
    app.listen(3000)
}

bootstrap()