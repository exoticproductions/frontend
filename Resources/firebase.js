//Invoke when pages loads
window.onload = function () {
  // Get the form using the ID
  const form = document.querySelector('#form-data');
  var imageUpload = form.querySelector('#img');
  imageUpload.required = true;

  var modal = new bootstrap.Modal(document.querySelector('#my-modal'));
  var modalTitle = document.querySelector('.modal-title');
  var progressBar = document.querySelector('.progress-bar');

  //Use to save the loaded image and when submitting save it
  var imageEvent = null;
  var imagesUrl = [];

  //1. Your web app's Firebase configuration
  var firebaseConfig = {
    apiKey: 'AIzaSyBdWCumAMH9Fh8h2KOHiWs2OLEMZZ_6CiI', //process.env.APP_FIREBASE_KEY,
    authDomain: 'exoticproductions-ff88f.firebaseapp.com',
    databaseURL: 'https://exoticproductions-ff88f.firebaseio.com',
    projectId: 'exoticproductions-ff88f',
    storageBucket: 'exoticproductions-ff88f.appspot.com',
    messagingSenderId: '640547250962',
    appId: '1:640547250962:web:0b47bd816303c3603389cb',
    measurementId: 'G-J85D8E4RCB',
  };

  firebase.initializeApp(firebaseConfig);

  //Reference for Firebase database to save the applicant info
  var databaseRef = firebase.database().ref(`/applications/`);

  //4A.Save applicant data
  var saveInfo = function (imageURL) {
    // Get input values from each of the form elements
    var firstName = form.querySelector('#first-name').value;
    var lastName = form.querySelector('#last-name').value;
    var phoneNumber = form.querySelector('#phone-number').value;
    var message = form.querySelector('#message').value;
    var email = form.querySelector('#email').value;

    var data = {
      firstName: firstName,
      lastName: lastName,
      phoneNumber: phoneNumber,
      email: email,
      message: message,
      images: imageURL,
      // img1: imageURL[0] ? imageURL[0] : null,
      // img2: imageURL[1] ? imageURL[1] : null,
      // img3: imageURL[2] ? imageURL[2] : null,
    };
    // Create a new entry to the database using those values
    //Use push instead of set because push automatically creates an id when data is save
    databaseRef.push(data, function (error) {
      if (error) {
        // The write failed...
        console.log(error);
      } else {
        // Data saved successfully!
        console.log('Data saved successfully!');
        form.reset();
      }
    });

    databaseRef;
  };

  var startProgressBar = function (value) {
    //console.log(value);
    progressBar.setAttribute('aria-valuenow', value);
    progressBar.setAttribute('style', 'width:' + Number(value) + '%');
  };

  //4B.Upload images
  var saveImage = function (imageFile, imageCount) {
    //console.log('Path: ' + path);
    var path = form.querySelector('#first-name').value;
    //1.Create path
    var storageRef = firebase.storage().ref(`${path}/`).child(imageFile.name);

    //2.Upload file
    var task = storageRef.put(imageFile);

    //Show upload progress
    task.on(
      'state_changed',
      function progress(snapshot) {
        var percentage =
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        startProgressBar(percentage.toString());
        console.log(percentage);
      },
      function error(err) {
        console.log(err);
      },
      function complete() {
        console.log('Image saved successfully!');
        modalTitle.innerHTML = 'Sent!';
        //3.Get URL
        storageRef.getDownloadURL().then(function (url) {
          imagesUrl.push({ img: url });
          //Once all images are save, get url to save with applicant info
          if (imagesUrl.length == imageCount) {
            saveInfo(imagesUrl);
          }
        });
      }
    );
  };

  //Helper function to loop over all selected images to save each
  var loadImages = function () {
    var imageLen = imageEvent.target.files.length;

    if (imageLen != 0) {
      for (var i = 0; i < imageLen; i++) {
        var imageFile = imageEvent.target.files[i];
        saveImage(imageFile, imageLen);
      }
    }
  };

  //2.Check if the form exist to trigger listeners
  if (form) {
    //For when the form is submitted
    form.addEventListener('submit', function (evt) {
      evt.preventDefault();
      //Show modal
      modal.show();

      //Invoke when button pressed
      loadImages();
      //shows alert if everything went well.
      return; //alert('Your applications was successfully submitted.');
    });
    //For when user selects images
    imageUpload.addEventListener('change', function (e) {
      imageEvent = e;
    });
  }
};
