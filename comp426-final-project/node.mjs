import {db} from './db.mjs';
export class Node {

    #id
    #headline
    #note
    #parent_id
    #children_ids

    constructor (id, headline, note, parent_id, children_ids) {
        this.#id = id;
        this.#headline = headline;
        this.#note = note;
        this.#parent_id = parent_id;
        this.#children_ids = children_ids;
    }

    static async createNode(data) { // need to do a lot of more stuff, vetting input. maybe think about what index root will have generally
        // make sure the children and parent are optional.
        // if stuff is invalid, return null.
        if ((data !== undefined) && (data instanceof Object) 
        && (data.headline !== undefined) 
        && (typeof data.note == 'string')) 
        {
            console.log('createNode input is of correct form');
            let children_ids = data.children_ids;
            if(children_ids == undefined) {
                children_ids = [];
            }
            let parent_id = data.parent_id;
            if(parent_id == undefined) {
                parent_id = 0;
            }

            try {
                console.log('parent_id we want to add: ');
                console.log(parent_id);
                console.log('output of our sql statement:');
                let nodes_raw = (await db.all('select id from nodes where id = ?', parent_id)).map(s => s.id);
                console.log(nodes_raw);
                if(nodes_raw.length == 0) {
                    return null;
                }

                for (const child of children_ids) {
                    if(child == 0) { // we just tried to add the root as a child
                        return null;
                    }
                  }
                // }
                // let nodes = nodes_raw.map(r => r.id);
                // console.log(nodes);
                // console.log(nodes.find(data.parent_id));
                // if(nodes.find(data.parent_id) == undefined){
                //     return null; // we just tried to add a vertex to a vertex that doesn't exist
                // }

                let db_result = await db.run('insert into nodes values (NULL, ?, ?)', data.headline, data.note);
                let child_id = db_result.lastID;

                db_result = await db.run('insert into edges values (?, ?)', parent_id, child_id); // gotta prevent parent from not being in the thing
                let node = {'id': child_id, 'headline': data.headline, 'note': data.note, 'parent_id': parent_id, 'children_ids': children_ids};

                for (const child of children_ids) {
                    db_result = await db.run('insert into edges values (?, ?)', child_id, child);
                  }
                console.log('returning: ');
                console.log(node);
                return node;
            } catch (e) {
                console.log(e);
                return null;
            }
        }
        return null;
    }

    // grab all nodes
    // everytime just make a list of lists of nodes. [[{root node}],[{node},{node}],[{node},{node},{node}]]
    // do bfs on each node of the previous list. for each child, check to see if it's in the big list
    // once we have found the total number of nodes, we are done.
    // then do the processing at the end because we only want to write this once.

    // required functions:
    // return all
    // return all up to certain depth
    // 
    // return starting at node
    // return starting at node up to a certain depth
    // 
    // create new node
    // 
    // update node
    //
    // find list of parents for a node
    // need to first do bfs to get relative depths
    // then find all the node ids that have given node as a child
    // sort these ids by depth from the root

    static async BFS(id){
        let nodes_raw = await db.all('select * from nodes');
        let edges_raw = await db.all('select * from edges');
        let nodes = nodes_raw.map(r => r.id);
        let edges = edges_raw.map(r => ({'parent': r.parent_id, 'child': r.child_id}));

        let set = [[]];

        set[0] = [];
        set[0].push(id);


        for (let depth = 0; depth < nodes.length; depth++) { // depth layer
            let condition = false;
            for (const node_id of set[depth]) { // going through each node that was just visited
                for (const edge of edges) {     // checking to see if we have a matching edge
                    if(edge.parent == node_id 
                        && this.checkSet(set, edge.child) == -1){ // this is an unvisited child node.
                        console.log('We have reached an unvisited child_node: ' + edge.child);
                        if(set[depth+1] == undefined) {
                            set[depth+1] = [edge.child];
                        }
                        else {
                            set[depth+1].push(edge.child);
                        }
                        condition = true;
                    }
                    //else don't do anything
                }
            }
            if(!condition) {
                depth = nodes.length;
            }
        }
        console.log(set);
        console.log(set[0][0]);
        return {'set':set,'nodes_raw':nodes_raw, 'edges_raw':edges_raw};
    }

    static async returnAll(startNode){ // only returns an array of integers
        let BFSoutput = await this.BFS(startNode);
        let set = BFSoutput.set;
        let returnArray = [];

        for (let depth = 0; depth < set.length; depth++) {
            set[depth].forEach(id => {
                //console.log(id);
                returnArray.push(id);  
            });
        }
        console.log('this is the returned array:');
        console.log(returnArray);
        return returnArray;
    }

