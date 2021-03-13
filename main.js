let bootcampers = [];
const tableHTML = document.getElementById('table');
const loading = document.querySelector('.threedots');
const searchInput = document.getElementById("inputSearch");
let rows = [];
let currentRow = null;
let searchedType = 'lastName'
start()

async function start(){
    await fetchData();
    await completeData();
    stopLoading()
}

async function fetchData(){
    bootcampers = await (await fetch('https://apple-seeds.herokuapp.com/api/users/')).json();
}

async function completeData(){
    for(let x = 0; x<bootcampers.length; x++){
        let data = (await (await fetch(`https://apple-seeds.herokuapp.com/api/users/${bootcampers[x].id}`)).json());
        bootcampers[x] = {...bootcampers[x], ...data};
        createHTMLRow(bootcampers[x]);
    }
}

function createHTMLRow(camper){
    let row = document.createElement('tr');
    row.addEventListener('click', tableClick);
    row.dataset.id = camper.id;
    row.innerHTML = `
    <td> <input type="text" disabled data-type='id' value="${camper.id}"/> </td><td><input type="text" disabled data-type='firstName' value="${camper.firstName}"/></td>
    <td><input type="text" disabled data-type='lastName' value="${camper.lastName}"/></td><td><input type="text" disabled data-type='capsule' value="${camper.capsule}"/></td>
    <td><input type="text" disabled data-type='age' value="${camper.age}"/></td><td><input type="text" disabled data-type='city' value="${camper.city}"/></td>
    <td><input type="text" disabled data-type='gender' value="${camper.gender}"/></td><td><input type="text" disabled data-type='hobby' value="${camper.hobby}"/></td>
    <td><button class = "editButton" data-role = "edit">Edit</button><button class = "deleteButton" data-role = "delete">Delete</button></td>`;
    tableHTML.appendChild(row);
    rows.push(row);
}

function stopLoading(){
    loading.style = 'display: none';
    document.querySelectorAll('button').forEach(b => b.disabled = false);
    tableHTML.style = 'display: table;';
}

function updateView(){
    let copy = [...tableHTML.children]
    for(let x = 1; x<copy.length; x++){
        tableHTML.removeChild(copy[x])
    }
    for(let camper of bootcampers){
        createHTMLRow(camper);
    }
}

function tableClick(e){
    currentRow = e.currentTarget
    if(e.target.classList.contains('deleteButton')){
        if(e.target.dataset.role === 'delete')
            deleteRow(currentRow);
        else{
            updateBootcamper(currentRow, 'bootcampers');
            updateButtonStatus(e.target, 'edit')
            updateButtonStatus(e.target.previousSibling, 'delete');
            enableEditing(currentRow, false);
        }
    }
    else if(e.target.classList.contains('editButton')){
        if(e.target.dataset.role == 'edit'){
            enableEditing(currentRow, true);
            updateButtonStatus(e.target, 'cancel')
            updateButtonStatus(e.target.nextSibling, 'done')
        }
        else{
            updateBootcamper(currentRow, 'row');
            enableEditing(currentRow, false);
            updateButtonStatus(e.target, 'edit')
            updateButtonStatus(e.target.nextSibling, 'delete')
        }
    }
}

function updateButtonStatus(button,status){
    button.dataset.role = status;
    button.innerHTML = status;
}

function updateBootcamper(row, direction){
    const index = findBootcamperIndex(row.dataset.id);
    let children = row.children;
    for(let x = 0; x<children.length; x++){
        if(children[x].firstElementChild.hasAttribute('data-type'))
            if(direction === 'bootcampers')
                bootcampers[index][children[x].firstElementChild.dataset.type] = children[x].firstElementChild.value;
            else
                children[x].firstElementChild.value = bootcampers[index][children[x].firstElementChild.dataset.type];
    }
}

function sortItemsByType(type){
    bootcampers.sort((a,b) => a[type] - b[type]);
    updateView();
}

function enableEditing(row, status){
    for (item of row.children)
        if(item.firstElementChild.hasAttribute('data-type'))
            item.firstElementChild.disabled = !status;
}

function deleteRow(row){
    let index = findBootcamperIndex(row.dataset.id);
    row.remove();
    bootcampers.splice(index, 1);
}

function findBootcamperIndex(id){
    return bootcampers.findIndex(bc => bc.id == id);
}

searchInput.oninput =  () => {
    rows.forEach(row => {
        let correspondingObj = bootcampers[findBootcamperIndex(row.dataset.id)];
        if(!(correspondingObj[searchedType].toString().toLowerCase().includes(searchInput.value.toLowerCase())))
            row.style = 'display: none';
        else
            row.style = 'display: table-row';
    });
};

function radioChange(e){
    searchedType = e.value;
}