const project_base_url = `https://devweb.prinv.isen.fr/projet/`;
const project_id = `STKS`;

let exported_data = [];

let gender_chart;
let age_chart;
let date_chart;
let sentences_chart;

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
        // TODO: create a filter button if needed
        data.forEach(value => exported_data.push(value));
        
        renderGenderChart();
        renderAgeChart();
        renderDateChart();
        renderSentencesChart();
    });
}

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

const render = (ctx, config) => {
    return new Chart(ctx, config);
}

const renderGenderChart = () => {
    const ctx = document.getElementById(`gender_chart`).getContext(`2d`);
    
    // Occurrences of records based on every exported data's gender property.
    let gender_data = [0, 0, 0];
    exported_data.forEach(v => {
        if (v.sexe === undefined) return;
        switch (v.sexe) {
        case `M`:
            ++gender_data[0];
            break;
        case `F`:
            ++gender_data[1];
            break;
        case `Non défini`:
            ++gender_data[2];
            break;
        }
    });
    
    const data = {
        labels: [`Hommes`, `Femmes`, `Non défini`],
        datasets: [{
            label: `Nombre d'enregistrements`,
            data: gender_data,
            backgroundColor: [
                `rgba(54, 162, 235, 1)`,
                `rgba(255, 99, 132, 1)`,
                `rgba(255, 206, 86, 1)`
            ],
            hoverBorderWidth: 0,
            hoverOffset: 15
        }]
    };
    
    const config = {
        type: `doughnut`,
        data,
        options: {
            cutout: `85%`,
            radius: `80%`,
            plugins: {
                title: {
                    display: true,
                    text: `Nombre d'enregistrements par sexe`
                }
            }
        }
    };
    
    gender_chart = render(ctx, config);
}

const renderAgeChart = () => {
    const ctx = document.getElementById(`age_chart`).getContext(`2d`);
    
    // Occurrences of records based on every exported data's age property.
    let age_data = [0, 0, 0, 0, 0];
    exported_data.forEach(v => {
        if (v.age === undefined) return;
        
        const age = v.age;
        if (age >= 8 && age <= 18)
            ++age_data[0];
        else if (age <= 18 && age <= 30)
            ++age_data[1];
        else if (age <= 30 && age <= 40)
            ++age_data[2];
        else if (age <= 40 && age <= 60)
            ++age_data[3];
        else
            ++age_data[4];
    });
    
    // The labels specify our age intervals according to the previous occurrence computations.
    const data = {
        labels: [`8-18 ans`, `18-30 ans`, `30-40 ans`, `40-60 ans`, `60-80+ ans`],
        datasets: [{
            label: `Nombre d'enregistrements`,
            data: age_data,
            backgroundColor: [
                `rgba(255, 99, 132, 0.5)`,
                `rgba(54, 162, 235, 0.5)`,
                `rgba(255, 206, 86, 0.5)`,
                `rgba(75, 192, 192, 0.5)`,
                `rgba(153, 102, 255, 0.5)`
            ],
            borderColor: [
                `rgba(255, 99, 132, 1)`,
                `rgba(54, 162, 235, 1)`,
                `rgba(255, 206, 86, 1)`,
                `rgba(75, 192, 192, 1)`,
                `rgba(153, 102, 255, 1)`
            ],
            borderWidth: 1
        }]
    };
    
    const config = {
        type: `bar`,
        data,
        options: {
            plugins: {
                legend: {
                    display: false
                },
                title: {
                    display: true,
                    text: `Nombre d'enregistrements par catégorie d'âge`
                }
            }
        }
    };
    
    age_chart = render(ctx, config);
}

const renderDateChart = () => {
    const ctx = document.getElementById(`date_chart`).getContext(`2d`);
    
    // Default render, based on month names.
    labels = [
        `Janvier`,
        `Février`,
        `Mars`,
        `Avril`,
        `Mai`,
        `Juin`,
        `Juillet`,
        `Août`,
        `Septembre`,
        `Octobre`,
        `Novembre`,
        `Décembre`
    ];
    
    // Occurrences of records per month for 2021, based on every exported data's datetime property.
    let date_data = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    exported_data.forEach(v => {
        if (v.datetime === undefined) return;
        let date = new Date(parseJsonDate(v.datetime.toString()));
        ++date_data[date.getMonth()];
    });
    
    const data = {
        labels: labels,
        datasets: [{
            label: `Nombre d'enregistrements`,
            data: date_data,
            backgroundColor: [
                `rgba(255, 255, 255, 1)`
            ],
            borderColor: [
                `rgba(54, 162, 235, 1)`
            ],
            borderWidth: 1
        }]
    };
    
    const config = {
        type: `line`,
        data,
        options: {
            plugins: {
                legend: {
                    display: false
                },
                title: {
                    display: true,
                    text: `Nombre d'enregistrements entre deux dates`
                }
            }
        }
    };
    
    date_chart = render(ctx, config);
    // Default values in order to avoid undefined dates in case the chart is updated.
    date_chart.from = new Date(`2021-01-01`);
    date_chart.to = new Date(`2021-12-31`);
}