    static async returnAllDepth(startNode, untilDepth){ // returns an array of integers up until the depth given
        let BFSoutput = await this.BFS(startNode);
        let set = BFSoutput.set;
        let returnArray = [];
        
        for (let depth = 0; depth <= untilDepth; depth++) {
            if(depth >= set.length) {
                console.log('depth entered was too high');
                return returnArray;
            }
            for (let index = 0; index < set[depth].length; index++) {
                returnArray.push(set[depth][index]);
            }
        }
        return returnArray;
    }

    static async returnNode(startNode, depth, nodes_raw, edges_raw){ // retrieves a node. also returns its children as nodes another depth layers
        // gotta use recursion here. might not need BFS
        // instead grab all nodes and all edges
        // then starting with start node:
        // return {'id': id, 'headline': headline, 'note': note, 'children' : [returnNode(startNode, depth-1)]};
        // or return {'id': id, 'headline': headline, 'note': note, 'children_ids' : [child_id]
        // keep in mind, must be sorted
    
        if(nodes_raw == undefined || edges_raw == undefined) {
            nodes_raw = await db.all('select * from nodes');
            edges_raw = await db.all('select * from edges');
        }
        
        let targetNode = nodes_raw.find((node) => node.id == startNode);
        if(targetNode == undefined) {
            return null;
        }
        // try looking into this
        console.log('start node: ');
        console.log(startNode);

        let children = [];
        children = edges_raw.filter((edge) => edge.parent_id == startNode) // list of children ids
                                .map((edge) => edge.child_id);
        console.log('target node and children');
        console.log(targetNode);
        if(children.length == 0 && depth != 0){
            children = [];
            return {"id":startNode, "headline" : targetNode.headline
            , "note": targetNode.note, "children" : children}
        };
        if(depth == 0) {
            console.log(targetNode.id);
            return {"id":targetNode.id, "headline" : targetNode.headline
            , "note": targetNode.note, "children_ids" : children};
        }

        // children = children.map((id) => await this.returnNode(id, depth-1, nodes_raw, edges_raw));
        
        for (let index = 0; index < children.length; index++) {
            children[index] = await this.returnNode(children[index], depth-1, nodes_raw, edges_raw);
        }

        console.log('children after recursion: ');
        console.log(children);
        return {"id":targetNode.id, "headline" : targetNode.headline
        , "note": targetNode.note, "children" : children};
    }

    // static async returnNode(startNode, depth, nodes_raw, edges_raw){ // retrieves a node. also returns its children as nodes another depth layers
    //     // gotta use recursion here. might not need BFS
    //     // instead grab all nodes and all edges
    //     // then starting with start node:
    //     // return {'id': id, 'headline': headline, 'note': note, 'children' : [returnNode(startNode, depth-1)]};
    //     // or return {'id': id, 'headline': headline, 'note': note, 'children_ids' : [child_id]
    //     // keep in mind, must be sorted

    //     if(nodes_raw == undefined || edges_raw == undefined) {
    //         nodes_raw = await db.all('select * from nodes');
    //         edges_raw = await db.all('select * from edges');
    //     }

    //     let targetNode = nodes_raw.find((node) => node.id == startNode);
    //     let children = edges_raw.filter((edge) => edge.parent_id == startNode) // list of children ids
    //                             .map((edge) => edge.child_id);
    //     console.log('target node and children');
    //     console.log(targetNode);
    //     console.log(children);
    //     if(depth == 0) {
    //         return {"id":targetNode.id, "headline" : targetNode.headline
    //         , "note": targetNode.note, "children_ids" : children};
    //     }

    //     // children = children.map((id) => await this.returnNode(id, depth-1, nodes_raw, edges_raw));

    //     for (let index = 0; index < children.length; index++) {
    //         children[index] = await this.returnNode(children[index], depth-1, nodes_raw, edges_raw);
    //     }

    //     console.log('children after recursion: ');
    //     console.log(children);
    //     return {"id":targetNode.id, "headline" : targetNode.headline
    //     , "note": targetNode.note, "children" : children};
    // }

