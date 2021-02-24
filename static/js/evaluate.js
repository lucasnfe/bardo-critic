// Define sound instance
let sound = null;

// Controls
let thumbPos = 0;
let thumbSavedPos = 0;
let didClickOnThumb = false;

// Keep track of how many times the user pressed play
let playCount = 0;
let playCompleteCount = 0;

const slider = $("#emotion-slider");
const thumb  = $("#emotion-slider-thumb");

const leftTrack = $('#emotion-track-left');
const rightTrack = $('#emotion-track-right');

thumb.on("mousedown", function(ev) {
    thumbDown();
});

thumb.on("touchstart", function(ev) {
    thumbDown();
});

$(document).on("mousemove", function(ev) {
    thumbMove(ev.clientX);
});

$(document).on("touchmove", function(ev) {
    if(didClickOnThumb) {
        ev.preventDefault();
    }

    var touches = ev.changedTouches;
    for (let i = 0; i < touches.length; i++) {
        thumbMove(touches[i].pageX);
    }
});

$(document).on("mouseup", function(ev) {
    thumbUp();
});

$(document).on("touchend", function(ev) {
    thumbUp();
});

$(document).on("touchcancel", function(ev) {
    thumbUp();
});

$('#emotion1').on('hide.bs.select', function (e, clickedIndex, isSelected, previousValue) {
    if(playCompleteCount == 0) {
        $(this).val("");
        $(this).change();

        // Pause the piece
        pause();

        // Show play popover
        $("#playButton").popover('show');
    }
    else {
        onEmotionButtonPlayed();
    }
});

$('#emotion2').on('hide.bs.select', function (e, clickedIndex, isSelected, previousValue) {
    if(playCompleteCount == 0) {
        $(this).val("");
        $(this).change();

        // Pause the piece
        pause();

        // Show play popover
        $("#playButton").popover('show');
    }
    else {
        onEmotionButtonPlayed();
    }
});

$(".evaluate-quality").on('click', function(ev){
    if(playCompleteCount == 0) {
        ev.preventDefault();

        // Pause the piece
        pause();

        // Show play popover
        $("#playButton").popover('show');
    }
});

slider.on("mousedown", function(ev) {
    if(sound.state() != "loaded") {
        return;
    }

    if(!didClickOnThumb && playCompleteCount > 0) {
        pause();

        // Calculate mid point
        let p = calcMidPoint(ev.clientX);

        // Update thumb position
        updateProgressBar(p);
    }
});

function thumbDown() {
    if(sound.state() != "loaded") {
        return;
    }

    didClickOnThumb = true;
    pause();
}

function thumbMove(clientX) {
    if(sound.state() != "loaded") {
        return;
    }

    if(didClickOnThumb) {
        // Calculate mid point
      	let p = calcMidPoint(clientX);

        // Update thumb position
        updateProgressBar(p);
    }
}

function thumbUp() {
    if(sound.state() != "loaded") {
        return;
    }

    didClickOnThumb = false;
}

function calcMidPoint(clientX) {
    // Calculate mid point
    let x = clientX - thumb.width()/2;
    let p = (x - limitX0 - sliderPaddingLeft)/sliderLimit;

    return p;
}

function switchSelect(select, track) {
    switch (select.value) {
        default:
            track.css("backgroundColor", "#616A71");
            break;
        case "1":
            track.css("backgroundColor", "#92C1E9");
            break;
        case "2":
            track.css("backgroundColor", "#FF8C00");
            break;
        case "3":
            track.css("backgroundColor", "#F3DD6D");
            break;
        case "4":
            track.css("backgroundColor", "#C3B1A4");
            break;
    }
}

function play() {
    if(!sound.playing() && sound.seek() == sound.duration()) {
        updateProgressBar(0);
    }

    setPlayImg();
    sound.play();
}

function pause() {
    setPauseImg();
    sound.pause();
}

function step() {
    // Determine our current seek position.
    let p = sound.seek()/sound.duration();

    updateProgressBar(p);

    if(playCompleteCount == 0) {
        updateEmotionSlider(p);
    }

    // If the sound is still playing, continue stepping.
    if (sound.playing()) {
        requestAnimationFrame(step);
    }
}

function onPlayButtonPlayed() {
    $("#playButton").popover('hide');

    if(!sound.playing()) {
        play();
    }
    else {
        pause();
    }
}

function updateEmotionSlider(p) {
    leftTrack.css("width", (p * 100) + "%");
    rightTrack.css("width", ((1.0 - p) * 100) + "%");
}

function onEmotionButtonPlayed() {
    updateEmotionSlider(thumbPos);

    switchSelect(emotion1, leftTrack);
    switchSelect(emotion2, rightTrack);

    pause();

    // Save current thumb pos
    thumbSavedPos = thumbPos;
}

// Updates
function updateTimer(p) {
    if(p >= 0 && p <= 1.0) {
        timer.innerHTML = formatTime(Math.round(p * sound.duration()));
    }
}

function updateProgressBar(p) {
    // Compute seek position
    thumbPos = clamp(p, 0.0, 1.0);
    let seek = thumbPos * sound.duration();

    // Seek sound
    if(!sound.playing()) {
        sound.seek(seek);
    }

    // Update thumb
    thumb.css("left", (limitX2 + thumbPos * sliderLimit) + "px");

    if(playCompleteCount == 0) {
        thumb.css("visibility", "hidden");
    }
    else {
        thumb.css("visibility", "visible");
    }

    // Update timer
    updateTimer(thumbPos);
}

function onEvaluateLoad() {
    onResize();
    loadPlayCount();
    loadFormAction();
    loadPieceTitle();
    loadPagingProgress();

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
          $("#playButton" ).prop("disabled", false);

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
      }
    });
}

function onResize() {
    sliderPaddingLeft = parseInt(slider.css("padding-left").split("px")[0]);
    sliderLimit = slider.width() - thumb.width()/2;

    limitX0 = slider.offset().left;
    limitY0 = slider.offset().top;
    limitX1 = limitX0 + sliderLimit;
    limitX2 = slider.position().left + sliderPaddingLeft;

    thumb.css("left", (limitX2 + thumbPos * sliderLimit) + "px");

    thumb.draggable({axis: "x", containment: [limitX0 + sliderPaddingLeft, limitY0,
                                              limitX1 + sliderPaddingLeft, limitY0]});
}

// Formatting
function formatTime(secs) {
  var minutes = Math.floor(secs / 60) || 0;
  var seconds = (secs - minutes * 60) || 0;

  return minutes + ':' + (seconds < 10 ? '0' : '') + seconds;
}

function clamp(num, min, max) {
  return num <= min ? min : num >= max ? max : num;
}
