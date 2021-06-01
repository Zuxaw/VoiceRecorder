const project_base_url = `https://devweb.prinv.isen.fr/projet/`;
const project_id = `STKS`;

let exported_data = [];
let sort_order = `descending`;
let filters = [];

const readJSON = (url, loaddata_callback) => {
    let xmlhttp = new XMLHttpRequest();
    
    xmlhttp.onreadystatechange = function () {
        if (this.readyState === 4 && this.status === 200)
            loaddata_callback(JSON.parse(this.responseText));
    };
    
    xmlhttp.open(`POST`, url, true);
    xmlhttp.send();
};

const init = () => {
    readJSON(`${ project_base_url }common/records_dyn.php`, (data) => {
        exported_data = sortData(data, `descending`);
        
        // Dynamically create every option tag with the read data.
        loadOptions();
        
        // Display by default the ten latest records without filtering.
        displayDataDefault();
    });
};

const parseJsonDate = (jsonDate) => {
    let date = new Date();
    
    let interval = -2;
    date.setSeconds(jsonDate.slice(interval));
    interval -= 2;
    date.setMinutes(jsonDate.slice(interval, interval + 2));
    interval -= 2;
    date.setHours(jsonDate.slice(interval, interval + 2));
    interval -= 2;
    date.setDate(jsonDate.slice(interval, interval + 2));
    interval -= 2;
    date.setMonth(jsonDate.slice(interval, interval + 2) - 1); // month getters and setters count from 0...
    interval -= 4;
    date.setFullYear(jsonDate.slice(interval, interval + 4));
    
    return date;
};

const applyFilter = (data, filter, ...args) => {
    if (data === undefined) return;
    let new_data = [];
    
    switch (filter) {
    case `date`:
        // TODO: check from && to date formats given in args
        let from = new Date(args[2]);
        let to = new Date(args[3]);
    
        data.forEach(value => {
            let date = new Date(parseJsonDate(value.datetime.toString()));
            if (from.getTime() <= date.getTime() && date.getTime() <= to.getTime())
                new_data.push(value);
        });
        break;
    case `project`:
        // TODO: check typeof args[2]
        let project = args[2];
    
        data.forEach(value => {
            if (value.project === project)
                new_data.push(value);
        });
        break;
    case `age`:
        // TODO: check typeof args[2]
        let age = args[2];
    
        switch (age) {
        case 0:
            data.forEach(value => {
                if (value.age >= 8 && value.age <= 18)
                    new_data.push(value);
            });
            break;
        case 1:
            data.forEach(value => {
                if (value.age >= 18 && value.age <= 30)
                    new_data.push(value);
            });
            break;
        case 2:
            data.forEach(value => {
                if (value.age >= 30 && value.age <= 40)
                    new_data.push(value);
            });
            break;
        case 3:
            data.forEach(value => {
                if (value.age >= 40 && value.age <= 60)
                    new_data.push(value);
            });
            break;
        default:
            data.forEach(value => {
                if (60 <= value.age)
                    new_data.push(value);
            });
        }
        break;
    case `gender`:
        // TODO: check typeof args[2]
        let gender = args[2];
        
        data.forEach(value => {
            if (value.sexe === gender)
                new_data.push(value);
        });
        break;
    case `sentence`:
        // TODO: check typeof args[2]
        let id = args[2];
        
        data.forEach(value => {
            if (value.sentenceid === id)
                new_data.push(value);
        });
        break;
    }
    
    return new_data;
};

const sortData = (data, order) => {
    if (data === undefined) return;
    
    if (order === undefined || (order !== `descending` && order !== `ascending`))
        order = `descending`;
    
    data = Object.values(data).sort((a, b) => {
        if (order === `descending`)
            return b.datetime - a.datetime;
        else
            return a.datetime - b.datetime;
    });
    return data;
};