const updateDateChart = (chart, from, to) => {
    if (from === undefined) {
        from = chart.from;
    } else {
        from = new Date(from.toString());
        from.setHours(0);
        chart.from = from;
    }
    
    if (to === undefined) {
        to = chart.to;
    } else {
        to = new Date(to.toString());
        to.setHours(23, 59, 59);
        chart.to = to;
    }
    
    if (from > to) return;
    
    let diff = Math.abs(to.getTime() - from.getTime()); // in milliseconds
    
    let diff_hours = Math.ceil(diff / (1000 * 60 * 60));
    let diff_days = Math.floor( diff / (1000 * 60 * 60 * 24));
    
    let using_hours = diff_days === 0;
    
    /*
     * Pushes labels according to the difference of days between the two dates.
     * If from and to are equal, we have to display hours.
     */
    let labels = [];
    if (using_hours)
        for (let i = 0; i < diff_hours - 1; i += 2)
            labels.push(moment(new Date(from)).add(i, `hours`).format(`HH:mm:ss`));
    else if (diff_days <= 31)
        for (let i = 0; i < diff_days; (diff_days < 15) ? ++i : i += 2)
            labels.push(moment(new Date(from)).add(i, `days`).format(`YYYY-MM-DD`));
    else if (diff_days <= 365)
        for (let i = 0; i < Math.floor(diff_days / 31); ++i)
            labels.push(moment(new Date(from)).add(i, `months`).format(`YYYY-MM-DD`));
    else
        for (let i = 0; i < Math.floor(diff_days / 365); ++i)
            labels.push(moment(new Date(from)).add(i, `years`).format(`YYYY-MM-DD`));
    
    // The last label is the second one given by the user.
    labels.push(moment(new Date(to)).format((using_hours) ? `HH:mm:ss` : `YYYY-MM-DD`));
    
    // Occurrences of records per interval based on labels.
    let date_data = [];
    labels.forEach(() => { date_data.push(0) });
    
    exported_data.forEach(value => {
        if (value.datetime === undefined) return;
        let date = new Date(parseJsonDate(value.datetime.toString()));
        // If the date isn't between from and to, do not count it.
        if (date < from || to < date) return;
        
        // For each interval (between two label dates):
        for (let i = 0; i < labels.length; ++i) {
            let d1 = new Date((using_hours) ? moment(labels[i], `HH:mm:ss`, true) : moment(labels[i]));
            let d2 = new Date((using_hours) ? moment(labels[i + 1], `HH:mm:ss`, true) : moment(labels[i + 1]));
    
            /*
             * If the tested date is in the interval, increment the count.
             * If we are using hours, we have to compare the dates' hours.
             */
            if (using_hours && d1.getHours() <= date.getHours() && date.getHours() <= d2.getHours()) {
                ++date_data[i];
                break;
            }
            if (d1.valueOf() <= date.valueOf() && date.valueOf() <= d2.valueOf()) {
                ++date_data[i];
                break;
            }
        }
    });
    
    chart.data.labels = labels;
    chart.data.datasets.forEach(dataset => { dataset.data = date_data; });
    chart.update();
}

const renderSentencesChart = () => {
    const ctx = document.getElementById(`sentences_chart`).getContext(`2d`);
    
    let sentences_data = exported_data.map(({ phraseid, phrase }) => ({ phraseid, phrase }));
    /*
     * Get occurrences of each sentence based on each exported data's sentence id.
     * For that, a new property called "count" is inserted into every "sentence_data"'s object.
     */
    let occurrences = sentences_data.reduce((mapping, item) => {
        const { [item.phraseid]:matching_item } = mapping;
        /*
         * If the matching item is found, increment the count.
         * Otherwise, insert the item into mapping, and also include a starting count of one for it.
         */
        (matching_item) ? ++matching_item.count : mapping[item.phraseid] = { ...item, count: 1 };
        return mapping;
    }, {});
    
    // Sort the occurrences count by descending order.
    occurrences = Object.values(occurrences).sort((a, b) => b.count - a.count );
    // Keep the ten greatest numbers of occurrences.
    occurrences = { ...occurrences.slice(0, 10) };
    
    const data = {
        labels: Array.from(Object.values(occurrences).map(data => data.phrase)), // only insert sentences
        datasets: [{
            label: `Nombre d'enregistrements`,
            data: Array.from(Object.values(occurrences).map(data => data.count)), // only insert occurrences
            backgroundColor: [
                `rgb(54, 114, 235, 0.25)`,
                'rgba(77, 201, 246, 0.25)',
                'rgba(246, 113, 26, 0.25)',
                'rgba(245, 55, 77, 0.25)',
                'rgb(222, 182, 103, 0.25)',
                'rgba(172, 194, 54, 0.25)',
                'rgb(22, 143, 115, 0.25)',
                'rgba(0, 169, 56, 0.25)',
                'rgba(88, 89, 91, 0.25)',
                'rgba(113, 73, 186, 0.25)',
                'rgba(186, 73, 141, 0.25)'
            ],
            borderColor: [
                `rgb(54, 114, 235, 1)`,
                'rgba(77, 201, 246, 1)',
                'rgba(246, 113, 26, 1)',
                'rgba(245, 55, 77, 1)',
                'rgb(222, 182, 103, 1)',
                'rgba(172, 194, 54, 1)',
                'rgb(22, 143, 115, 1)',
                'rgb(0, 169, 56, 1)',
                'rgba(88, 89, 91, 1)',
                'rgba(113, 73, 186, 1)',
                'rgba(186, 73, 141, 1)'
            ],
            borderWidth: 1
        }]
    };
    
    const config = {
        type: `bar`,
        data,
        options: {
            scales: {
                x: {
                    display: false
                }
            },
            plugins: {
                legend: {
                    display: false
                },
                title: {
                    display: true,
                    text: `Nombre d'enregistrements par phrase`
                }
            }
        }
    };
    
    sentences_chart = render(ctx, config);
}
