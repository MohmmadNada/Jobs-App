'use strict'; //151251
const express = require('express');
const cors = require('cors');
const superagent = require('superagent');
const pg = require('pg');
const methodOverride = require('method-override');

require('dotenv').config();
const PORT = process.env.PORT || 3000;
const app = express();

app.use(express.urlencoded({ extended: true }))
app.use(express.static('./public'));
app.use(methodOverride('_method'));
app.set('view engine', 'ejs');
app.use(cors());
//----------------------------------------starter code -------------------------
app.get('/', homePageHandler);
app.get('/search', searchPageGet);
app.post('/result', searchPost);
app.get('/result', resultGet);
app.get('/mycard', mycardHandler)
app.post('/mycard', saveJob);
app.get('/details/:id', detailsGetHandler)
app.put('/details/:id', updateJob)
app.delete('/details/:id', deleteJob)

function homePageHandler(request, response) {
    let url = `https://jobs.github.com/positions.json?location=usa`;
    superagent.get(url).then(resultAPI => {
        resultAPI.body.forEach(element => {
                let newJob = new Job(element.title, element.company, element.location, element.url)
            })
            // response.send(allJob)
        response.render('index', { allResult: allJob })
    })
}

function searchPageGet(request, response) {
    response.render('search')
}

function searchPost(request, response) {
    let userInput = request.body.descriptionInput;
    let url = `https://jobs.github.com/positions.json?description=${userInput}&location=usa`;
    superagent.get(url).then(resultSearch => {
        resultSearch.body.forEach(element => {
            let newJobs = new JobResult(element.title, element.company, element.location, element.url, element.description)
        })
        response.render('result', { searchResult: allJobResult })
    })
}

function resultGet(request, response) {
    response.render('result')
}

function mycardHandler(request, response) {
    let SQL = `SELECT * FROM jobstable`;
    client.query(SQL).then(savedRes => {
        response.render('mycard', { saveJob: savedRes.rows })
    })
}

function saveJob(request, response) {
    let title = request.body.saveJob[0];
    let company = request.body.saveJob[1];
    let location = request.body.saveJob[2];
    let link = request.body.saveJob[3];
    let description = request.body.saveJob[4];
    let values = [title, company, location, link, description];

    let SQL = `   INSERT INTO jobstable (title, company, location,link,description)
    VALUES ($1,$2,$3,$4,$5);`
    client.query(SQL, values).then(dataInsert => {
        console.log('save done');
    })
    response.redirect('/mycard')
}

function detailsGetHandler(request, response) {
    let id = request.params.id;
    let values = [id];
    let SQL = `SELECT * FROM jobstable WHERE id=$1`;
    client.query(SQL, values).then(result => {
        // let title = result.rows[0].title;
        // let company = result.rows[0].company;
        // let location = result.rows[0].location;
        // let link = result.rows[0].link;
        // let description = result.rows[0].description;
        response.render('details', { details: result.rows[0] })
    })
}

function updateJob(request, response) {
    let id = request.body.update[0]
    let title = request.body.update[1]
    let company = request.body.update[2]
    let location = request.body.update[3]
    let link = request.body.update[4]
    let description = request.body.update[5]
    let values = [id, title, company, location, link, description];
    let SQL = `UPDATE jobstable
    SET title = $2, company = $3,  location = $4, link = $5, description = $6
    WHERE id=$1;`
    client.query(SQL, values).then(updateRes => {
        console.log('update done');
    })
    response.redirect(`/details/${id}`)
}

function deleteJob(request, response) {
    let id = request.body.deleteData
    let SQL = `DELETE FROM jobstable WHERE id=$1;`;
    let values = [id]
    client.query(SQL, values).then(updateRes => {
        console.log('delete done');
    })
    response.redirect(`/mycard`)

}
















let allJob = [];

function Job(title, company, location, link) {
    this.title = title;
    this.company = company;
    this.location = location;
    this.link = link;
    allJob.push(this)
}
let allJobResult = [];

function JobResult(title, company, location, link, description) {
    this.title = title;
    this.company = company;
    this.location = location;
    this.link = link;
    this.description = description;
    allJobResult.push(this)
}
//----------------------------------------starter code -------------------------
const client = new pg.Client(process.env.DATABASE_URL);
client.connect().then(() => {
    app.listen(PORT, () => console.log(`work on port number ${PORT}`))
})