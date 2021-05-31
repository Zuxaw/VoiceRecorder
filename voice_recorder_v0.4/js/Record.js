let listrecords = document.getElementById("listrecords");
let bar = document.querySelector('#micro_test_bar');
let counter = 0;
let exportdata = [];
let record = false;

//GENERATION UID
var uid = uuidv4();


navigator.permissions.query({
    name: "microphone"
}).then(result => {
    if (result.state == "granted" || result.state == "prompt") {
        initMediaCapture(displayVolume, BuildDataAndUpload);
    }
});


const displayVolume = (volume) => {
    bar.value = volume;
}


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

    let record_one = {
        "sexe": "M",
        "age": "80",
        "uid": uid,
        "sentence": "PHRASE DE TEST",
        "sentenceid": 1,
        "project": "AA12",
        "recordtime": 0,
    }
    UploadData(record_one,
        () => {

            console.log("SAVED");
        });

}


const StartRecording = () => {

    //ATTENTION : ces 2 variables sont d�clar�es dans utils et ne sont donc pas � modifier / red�clarer
    chunks = [];
    recorder.start();

}

const StopRecording = () => {

    recorder.stop(); // run save / upload

}

const ToggleRecording = () => {
    if (record) {
        record = false;
        StopRecording();
    } else {
        record = true;
        StartRecording();
    }
}