const loadOptions = () => {
    for (let i = 0; i < 2; ++i)
        filters[filters.length] = new Date();
    for (let i = 2; i < 6; ++i)
        filters[filters.length] = undefined;

    const project_select = document.getElementById(`project-select`);
    const sentence_select = document.getElementById(`sentence-select`);
    
    if (project_select !== undefined) {
        // Unique occurrence of each exported_data's project id
        let project_ids = [ ...new Set(exported_data.map(({ project }) =>  project)) ];
        
        project_ids.forEach(value => {
            if (value.length === 4 && value.match(`^[a-zA-Z0-9]{4}$`))
                project_select[project_select.options.length] = new Option(value, project_select.options.length, false, false);
        });
    }
    
    if (sentence_select !== undefined) {
        // Unique occurrence of each exported_data's sentence
        let sentences = [ ...new Set(exported_data.map(({ phrase }) => phrase)) ];
    
        sentences.forEach(value => {
            if (value.length > 3) {
                value = value.slice(1, -1);
                sentence_select[sentence_select.options.length] = new Option(value, sentence_select.options.length, false, false);
            }
        });
    }
};

const updateOptions = (filter, ...args) => {
    if (filter === undefined || args === undefined) return;

    switch (filter) {
    case `date`:
        if (args.length < 2)
            return;

        // TODO: check the typeof args[1] and args[2]
        filters[0] = args[1]; // Date from
        filters[1] = args[2]; // Date to
        break;
    case `project`:
        // TODO: check the typeof args[1]
        filters[2] = args[1];
        break;
    case `age`:
        // TODO: check the typeof args[1]
        filters[3] = args[1];
        break;
    case `gender`:
        // TODO: check the typeof args[1]
        filters[4] = args[1];
        break;
    case `sentence`:
        // TODO: check the typeof args[1]
        filters[5] = args[1];
        break;
    }

    // Update the data to display.
    filterData();
};

const buildData = () => {
    const container = document.getElementById(`data-container`);
    
    blob = new Blob(chunks, {
        type: media.type
    });
    let url = URL.createObjectURL(blob),
        li = document.createElement(`li`),
        mt = document.createElement(media.tag),
        hf = document.createElement(`a`);
    mt.controls = true;
    mt.src = url;
    hf.href = url;
    
    li.appendChild(mt);
    container.appendChild(li);
};

const displayDataDefault = () => {
    const container = document.getElementById(`data-container`);
    
    let data = exported_data;
    data = data.slice(0, 10);
    
    let div = document.createElement(`div`);
    data.forEach(value => {
        /*div = `<div class="data">
           <a>${ moment(new Date(parseJsonDate(value.datetime.toString()))).format(`DD-MM-YYYY`) }</a>
           <a>${ moment(new Date(parseJsonDate(value.datetime.toString()))).format(`HH:mm:ss`) }</a>
           <a>${ value.sentence }</a>
           <a>${ value.project }</a>
           <a>${ value.sexe }</a>
           <div>
           
           </div>
        <div/>`;*/
        
        div.appendChild(document.createTextNode(`${ moment(new Date(parseJsonDate(value.datetime.toString()))).format(`DD-MM-YYYY`) }`));
        div.appendChild(document.createTextNode(`${ moment(new Date(parseJsonDate(value.datetime.toString()))).format(`HH:mm:ss`) }`));
        div.appendChild(document.createTextNode(`${ value.sentence }`));
        div.appendChild(document.createTextNode(`${ value.project }`));
        div.appendChild(document.createTextNode(`${ value.sexe }`));
    
        container.appendChild(div);
    });
};

const filterData = () => {
    let filtered_data = exported_data;

    if (filters[0] !== undefined && filters[1] !== undefined)
        filtered_data = applyFilter(filtered_data, `date`, filters[0], filters[1]);

    for (let i = 2; i < 6; ++i) {
        if (filters[i] === undefined) continue;

        let filter;
        switch (i) {
        case 2:
            filter = `project`;
            break;
        case 3:
            filter = `age`;
            break;
        case 4:
            filter = `gender`;
            break;
        case 5:
            filter = `sentence`;
            break;
        }
        filtered_data = applyFilter(filtered_data, filter, filters[i]);
    }

    return filtered_data;
};
