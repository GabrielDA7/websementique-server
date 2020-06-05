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

app.get('/get-top-searched', async function (req, res) {
    const selectQuery= "SELECT ?v WHERE  { GRAPH <http://sandbox.bordercloud.com/genealogie> { <http://sandbox.bordercloud.com/celebrity> <http://sandbox.bordercloud.com/views> ?v . } }"
    return await fetch('https://sandbox.bordercloud.com/sparql?query=' + selectQuery, {method:'GET',
        headers: {'Authorization': 'Basic ' + Buffer.from('ESGI-WEB-2020:ESGI-WEB-2020-heUq9f').toString('base64'), 'Content-type': 'application/json'}})
        .then(response => response.json())
        .then(json => json)
        .catch(err => console.log(err));
});

app.post('/search-person', async function (req, res) {
    const personName= req.body.personName;
    const personId= req.body.id;
    const clientIp = requestIp.getClientIp(req);

    const insertQuery= 'INSERT DATA { GRAPH <genealogie> {' +
        '<'+personId+'> <client:ip> "'+ clientIp + '" . ' +
        '<'+personId+'> <person:name> "'+ personName +'" .' +
        '} }';

    console.log(insertQuery);

    await fetch('https://sandbox.bordercloud.com/sparql?update=' + insertQuery, {method:'POST',
        headers: {'Authorization': 'Basic ' + Buffer.from('ESGI-WEB-2020:ESGI-WEB-2020-heUq9f').toString('base64'), 'Content-type': 'application/json'}})
        .then(response => response.json())
        .then(json => console.log(json))
        .catch(err => console.log(err));

    return res.send({message: 'ok'});
});


app.listen(3001, function () {
    console.log('Example app listening on port 3001!')
})
