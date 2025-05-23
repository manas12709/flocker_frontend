const output = document.getElementById('output');
const input = document.getElementById('commandInput');

const steps = [
  {
    prompt: "Set your GitHub email:",
    command: 'git config --global user.email "youremail@gmail.com"',
    success: "Email set successfully!",
  },
  {
    prompt: "Set your GitHub username:",
    command: "git config --global user.name yourGHID",
    success: "Username set!",
  },
  {
    prompt: "Create your workspace and clone repo:",
    command: "git clone https://github.com/open-coding-society/student.git",
    success: "Repository cloned!",
  },
  {
    prompt: "Create and activate virtual environment:",
    command: "scripts/venv.sh",
    success: "Virtual environment set up!",
  },
  {
    prompt: "Install dependencies:",
    command: "pip install -r requirements.txt",
    success: "Dependencies installed!",
  },
  {
    prompt: "Run the local server:",
    command: "make",
    success: "Server running! You're ready!",
  },
];

let currentStep = 0;

function showPrompt() {
  if (currentStep < steps.length) {
    output.textContent += "\n\n" + steps[currentStep].prompt + "\n$ ";
  } else {
    output.textContent += "\n\n🎉 All steps completed! Your environment is ready.";
    input.disabled = true;
  }
}

input.addEventListener('keydown', function (e) {
  if (e.key === 'Enter') {
    const userInput = input.value.trim();
    output.textContent += userInput + "\n";
    if (userInput === steps[currentStep].command) {
      output.textContent += steps[currentStep].success;
      currentStep++;
    } else {
      output.textContent += "❌ Incorrect command. Try again.";
    }
    input.value = "";
    showPrompt();
  }
});

showPrompt();
