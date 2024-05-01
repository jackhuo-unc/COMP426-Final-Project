render(document.getElementById('main'));

async function render(render_div) {
    let name = 'futsin1';

    let title = document.createElement('h1');
    title.setAttribute('id', 'title');
    title.appendChild(document.createTextNode('2b2t Stats'));

    let input = document.createElement('input');
    input.setAttribute('id', 'nameInput');
    input.setAttribute('value', 'Enter name: e.g. futsin1');
    input.appendChild(document.createTextNode('2b2t Stats'));

    let uuid = document.createElement('p');
    uuid.setAttribute('id', 'uuid');
    uuid.appendChild(document.createTextNode('afc1a580-6c24-4c25-96f4-726be08e1bb4'));

    let skin = document.createElement('div');
    skin.setAttribute('id', 'skin');
    let skinImg = document.createElement('img');
    skinImg.setAttribute('src', 'https://mineskin.eu/armor/bust/futsin1/300.png');
    skin.appendChild(skinImg);

    let firstDeath = document.createElement('p');
    firstDeath.setAttribute('id', 'joinDate');
    firstDeath.appendChild(document.createTextNode('First death: 2020-04-21 12:39:34'));

    let lastSeen = document.createElement('p');
    lastSeen.setAttribute('id', 'lastSeen');
    lastSeen.appendChild(document.createTextNode('Last seen: 2023-08-12 16:55:25'));

    let KD = document.createElement('p');
    KD.setAttribute('id', 'KD');
    KD.appendChild(document.createTextNode('Kills: 379 Deaths: 358'));

    let KDR = document.createElement('p');
    KDR.setAttribute('id', 'KDR');
    KDR.appendChild(document.createTextNode('KD ratio: 1.058659217877095'));

    render_div.appendChild(title);
    render_div.appendChild(input);
    render_div.appendChild(uuid);
    render_div.appendChild(skin);
    render_div.appendChild(firstDeath);
    render_div.appendChild(lastSeen);
    render_div.appendChild(KD);
    render_div.appendChild(KDR);

    function onEmpty(box) {
        if (box.value == '') {
            box.value = 'Enter name: e.g. futsin1';
        }   
    }

    function onFull(box) {
        if (box.value == 'Enter name: e.g. futsin1') {
            box.value = '';
        }   
    }


    input.addEventListener('keydown', (event) => {
        console.log('submitted');
        if(event.key != 'Enter') {
            return;
        }
        else {
            let name = input.value;
            getuuidSkin(name); // async
    
            getStats(name);
            getFirstDeath(name);
            getLastSeen(name);
    
        }
    });

    input.addEventListener('blur', () => {
        console.log('clicked off');
        onEmpty(input);
    });

    input.addEventListener('focus', () => {
        console.log('clicked on');
        onFull(input);
    });

    async function getuuidSkin(name){ // uses 3rd-party mojang api to get id from name
        console.log("about to fetch " + name);
        const response = await fetch('https://api.ashcon.app/mojang/v2/user/' + name, {
                                     method: 'GET'});
    
        let data = await response.json();
        console.log('success: ' + await data.username);

        let idSkin = {'uuid': data.uuid, 'skin': data.textures.skin.url}

        let id = idSkin.uuid;
        let skinUrl = idSkin.skin;
        uuid.replaceChildren(document.createTextNode(id));
        skinImg.setAttribute('src','https://mineskin.eu/armor/bust/' + name + '/300.png');
    }

    async function getStats(name){ // uses lolritterbot 2b2t api to get the first and last connections
        console.log("about to fetch " + name);

        // const response = await fetch('https://api.2b2t.dev/stats?username=' + name, {
        //     method: 'GET'});


            // https://api.themoviedb.org/3/search/movie?query=Two-Towers&api_key=3c86f49ada9b34f379ca5d429d95bd66
            const response = await fetch('https://api.themoviedb.org/3/search/movie?query=Two-Towers&api_key=3c86f49ada9b34f379ca5d429d95bd66' ,{
            method: 'GET'});
        let data = await response.json();
        console.log(data);
        if(data[0] == undefined) {
            KD.replaceChildren(document.createTextNode('Kills: 0      Deaths: 0'));
            KDR.replaceChildren(document.createTextNode('KD ratio: undefined'));
        }
        else {
            KD.replaceChildren(document.createTextNode('Kills: ' + data[0].kills + '    Deaths: ' + data[0].deaths));
            KDR.replaceChildren(document.createTextNode('KD ratio: ' + data[0].kills/data[0].deaths));
        }
        console.log("fetched " + data[0].username);

    }

    async function getFirstDeath(name){ // uses lolritter's 2b2t api to get player's first death
        const response = await fetch('https://api.2b2t.dev/stats?firstdeath=' + name, {
            method: 'GET'});
        let data = await response.json();
        if(data[0] == undefined) {
            firstDeath.replaceChildren(document.createTextNode(name + ' has never joined 2b2t'));
        }
        else {
            firstDeath.replaceChildren(document.createTextNode('First death: ' + data[0].date + ' ' + data[0].time));
        }
    }

    async function getLastSeen(name){ // uses lolritter's 2b2t api to get player's last death
        const response = await fetch('https://api.2b2t.dev/seen?username=' + name, {
            method: 'GET'});
        let data = await response.json();
        if(data[0] == undefined) {
            lastSeen.replaceChildren(document.createTextNode('Last seen: ' + name + ' has never joined 2b2t'));
        }
        else {
            lastSeen.replaceChildren(document.createTextNode('Last seen: ' + data[0].seen));
        }
    }

}
