const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database.sqlite');
const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const jsonParser = bodyParser.json();

app.get('/api/products/add', (req, res) => {
	res.sendFile(__dirname + '/add.html')
});


app.put('/api/products/:id', jsonParser, function (req, res) {
	const id = req.params.id;
	const { name, required, purchased} = req.body;
	console.log(req.body)

	const sql = `UPDATE purchases SET name = $name, required = $required, purchased = $purchased WHERE id = $id`;
	const items = {$name: name, $required: required, $purchased: purchased, $id: 2};

	db.run(sql, items, 
		function(err) {
	  		if (err) {
	    		return console.error(err.message);
	  		}
	  		console.log(`Row(s) updated: ${this.changes}`);
	});
	res.send()

});

app.delete('/api/products/:id', function (req, res) {
	const id = req.params.id;
	db.run("DELETE FROM purchases WHERE id=(?)", id, function(err) {
	  	if (err) {
	    	return console.error(err.message);
	  	}
	  	console.log(`Row(s) deleted ${this.changes}`);
	});
  	res.send()
});


app.get('/api/products', (req, res) => {

 	db.all('SELECT DISTINCT id, name, required, purchased FROM purchases', (err, rows) => {
        rows.forEach((row) => {
            console.log(row.id, row.name, row.required, row.purchased);
        })

        res.send(rows)
	});
});

app.post('/api/products/add', jsonParser, (req, res) => {
	if (!req.body) return res.sendStatus(400);
  	console.log(req.body); 
	const { name, required, purchased,} = req.body
	const arrPush = [{name, required, purchased}]
	dbWorkerPush(arrPush)
});


app.listen(3000, () => console.log('Server is open'));

db.run('CREATE TABLE purchases ( id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, required BOOLEAN DEFAULT(TRUE), purchased BOOLEAN DEFAULT(TRUE))')

const dbWorkerPush = (arr) => {

	db.serialize(function() {

	  	const stmt = db.prepare('INSERT INTO purchases(name, required, purchased) VALUES (?, ?, ?)');

		arr.forEach(item => { stmt.run(item.name, item.required, item.purchased) });

	  	db.each('SELECT * FROM purchases', function(err, row) {
	    	console.log(row.id + ': ' + row.name, row.required, row.purchased);
	  	});
	});
}

/*const arrFirst = [{name:'Вода ', required: true, purchased: true},{name:'Сок ', required: false, purchased: true},{name:'Яблоки ', required: true, purchased: false}];

dbWorkerPush(arrFirst);*/