    static async updateNode(id, data) { // need to do a lot of more stuff, vetting input. maybe think about what index root will have generally
        console.log('made only here');
        console.log(id);
        console.log(data);

        if ((data !== undefined) && (data instanceof Object) 
        && (data.headline !== undefined) 
        && (typeof data.note == 'string')) {
        let returnedObject = {};
            try {
                console.log('made it here');
                let originalNodes = await this.returnAll(0);
                
                let db_result = await db.run('update nodes set headline = ?, note = ? where id = ?', data.headline, data.note, id);
                returnedObject['id'] = id;
                returnedObject['headline'] = data.headline;
                returnedObject['note'] = data.note;
                returnedObject['children_ids'] = [];

                db_result = await db.run('delete from edges where parent_id = ?', id);
                console.log(db_result);
                
                for (const child of data.children_ids) {
                    console.log("we are trying to do something ILLEGAL");
                    if(child == 0) { // we just tried to add the root as a child
                        return null;
                    }
                    db_result = await db.run('insert into edges values (?, ?)', id, child);
                    returnedObject['children_ids'].push(child);
                }
            
                let BFSoutput = await this.BFS(0);
                let rankedSet = BFSoutput.set;
                for (let index = 0; index < originalNodes.length; index++) {
                    if(this.checkSet(rankedSet, originalNodes[index]) == -1) {
                        console.log('WE ARE DELETING');
                       let db1 = await db.run('delete from nodes where id = ?', originalNodes[index]);
                        db1 = await db.run('delete from edges where parent_id = ?', originalNodes[index]);
                        db1 = await db.run('delete from edges where child_id = ?', originalNodes[index]);
                        console.log('deleted a child: ' + originalNodes[index]);
                    }                    
                }

                return returnedObject;
            } catch (e) {
                console.log(e);
                return null;
            }
        }
        else {
            console.log('something failed')
            return null;
        }
    }

// find all edges where our node is a child
// add all parents to an array
// then sort them using bfs
    static async getParents(id){ // not correct, must bfs in reverse to find all parents. and then bfs forwards to rank them
        let nodes_raw = await db.all('select * from nodes');
        let edges_raw = await db.all('select * from edges');
        
        if(id == 0){
            return 0;
        }
        
        let parentNodes = [];
        parentNodes = edges_raw.filter((edge) => edge.child_id == id)
                                .map((edge) => edge.parent_id);
        if(id < 0 || parentNodes.length == 0) {
            return null;
        }
        parentNodes = parentNodes.filter((node, index) => parentNodes.indexOf(node) == index);
        
        console.log('the parent nodes are: ');
        console.log(parentNodes); // this part is correct
        
        let BFSoutput = await this.BFS(0);
        let rankedSet = BFSoutput.set;
        let returnSet = [];
        console.log('bfs returned:');
        console.log(rankedSet);
        for(let i = 0; i < rankedSet.length; i++){
            for(let j = 0; j < rankedSet[i].length; j++){
                if(parentNodes.indexOf(rankedSet[i][j]) != -1){
                    returnSet.push(rankedSet[i][j]);
                }
            }
        }
        console.log('return set array');
        console.log(returnSet);
        // parentNodes is all of the stuff we have.  now we gotta find the depth for each
        // run bfs on root. 
        // then for each thing in parentNodes, we sort by the bfs depth

        return returnSet;
    }

    static checkSet(set, node){ // helper function for BFS. checks if the set of the form [[id]] contains an id given by node
        for (let depth = 0; depth < set.length; depth++) {
            for(let index = 0; index < set[depth].length; index++){
                // console.log('id, node, depth:');
                // console.log(set[depth][index]);
                // console.log(node);
                // console.log(depth);
                if(node == set[depth][index]) {
                    // console.log('match found: ' + node + ' = ' + set[depth][index]);
                    return depth;
                }
            }
        }
        return -1;
    }

}



// static async ReverseBFS(id){ // probably unnecessary
    //     let nodes_raw = await db.all('select * from nodes');
    //     let edges_raw = await db.all('select * from edges');
    //     let nodes = nodes_raw.map(r => r.id);
    //     let edges = edges_raw.map(r => ({'parent': r.parent_id, 'child': r.child_id}));


    //     let set = [[]];
    //     set[0].push(id);

    //     simpleSet = [];

    //     let condition = true;

    //     for (let depth = 0; depth < nodes.length; depth++) {
    //         for (const node_id of set[depth]) {
    //             for (const edge of edges) {
    //                 if(edge.child == node_id 
    //                     && this.checkSet(set, edge.parent) == -1 // this is an unvisited parent node.
    //                     && condition == true) 
    //                     set[depth+1].push(edge.child);
    //                     simpleSet.push(edge.child);
    //                     if(edge.parent == 0) { // if the parent is the root, we are done here. potentially need to change this, incase other things not explored
    //                         condition == false;
    //                     }
    //             }
    //         }
    //         if(!condition) {
    //             depth = node_ids.length;
    //         }
    //     }

    //     let rankedSet = await BFS(0);
    //     let returnSet = [];
    //     for(let i = 0; i < rankedSet.length; i++){
    //         for(let j = 0; j < rankedSet[i].length; j++){
    //             if(simpleSet.indexOf(rankedSet[i][j]) != -1){
    //                 returnSet.add(rankedSet[i][j])
    //             }
    //         }
    //     }
    //     // set is all of the stuff we have.  now we gotta find the depth for each
    //     // run bfs on root. 
    //     // then for each thing in set, we sort by the bfs depth

    //     return returnSet;
    // }