export const initPosts = () => {
    document.getElementById('send-btn').addEventListener('click', () => SendPost());

    displayPosts();
    displayPostDetails();
}

const SendPost = async () => {
    const idEl = document.getElementById('new-post-id').value;
    const titleEl = document.getElementById('new-post-title').value;
    const bodyEl = document.getElementById('new-post-body').value;
    const post = {
        title: titleEl.value,
        body: bodyEl.value,
        userId: 10,
        //...(idEl.value && {id: idEl.value}) // ha van az idElementnek value értéke, akkor összeÉSelem egy új objekttel
                                            // és ennek az új objektnek legyen egy id mezője aminek az értéke az idEl.value
                                            // és ezt belespreadelem a már létező objektumba
    };

    if(idEl.value) {    // ha létezik az idEl-nek valueja, hozzáfűz egy új mezőt az objektumhoz
        post.id = idEl.value;
    }

    const newPost = await CreateorUpdatePost(post);

    idEl.value = '';
    titleEl.value = '';
    bodyEl.value = '';

    displayPost(newPost);
}

const CreateorUpdatePost = async (post) => {    // http kérés a poszt létrehozására
    const url = post.id !== undefined
    ? `https://jsonplaceholder.typicode.com/posts/${post.id}` 
    : `https://jsonplaceholder.typicode.com/posts`


    const response = await fetch(url, {
        method: post.id !== undefined ? 'PATCH' : 'POST',   // patch csak egy mezőt frissít, put az egész objektumot
        body: JSON.stringify({post}),
        headers: {
            'Content-type': 'application/json; charset: utf8'
        }
    });
    return await response.json();   // ez is Promiset ad vissza
}

const displayPost = (post) => {
    if (post) {
        const idElement = document.getElementById('post-id');
        const titleElement = document.getElementById('post-title');
        const bodyElement = document.getElementById('post-body');

        idElement.innerHTML = post.id;
        titleElement.innerHTML = post.title;
        bodyElement.innerHTML = post.body;
    }
}

const displayPosts = async () => {
    const postsListElement = document.getElementById('displayed-posts');
    postsListElement.innerHTML = '';

    const posts = await getTopPostTitles();

    posts.forEach(post => {
        postsListElement.innerHTML += `
        <div>
            <span>${post.title}</span>
            <button id="delete-${post.id}">Delete</button>  
        </div>`      
        // minden Delete gombnak lesz egy egyedi id-ja  
    })

    posts.forEach(post => {
        document.getElementById(`delete-${post.id}`).addEventListener('click', async event => {
            const parentElement = event.target.parentElement; // kikeresem a szülő elemet (a spanos div)és kitörlöm a DOM fából
            
            await deletePost(post.id);  // kell egy delete is h csak akkor töröljük ki ha sikerült kitörölni az APIn a postot
            parentElement.remove();
        })
    })
}

const displayPostDetails = async () => {
    const postDetailsElement = document.getElementById('detailed-posts');
    postDetailsElement.innerHTML = '';

    const posts = await Promise.all([
        getPostById(1),
        getPostById(2),
        getPostById(3),
        getPostById(4),
        getPostById(5)
    ])
    // egyesével lekérve az 5 post adatot bevárják egymást és csak akkor indul el a következő ha az előző végzett
    // ezért kell a Promise.all

    posts.forEach(post => {
        postDetailsElement.innerHTML += `
            <p>${post.title} - ${post.body} (${post.id})</p>
        `
    })
}

const getTopPostTitles = async () => {
    const response = await fetch(`https://jsonplaceholder.typicode.com/posts`); // get kérés, így nem kell method stb.
    const posts = await response.json();

    return posts.filter(post => post.id <= 10); // id 1-től számozódik 10ig, filter egy tömböt ad vissza
    // le lehetne mapelni hogy csak a title mezőt írja ki de ez a törlésnél nem lenne jó
}

const deletePost = async (id) => {
    const response = await fetch(`https://jsonplaceholder.typicode.com/posts/${id}`, 
    {method: 'DELETE'});

    return await response.json();
}

const getPostById = async (id) => {
    const response = await fetch(`https://jsonplaceholder.typicode.com/posts/${id}`);
    
    return await response.json();
}

const myFetch = (url, method = 'GET') => {
    const request = new XMLHttpRequest();
    
    return new Promise((resolve, reject) => {
        request.addEventListener('load', load => {
            resolve({status: request.status, response: request.response})
        });
    
        request.addEventListener('error', e => reject(e));
    
        request.open(method, url);
        request.send();
    })
}

myFetch(`https://jsonplaceholder.typicode.com/posts/1`)
.then(({status, response}) => console.log(`Status: ${status}`, JSON.parse(response)));