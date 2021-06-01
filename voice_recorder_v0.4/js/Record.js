// GENERATION UID ON THE LOADING OF THE PAGE
const uid = uuidv4();
const project_id = "STKS";

// Declaration of global variables
let listrecords = document.getElementById("listrecords");
let bar = document.querySelector('#micro_test_bar');
let text_area = document.querySelector('#record .text');
let alert = document.querySelectorAll('.alert'); // get alert on html
let progress_bar = document.querySelector('.progress');
let record = false; // to know the state of recording
let recordIdle = false; // is true when record stops by inactivity while recording
let sentence_id = 0; // current sentence
let percentage = document.querySelector('#percent'); // percentage of session
let micro_volume = 0; // volume of the microphone

//Record object
let record_one = {
    "sexe": "M",
    "age": "80",
    "uid": uid,
    "sentence": "PHRASE DE TEST",
    "sentenceid": 1,
    "project": project_id,
    "recordtime": 0,
}

const NextPage = () => {
    if (1 < navigation.currentPage) {
        navigation.nextPage();
    } else if (navigation.currentPage === 0) { // check if inputs are correct at init
        let radio = document.querySelectorAll('.sex input');
        let age = document.querySelectorAll('#Age');
        if ((radio[0].checked | radio[1].checked | radio[2].checked) /*if a radio is selected*/ & (12 <= age[0].value & age[0].value <= 140) /*age between 12 and 140 yo*/ ) {
            
            if (radio[0].checked) record_one.sexe = "N";
            else if (radio[1].checked) record_one.sexe = "M";
            else record_one.sexe = "F";
            
            record_one.age = age[0].value;
            navigation.nextPage();
            alert[0].innerHTML = "";
        } else if (!(radio[0].checked | radio[1].checked | radio[2].checked) /*if a radio is not selected*/ ) {
            alert[0].innerHTML = "Veuillez sélectionner votre sexe"; // "please do select your radio"
        } else {
            /*if age is not between 12 and 140 yo*/
            alert[0].innerHTML = "Veuillez avoir entre 12 et 140 ans"; // "please do be between 12 and 140 yo"
        }
    }
    else if (navigation.currentPage === 1) {
        if (data.length >= sentence_id)
            alert[2].hidden = false; // shows (back) message when all sentences are not yet recorded
    }
}

/////////////////////////////////PAGE ONLOAD///////////////////////////////////
navigator.permissions.query({
    name: "microphone"
}).then(result => {
    if (result.state === "granted" || result.state === "prompt")
        if (!recordIdle)
            initMediaCapture(displayVolume, BuildDataAndUpload);
});

const displayVolume = (volume) => {
    bar.value = volume;
    micro_volume = volume;
}

///////////////////////////////////////////////////////////////////////
const sentenceProgression = (sentence_id) => {
    //set up the size of progress bar
    progress_bar.max = data.length - 1;
    
    //initialization of the sentence
    text_area.innerText = data[sentence_id].sentence;
    progress_bar.value = sentence_id;
    percentage.innerText = parseInt((sentence_id * 100) / (data.length - 1)) + "%";
    //conversion in percentage
    record_one.sentence = data[sentence_id].sentence;
    record_one.sentenceid = sentence_id;
};
sentenceProgression(sentence_id);

// Send data to the server and create li with audio
const BuildDataAndUpload = () => {
    blob = new Blob(chunks, {
        type: media.type
    });
    let url = URL.createObjectURL(blob),
        li = document.createElement('li'),
        mt = document.createElement(media.tag),
        hf = document.createElement('a');
    mt.controls = true;
    mt.src = url;
    hf.href = url;
    
    li.appendChild(mt);
    
    listrecords.appendChild(li);
    UploadData(record_one, () => console.log("SAVED"));
}

// idle micro timeout computing
const secondsIdleMicroTimeout = 10.0; // in seconds
const tickMicroClock = 50; // in milliseconds
const micro_volumeMinimum = 1.25;
let secondsMicroUse = Number(0);
let secondsIdleMicroUse = 0;
let clockMicro;
let clockIdleMicro;

const StartClock = (clockMicro) => {
    secondsMicroUse = 0;
    clockMicro = setInterval(() => {
        secondsMicroUse += Number(tickMicroClock);
    },tickMicroClock); // clock each millis
}

const StopClock = (clockMicro) => {
    clearInterval(clockMicro); // stops clock
}

const StartIdleClock = (clockIdleMicro) => {
    secondsIdleMicroUse = 0;
    clockIdleMicro = setInterval(() => {
        if (!record) {
            clearInterval(clockIdleMicro); // stops clock
            // reset idle clock counter if volume or increment up since last func call
        } else {
            if (micro_volume > micro_volumeMinimum) secondsIdleMicroUse = 0;
            else secondsIdleMicroUse += tickMicroClock / 1000;
            
            // stop record if idle more than the timeout range specified
            if (secondsIdleMicroUse > parseFloat(secondsIdleMicroTimeout)) StopIdleClock();
        }
    }, tickMicroClock); // test idle micro each tick
}

const StopIdleClock = (clockIdleMicro) => { // executed when record stops by inactivity
    secondsIdleMicroUse = 0;
    clearInterval(clockIdleMicro); // stops clock
    
    record = false;
    recordIdle = true;
    alert[1].hidden = false; // displays message when sentence is not saved
    
    StopRecording();
}

// Select the user instruction message
let instruction = document.querySelector('.instruction');

const StartRecording = () => {
    //Warning not change this variable
    chunks = [];
    recorder.start();
    
    //Change icon and user message
    let bt_icon = document.querySelectorAll('#record .btIcon');
    instruction.innerText = "une fois terminé."
    bt_icon[0].classList.toggle("fa-square");
    bt_icon[1].classList.toggle("fa-square");
    
    recordIdle = false;
    alert[1].hidden = true; // hide (back) message when sentence is not saved
    
    StartIdleClock();
    StartClock();
}

const StopRecording = () => {
    recorder.stop(); // run save / upload
    StopClock();
    record_one.recordtime = secondsMicroUse;
    secondsMicroUse = 0;
    
    //Change icon and user message
    let bt_icon = document.querySelectorAll('#record .btIcon');
    instruction.innerText = "puis lisez la phrase à haute voix."
    bt_icon[0].classList.toggle("fa-microphone");
    bt_icon[1].classList.toggle("fa-microphone");
}

// ToggleRecording with user interation on the right button
const ToggleRecording = () => {
    if (record) {
        record = false;
        if (!recordIdle) { // if the current sentence has not been stoped by inactivity
            if (data.length - 1 < sentence_id) { // auto-next page when all sentences completed
                navigation.nextPage();
                alert[2].hidden = true; // hide (back) message when all sentences are not yet recorded
            }
            //initialization of the next sentence
            //update the sentence
            sentence_id++;
            try { sentenceProgression(sentence_id); } catch (error) {}
        }
        StopRecording();
    } else {
        record = true;
        StartRecording();
    }
}