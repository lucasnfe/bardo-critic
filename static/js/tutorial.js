const LessonState = {"open": 0, "started": 1, "completed": 2}

let lessons = [LessonState.started, LessonState.open, LessonState.open]

thumb.on("mousedown", function(ev) {
    lesson2End();
});

thumb.on("touchstart", function(ev) {
    lesson2End();
});

slider.on("mousedown", function(ev) {
    lesson2End();
});

$(document).on("mouseup", function(ev) {
    lesson3Start();
});

$(document).on("touchend", function(ev) {
    lesson3Start();
});

$(document).on("touchcancel", function(ev) {
    lesson3Start();
});

$('#emotion1').on('show.bs.select', function (e, clickedIndex, isSelected, previousValue) {
    if(lessons[0] == LessonState.completed && lessons[1] == LessonState.completed &&
       lessons[2] == LessonState.started) {

        emotion1.classList.replace('highlighted-text', 'showed-text');
        emotion1.parentElement.classList.replace('highlighted-text', 'showed-text');
    }
});

$('#emotion1').on('changed.bs.select', function (e, clickedIndex, isSelected, previousValue) {
    if(lessons[0] == LessonState.completed && lessons[1] == LessonState.completed &&
       lessons[2] == LessonState.started) {

        if(emotion2.classList.contains('showed-text')) {
            lesson3End();
            lessonFinal();
        }
    }
});

$('#emotion2').on('show.bs.select', function (e, clickedIndex, isSelected, previousValue) {
    if(lessons[0] == LessonState.completed && lessons[1] == LessonState.completed &&
       lessons[2] == LessonState.started) {

        emotion2.classList.replace('highlighted-text', 'showed-text');
        emotion2.parentElement.classList.replace('highlighted-text', 'showed-text');
    }
});

$('#emotion2').on('changed.bs.select', function (e, clickedIndex, isSelected, previousValue) {
    if(lessons[0] == LessonState.completed && lessons[1] == LessonState.completed &&
       lessons[2] == LessonState.started) {

        if(emotion1.classList.contains('showed-text')) {
            lesson3End();
            lessonFinal();
        }
    }
});

function onTutorialLoad() {
    onResize();
    loadPlayCount();
    loadFormAction();

    // Disable play button until sound has been loaded
    $("#playButton" ).prop("disabled", true);

    // Howl object
    sound = new Howl({
      src: [getHowlerAudio()],
      html5: true,
      onload: function() {
          onResize();

          $("#loadingSpinner").css("visibility", "hidden");
          $("#playButtonImg").css("display", "inline");
          $("#playButton").prop("disabled", false);

          loadStoredEvaluation();
      },
      onplay: function() {
          playCount += 1;
          requestAnimationFrame(step);
      },
      onend: function() {
          playCompleteCount += 1;
          updateProgressBar(0.0);
          pause();

          lesson2Start();
      }
    });
}

function lesson1End() {
    let lessonDivs = document.getElementsByClassName("lesson-1");

    for(let div of lessonDivs) {
        div.classList.replace('highlighted-text', 'showed-text');
    }

    lessons[0] = LessonState.completed;
}

function lesson2Start() {
    if(lessons[0] == LessonState.completed && lessons[1] == LessonState.open) {
        let lessonDivs = document.getElementsByClassName("lesson-2");

        for(let div of lessonDivs) {
            div.classList.replace('showed-text', 'highlighted-text');
            div.classList.replace('hidden-text', 'highlighted-text');
        }

        lessons[1] = LessonState.started;
    }
}

function lesson2End() {
    if(lessons[0] == LessonState.completed && lessons[1] == LessonState.started) {
        let lessonDivs = document.getElementsByClassName("lesson-2");

        for(let div of lessonDivs) {
            div.classList.replace('highlighted-text', 'showed-text');
        }

        lessons[1] = LessonState.completed;
    }
}

function lesson3Start() {
    if(lessons[0] == LessonState.completed && lessons[1] == LessonState.completed &&
       lessons[2] == LessonState.open) {
        let lessonDivs = document.getElementsByClassName("lesson-3");

        for(let div of lessonDivs) {
            div.classList.replace('hidden-text', 'highlighted-text');
        }

        lessons[2] = LessonState.started;
    }
}

function lesson3End() {
    if(lessons[0] == LessonState.completed && lessons[1] == LessonState.completed &&
       lessons[2] == LessonState.started) {
        let lessonDivs = document.getElementsByClassName("lesson-3");

        for(let div of lessonDivs) {
            div.classList.replace('highlighted-text', 'showed-text');
        }

        lessons[2] = LessonState.completed;
    }
}

function lessonFinal() {
    let lessonDivs = document.getElementsByClassName("lesson-final");

    for(let div of lessonDivs) {
        div.classList.replace('hidden-text', 'showed-text');
    }

    document.getElementById("nextButton").disabled = false;
}

function onNext() {
    let tutorialHelp = document.getElementById("tutorial-help");
    let tutorialModalLabel = document.getElementById("tutorialModalLabel");

    // Pause piece
    pause();

    if((lessons[0] == LessonState.started || lessons[0] == LessonState.completed) &&
        lessons[1] == LessonState.open    && lessons[2] == LessonState.open) {

           tutorialModalLabel.innerHTML = 'Step 1';
           tutorialHelp.innerHTML = 'Press the "Play" button to listen to the piece (listen until the end).';

           $("#tutorialModal").modal();
    }

    if(lessons[0] == LessonState.completed && lessons[1] == LessonState.started &&
       lessons[2] == LessonState.open) {

           tutorialModalLabel.innerHTML = 'Step 2.1';
           tutorialHelp.innerHTML = 'With the audio paused: drag and drop the slider to (or click on) the location where you perceived the emotion transition.';

           $("#tutorialModal").modal();
    }

    if(lessons[0] == LessonState.completed && lessons[1] == LessonState.completed &&
       lessons[2] == LessonState.started) {

           tutorialModalLabel.innerHTML = 'Step 2.2';
           tutorialHelp.innerHTML = "With the audio paused: select the emotions you perceived in each part. If you don't perceived an emotion transition, select the same emotion in both parts.";

           $("#tutorialModal").modal();
    }

    if(lessons[0] == LessonState.completed && lessons[1] == LessonState.completed &&
       lessons[2] == LessonState.completed) {

           let tutorialSelectedTime = Math.round(thumbSavedPos * sound.duration());

           if(emotion1.value != "1" || emotion2.value != "2" || tutorialSelectedTime != 5) {
               tutorialModalLabel.innerHTML = 'Step 3';
               tutorialHelp.innerHTML = "Make sure the piece piece has a transition from <span class='badge op-calm'>Calm</span> to <span class='badge op-agitated'>Agitated</span> at <mark>0:05</mark>.</span>";

               $("#tutorialModal").modal();
           }
           else {
               $("#evaluate-form").submit();
           }
    }
}
