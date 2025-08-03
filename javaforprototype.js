    // JavaScript file for the speedrun timer
    
    //Array of split labels
    const splits = ["BOB", "WF", "CCM", "BiDTW", "SSL", "LLL", "HMC", "DDD", "BiFS", "BitS"];

    // Variables to keep track of the timer state

    let startTime = 0; // Start time of the timer
    let elapsed = 0; // Elapsed time since the timer started
    let timerInterval = null; // Interval for updating the timer
    let running = false; // Timer state

    // Variables to keep track of the current run, splits, and personal bests
    let currentRun = []; // Keeps track of current run
    let currentSplitIndex = 0; //Keeps track of what split the user is on
    let allRuns = []; // Array to store all runs
    let personalBests = {}; // Object to store personal best


    // DOM Elements from the HTML to display the timer, runs and personal bests, giving function to the buttons

    const timeDisplay = document.getElementById("time"); // Display element for the timer
    const startStopBtn = document.getElementById("startStopBtn"); // Button to start/stop the timer
    const saveSplitBtn = document.getElementById("saveSplitBtn"); // Button to save the current split
    const endRunBtn = document.getElementById("endRunBtn"); // Button to end the current run
    const exportBtn = document.getElementById("exportBtn"); // Button to export all runs and PBs
    const clearDataBtn = document.getElementById("clearDataBtn"); // Button to clear all saved runs and PBs

    const currentRunList = document.getElementById("currentRunList");
    const pbList = document.getElementById("pbList");
    const bestRunDisplay = document.getElementById("bestRunDisplay");

    //Loads speedrun data from local storage on page load
      const savedData = localStorage.getItem("speedrunData");
      if (savedData) {
        const parsed = JSON.parse(savedData);
        allRuns = parsed.allRuns || [];
        personalBests = parsed.personalBests || {};
        updatePBDisplay();
        updateBestRunDisplay();
      }

//Creating a function to format the time in HH:MM:SS:MS
//Reusable formatting function to format time in HH:MM:SS:MS
function formatTime(ms) {
  const totalMilliseconds = Math.floor(ms);
  const milliseconds = totalMilliseconds % 1000;
  const totalSeconds = Math.floor(totalMilliseconds / 1000);
  const seconds = totalSeconds % 60;
  const totalMinutes = Math.floor(totalSeconds / 60);
  const minutes = totalMinutes % 60;
  const hours = Math.floor(totalMinutes / 60);

  //Formatting the time to be displayed in HH:MM:SS:MS using padStart to ensure 2 digits are displayed, with the exception of MS, which is 3 digits for timing accuracy
  return (
    `${String(hours).padStart(2, '0')}:` +
    `${String(minutes).padStart(2, '0')}:` +
    `${String(seconds).padStart(2, '0')}:` +
    `${String(milliseconds).padStart(3, '0')}`
  );
}

    

    //declaring the function to update the timer display using performence.now
    function updateTime() { 
  const now = performance.now(); 
  const elapsed = now - startTime;

  timeDisplay.textContent = formatTime(elapsed);

}
//Function to update the personal best displayed on the screen
    function updatePBDisplay() {
      pbList.innerHTML = '';
      for (const [label, pb] of Object.entries(personalBests)) {
        const li = document.createElement("li"); //Creating new list item
        li.textContent = `${label}: ${formatTime(pb.duration)} (Run ${pb.runIndex + 1})`;
        pbList.appendChild(li);
      }
    }
//Function to update the current run displayed 
    function updateCurrentRunDisplay() {
      currentRunList.innerHTML = '';
      currentRun.forEach((split) => {
        const li = document.createElement("li"); //Creating new list item
        li.textContent = `${split.label}: ${formatTime(split.duration)}`; // Displaying the split label and duration, formatted to hh:mm:ss:ms
        const pb = personalBests[split.label]; // Getting the personal best for the current split
        // Adding class to the list item based on the personal best
        if (pb && pb.duration === split.duration && pb.runIndex === allRuns.length) { 
          li.classList.add("Purple"); // Green split
        }
        // Adding class to the list item based on player falling behind
        else if (pb && pb.duration < split.duration) {
          li.classList.add("Red"); // Red split
        }
        currentRunList.appendChild(li); // Adding the list item to the current run list
      });
    }
