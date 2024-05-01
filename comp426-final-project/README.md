# A05 - A Workflowy Back End

Use the command *npm install* in the terminal at the top-level of this repository to install express and other necessary modules. If you want to use a database, a sqlite3 database is set up by importing the symbol *db* from db.mjs. Put any database setup (i.e., table creation, etc.) in setup_db.mjs and then run *node setup_db.mjs* to execute. The database will store data in the file *db.sqlite*.
To reset, simply remove that file and rerun the setup code.

I recommend using the sqlite-async module which is Promise-based and therefore capatible with async/await. Otherwise, you can store data in top-level module variables. This assignment is set up to use ES6 modules.

Start your backend with the command *node app.mjs* in the terminal or to debug select app.js in the folder explorer and then use the "Run and Debug" panel. Leave the port number at 3000.

Implement the following RESTful API to workflowy node information. Workflowy is the list tool that I use for my COMP 426 lecture notes. It has a very simple node model. Each node is comprised of a *headline*, a *note*, and an ordered list of children nodes. This is not a strict tree and a specific node may be a child of more than one other node, appear as a child more than once for a given node. Cycles are possible. Your backend should start having already created an initial root node with no children. The root node's initial headline and note can be anything or even empty strings. 

In the API documentation below, at times the *depth* of a node is referenced. Because this is not a strict tree (it's really a directed graph), there is no well-defined inherent *depth* property of any node. Instead, interpret the depth of a node to be the shortest distance path from the special root node to the node.  

Note, the API below does not have an endpoint for deleting a node. Instead a node should be deleted if at any point it becomes unreachable from the root node. In other words, if a node is ever not a child of any other node or is part of a cycle that can not be reached from the root node, then it should be deleted. Obviously, this does NOT apply to the root node which should always be the only node stored that is not a child of any other node and can not be a child of any other node.

### Retrieve index array of node ids

    GET /nodes
    GET /nodes?depth={d}

In the first form, returns a JSON array of all node ids. The array must start with the root node's id and the remaining nodes should be ordered by their depth (i.e., shortest distance from the root). HINT: do a breadth-first traversal from the root node, collecting nodes into an array as you go. If you encounter a node that is already in the array, do not process that node any further. 

In the second form, the returned JSON array contains only nodes that are within {d} depth from the root. If {d} is 0, should return an array with just the root node id.

### Retrieve node by id

    GET /nodes/{id}
    GET /nodes/{id}?depth={d}

On success, a JSON object for the node with id equal to {id}. Generates 404 response if no node with that id available. Generates 400 response if id is non-numeric or negative; or if {d} is non-numeric or negative.

In the first form, the returned JSON representation of the node only include fields *id*, *headline*, *note*, and *children_ids* providing an ordered list of the node ids of the children of the node. 

When the depth parameter is present and greater than 0, the JSON representation of the node does NOT contain the field *children_ids*, but instead contains the field *children* which is an ordered array of JSON objects for each child node. Each of those nodes should be represented as if they were retrieved using a depth of {d}-1. 

When the depth parameter is present and equal to 0, the JSON representation of the node is the same as in the first form where the depth parameter is not present.

Example return without depth parameter:

    {
        "id": 4,
        "headline": "Node headline",
        "note": "",
        "children_ids": [12, 34]
    }

Example return with depth parameter set to 1:

    {
        "id": 4,
        "headline": "Node headline",
        "note": "",

        "children": [
            {
                "id": 12,
                "headline": "Node headline",
                "note": "",
                "children_ids": []
            },
            {
                "id": 34,
                "headline": "Node headline",
                "note": "",
                "children_ids": [43, 923]
            }
        ]
    }

### Create recipe

    POST /nodes

Creates a new node using the data provided as a JSON object in the request body. If successful, generates a 201 (Created) response and returns the JSON representation of the node rendered with 0 depth. The Location header should contain the URL of the new resource suitable for GET.

The request data should be a JSON object with at least a *headline* and *note* fields. 

Optionally a *children_ids* field can be included with an array of children node ids. If not provided, creates a node with no children. 

Optionally a *parent_id* field identifies the new node's initial parent. If not provided, defaults to the id of the root node. The new node should added to the end of the specified parent node's children.

Returns 400 if any data is invalid. Headline and note should be strings, possibly empty. Children nodes ids must correspond to existing nodes with those ids. Also, the root node should not be allowed as a child. Attempting to do so should generate a 400 response. The parent id should correspond to an existing node.

Example request data to create a new node:

    {
        "headline": "A new node headline",
        "note": "",
        "children_ids": [923, 4, 12]
        "parent_id": 43
    }


### Update node

    PUT /nodes/{id}

On success, returns JSON representation of updated node rendered at depth 0. Request body is expected to be in the same form as provided to the POST described above (except for parent_id) providing potentially new values for *headline*, *note*, and *children_ids*. 

### Retrieve a list of parents for a node

    GET /parents/{id}

On success, returns a JSON array of node ids that include the node specified by {id} as a child. If a node includes the target node as a child more than once, it should only appear in this list once. The list should be ordered by the depth of the nodes from the root.