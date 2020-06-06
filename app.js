const express = require('express');
const app = express();
const fetch = require('node-fetch');
const requestIp = require('request-ip');
const cors = require('cors');
const bodyParser = require('body-parser');


app.use(bodyParser.json());
app.use(cors({
    origin: '*'
}));

app.get('/get-top-searched', function (req, res) {
    const selectQuery= "SELECT ?name (COUNT(?ip) AS ?count) WHERE { GRAPH <genealogie>" +
        "       {" +
        "               ?id <client:ip> ?ip ." +
        "               ?id <person:name> ?name ." +
        "       }" +
        "} GROUP BY ?name ORDER BY DESC(?count) LIMIT 3";
    return fetch('https://sandbox.bordercloud.com/sparql?query=' + selectQuery, {
        method: 'GET',
        headers: {
            'Authorization': 'Basic ' + Buffer.from('ESGI-WEB-2020:ESGI-WEB-2020-heUq9f').toString('base64'),
            'Content-type': 'application/json'
        }
    }).then(response => response.json())
        .then(json => res.send(json.results.bindings.map(item => {
            return {
                name: item.name.value,
                count: item.count.value
            }
        })))
        .catch(err => console.log(err));
});

app.post('/search-person', function (req, res) {
    const personName= req.body.personName;
    const personId= req.body.id;
    const clientIp = requestIp.getClientIp(req);

    const insertQuery= 'INSERT DATA { GRAPH <genealogie> {' +
        '<'+personId+'> <client:ip> "'+ clientIp + '" . ' +
        '<'+personId+'> <person:name> "'+ personName +'" .' +
        '} }';

    console.log(insertQuery);

    fetch('https://sandbox.bordercloud.com/sparql?update=' + insertQuery, {
        method:'POST',
        headers: {
            'Authorization': 'Basic ' + Buffer.from('ESGI-WEB-2020:ESGI-WEB-2020-heUq9f').toString('base64'),
            'Content-type': 'application/json'
        }})
        .then(response => response.json())
        .then(json => {
            return res.send({message: 'ok'});
        })
        .catch(err => console.log(err));
});


app.listen(process.env.PORT || 3001, function () {
    console.log('Example app listening on port 3001!')
})