//Function to update the best run displayed
//If statement to display "no runs yet" if there are no runs
    function updateBestRunDisplay() {
      if (allRuns.length === 0) {
        bestRunDisplay.textContent = "No runs yet.";
        return;
      }
//Finding the best run by going through all runs and finding the one with the lowest total time
      let bestTime = Infinity; 
      let bestIndex = -1;

      allRuns.forEach((run, index) => {
        const total = run.reduce((sum, s) => sum + s.duration, 0);
        if (total < bestTime) {
          bestTime = total;
          bestIndex = index;
        }
      });
//Updating the best run display with the best time and index
      bestRunDisplay.innerHTML = `Run ${bestIndex + 1} – <span class="best-run">${formatTime(bestTime)}</span>`;
    }
//Function to save the current state to local storage
    function saveToLocalStorage() {
      const data = {
        allRuns,
        personalBests
      };
      localStorage.setItem("speedrunData", JSON.stringify(data));
    }

    //Event listener for the start/stop button
    startStopBtn.addEventListener("click", () => {
      if (!running) { 
        startTime = performance.now(); // Starting the timer
        elapsed = 0;
        currentRun = [];
        currentSplitIndex = 0;
        timerInterval = setInterval(updateTime, 10);
        startStopBtn.textContent = "Stop/Reset"; // Changing the button text to "Stop/Reset"
        running = true;
        updateCurrentRunDisplay();
      } else {
        clearInterval(timerInterval);
        startStopBtn.textContent = "Start";
        running = false;
      }
    });

    saveSplitBtn.addEventListener("click", () => {
      if (!running || currentSplitIndex >= splits.length) return;

//add functionality to, all splits completed, timer stops automatically

      const now = performance.now();
      const timeSinceStart = now - startTime;
      const label = splits[currentSplitIndex];
      const prevTime = currentSplitIndex === 0 ? 0 : currentRun[currentSplitIndex - 1].time;
      const duration = Math.round(timeSinceStart - prevTime);

      const split = {
        label,
        time: Math.round(timeSinceStart),
        duration
      };


      
//Adding spacebar functionality

let spacebarHeld = false; //Flag variable tracking if the spacebar is held down to prevent multiple keydown events

document.addEventListener("keydown", (event) => { //Event listener for keydown - the name for the key press
  if (event.code === "Space" && !spacebarHeld) { 
    event.preventDefault(); //Stopping the page from scrolling

    if (running) {
      saveSplitBtn.click(); // Simulate a click on the save split button using the space bar
    }

    spacebarHeld = true; //Sets the flag to true to prevent multiple keydown events
  }
});

//Event listener for keyup - Name for the key release as there was an issue with keydown registering as multiple presses
//This event listener registers that once the spacebar is released, keydown can be triggered again
document.addEventListener("keyup", (event) => {
  if (event.code === "Space") {
    spacePressed = false;   
  }
});
//Adding the split to the current run
      currentRun.push(split);

      if (
        !personalBests[label] ||
        duration < personalBests[label].duration
      ) {
        personalBests[label] = {
          duration: duration,
          runIndex: allRuns.length // current run (not yet added)
          
        };
      }
//Updating the display of the current run and personal bests
      currentSplitIndex++;
      updateCurrentRunDisplay();
      updatePBDisplay();

//Stopping the timer if all splits are completed
      if (currentSplitIndex === splits.length) { //If statement to check if all splits are completed
      clearInterval(timerInterval); //Stopping the timer
      startStopBtn.textContent = "Start"; //Changing the start stop button back to start
      running = false; //Setting the running variable to false
    }
  });

    
    endRunBtn.addEventListener("click", () => {
      if (currentRun.length > 0) {
        allRuns.push(currentRun);
        saveToLocalStorage();
        updateBestRunDisplay();
        currentRun = [];
        currentSplitIndex = 0;
        updateCurrentRunDisplay();
      }
    });
//Function to export all runs and personal bests
//This function creates a JSON file containing all runs and personal bests
    exportBtn.addEventListener("click", () => {
      const data = {
        allRuns,
        personalBests
      };
      // Creating a JSON file from the data
      const dataStr = JSON.stringify(data, null, 2);
      const blob = new Blob([dataStr], { type: "application/json" });
      const url = URL.createObjectURL(blob);
// Creating a link to download the JSON file
      const a = document.createElement("a");
      a.href = url;
      a.download = "runs_and_pbs.json";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    });
//Function to clear all saved runs and personal bests
    clearDataBtn.addEventListener("click", () => {
      if (confirm("Are you sure you want to clear all saved runs and PBs?")) {
        localStorage.removeItem("speedrunData");
        allRuns = [];
        personalBests = {};
        currentRun = [];
        currentSplitIndex = 0;
        updatePBDisplay();
        updateBestRunDisplay();
        updateCurrentRunDisplay();
        alert("All runs cleared");
      }
    });