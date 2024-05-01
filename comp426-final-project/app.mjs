import express from 'express';
import bodyParser from 'body-parser';
import {Node} from './node.mjs';

const app = express();

const port = 3000;

app.use('/public', express.static('public'));
app.use(bodyParser.json());

app.get('/nodes', async (req, res) => {
    // still need to validate inputs etc
    let depth = req.query.depth;
    if(depth >= 0){
        res.status(200).send(await Node.returnAllDepth(0, depth));
    }
    else if(depth < 0) {
        res.status(200).send("Depth cannot be negative.");
    }
    else {
        console.log("success");
        res.status(200).send(await Node.returnAll(0));
    }
    // not for this: let id = req.params.id
});

app.get('/nodes/:id', async (req, res) => {
    // Replace with your code
    let id = req.params.id
    let depth = req.query.depth;
    console.log(depth);
    if(depth == undefined){
        depth = 0;
    }

    if(depth >= 0){
        let response = await Node.returnNode(id, depth);
        if(response == null) {
            res.status(404).send("node not found");
        }
        else {
            res.status(200).send(response);
        }
    }
    else {
        res.status(400).send("invalid input");
    }
});

app.post('/nodes', async (req, res) => {
    let body = req.body;
    console.log('body: ');
    console.log(body);
    let node = await Node.createNode(body);
    console.log('This shouldnt be null: ' + node);
    if(node == null) {
        res.status(400).send("invalid input");
    }
    else {
        res.status(200).send(node);
    }
});

app.put('/nodes/:id', async (req, res) => {
    // Replace with your code
    let id = req.params.id;
    let body = req.body;
    let node = await Node.updateNode(id, body);
    if(node == null) {
        res.status(400).send("Error with creating node");
    }
    else {
        res.location('/nodes/' + id);
        res.status(201).send(node);
    }
    // TODO: needs to return node with depth 0
});

app.get('/parents/:id', async (req, res) => {
    // maybe need to do array.reverse
    let id = req.params.id
    let response = await Node.getParents(id);
    if(id == 0) {
        res.status(200).send([]); // root node has no parents
    }
    else if(response == null) {
        res.status(400).send("node not found");
    }
    else{
        res.status(200).send(response);
    }
})

app.listen(port, () => {
    console.log('Running...');
})