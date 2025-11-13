/* -----------------------------------------------------------
   INSTRUCTIONS LIST
   Each instruction has:
     - text: displayed message
     - trigger: the type of user action required
     - target: (optional) required text for "word" prompts
----------------------------------------------------------- */
const instructions = [
    { text: 'click anywhere on this page (not the buttons).', trigger: 'click' },
    { text: 'scroll as if you are looking for something that is not here.', trigger: 'scroll' },
  
    { text: 'move your cursor like it is unsure where to go.', trigger: 'move' },
    { text: 'let the cursor wander without deciding.', trigger: 'move' },
    { text: 'hover over the wrong thing.', trigger: 'move' },
  
    // Typing prompts
    { text: 'TYPE("hello")', trigger: 'word', target: 'hello' },
    { text: 'TYPE("error") // admit something glitched.', trigger: 'word', target: 'error' },
    { text: 'TYPE("softly")', trigger: 'word', target: 'softly' },
    { text: 'TYPE("continue?")', trigger: 'word', target: 'continue?' },
    { text: 'TYPE("???")', trigger: 'word', target: '???' },
    { text: 'TYPE("breathe")', trigger: 'word', target: 'breathe' },
    { text: 'TYPE("null")', trigger: 'word', target: 'null' },
    { text: 'TYPE("loading")', trigger: 'word', target: 'loading' },
  
    // Keypress prompts
    { text: 'pressAnyKeyTo("continue")', trigger: 'key' },
    { text: 'press a key you don’t usually press.', trigger: 'key' },
    { text: 'press any key on your keyboard.', trigger: 'key' },
  
    // Click prompts
    { text: 'HIGHLIGHT.randomText() // select some text on this page', trigger: 'click' },
    { text: 'CLICK(randomElement) // click somewhere unexpected', trigger: 'click' },
  
    // Timer-based pauses
    { text: 'WAIT. do nothing until this line changes.', trigger: 'timer' },
    { text: 'take a moment to reconsider nothing.', trigger: 'timer' },
    { text: 'do nothing—intentionally.', trigger: 'timer' },
    { text: 'accept the delay.', trigger: 'timer' },
    { text: 'ERROR.display("syntax??")', trigger: 'timer' },
    { text: 'pretend to understand.', trigger: 'timer' },
    { text: 'DOUBLE the confusion();', trigger: 'timer' }
  ];
  
  /* -----------------------------------------------------------
     RUNTIME STATE
  ----------------------------------------------------------- */
  let isRunning = false;
  let lastInstruction = null;
  let currentListenerCleanup = null;
  let scrollSpacer = null;
  let moveTracker = null; // tracks movement distance
  
  /* -----------------------------------------------------------
     GRAB REQUIRED DOM ELEMENTS
  ----------------------------------------------------------- */
  const currentEl   = document.getElementById('current');
  const logEl       = document.getElementById('log');
  const statusText  = document.getElementById('statusText');
  const startBtn    = document.getElementById('startBtn');
  const stopBtn     = document.getElementById('stopBtn');
  const resetBtn    = document.getElementById('resetBtn');
  const typingArea  = document.getElementById('typingArea');
  const typeInput   = document.getElementById('typeInput');
  
  /* -----------------------------------------------------------
     LOGGING FUNCTION
     Appends a timestamped line into the script
  ----------------------------------------------------------- */
  function log(message) {
    const time = new Date().toLocaleTimeString();
    logEl.textContent += '\n[' + time + '] ' + message;
    logEl.scrollTop = logEl.scrollHeight;
  }
  
  /* -----------------------------------------------------------
     INSTRUCTION PICKER
     Returns a new random instruction.
     Small chance of repeating previous instruction.
  ----------------------------------------------------------- */
  function randomInstruction() {
    const repeatChance = 0.12;
    if (lastInstruction && Math.random() < repeatChance) {
      return { ...lastInstruction, text: lastInstruction.text + ' // repeat' };
    }
    const index = Math.floor(Math.random() * instructions.length);
    return instructions[index];
  }
  
  /* -----------------------------------------------------------
     CLEAR ANY ACTIVE TRIGGERS
     Removes event listeners or scroll helpers
  ----------------------------------------------------------- */
  function clearCurrentTrigger() {
    if (currentListenerCleanup) {
      currentListenerCleanup();
      currentListenerCleanup = null;
    }
    if (scrollSpacer) {
      scrollSpacer.remove();
      scrollSpacer = null;
    }
    moveTracker = null;
  }
  
  /* Hide typing box */
  function hideTypingBox() {
    typingArea.style.display = 'none';
    typeInput.value = '';
  }
  
  /* -----------------------------------------------------------
     SET TRIGGER FOR A GIVEN INSTRUCTION
     Creates the event listeners or timed waits required
  ----------------------------------------------------------- */
  function setTriggerForInstruction(instr) {
    clearCurrentTrigger();
    hideTypingBox();
  
    if (!instr || !instr.trigger) return;
  
    /* --- CLICK TRIGGER -------------------------------------- */
    if (instr.trigger === 'click') {
      const handler = e => {
        const tag = e.target.tagName.toLowerCase();
        if (tag === 'button' || e.target === typeInput) return;
        if (!isRunning) return;
        showNextInstruction();
      };
      document.addEventListener('click', handler);
      currentListenerCleanup = () => document.removeEventListener('click', handler);
  
    /* --- SCROLL TRIGGER ------------ */
    } else if (instr.trigger === 'scroll') {
      scrollSpacer = document.createElement('div');
      scrollSpacer.style.height = '2000px';
      document.body.appendChild(scrollSpacer);
  
      let startY = window.scrollY;
      const threshold = 250; // user must scroll this many px
  
      const handler = () => {
        if (!isRunning) return;
        const dist = Math.abs(window.scrollY - startY);
        if (dist >= threshold) showNextInstruction();
      };
      window.addEventListener('scroll', handler);
      currentListenerCleanup = () => window.removeEventListener('scroll', handler);
  
    /* --- KEY PRESS TRIGGER ---------------------------------- */
    } else if (instr.trigger === 'key') {
      const handler = event => {
        if (event.target === typeInput) return; // ignore typing input
        if (!isRunning) return;
        showNextInstruction();
      };
      document.addEventListener('keydown', handler, { once: true });
      currentListenerCleanup = () => document.removeEventListener('keydown', handler);
  
    /* --- MOUSE MOVE TRIGGER --------------------------------- */
    } else if (instr.trigger === 'move') {
      const threshold = 300; // how far user must move mouse
      moveTracker = { lastX: null, lastY: null, totalDistance: 0 };
  
      const handler = event => {
        if (!isRunning) return;
  
        const x = event.clientX;
        const y = event.clientY;
  
        if (moveTracker.lastX === null) {
          moveTracker.lastX = x;
          moveTracker.lastY = y;
          return;
        }
  
        const dx = x - moveTracker.lastX;
        const dy = y - moveTracker.lastY;
        const dist = Math.sqrt(dx*dx + dy*dy);
  
        moveTracker.totalDistance += dist;
        moveTracker.lastX = x;
        moveTracker.lastY = y;
  
        if (moveTracker.totalDistance >= threshold) showNextInstruction();
      };
  
      document.addEventListener('mousemove', handler);
      currentListenerCleanup = () => document.removeEventListener('mousemove', handler);
  
    /* --- TIMER TRIGGER -------------------------------------- */
    } else if (instr.trigger === 'timer') {
      const id = setTimeout(() => {
        if (!isRunning) return;
        showNextInstruction();
      }, 2000);
      currentListenerCleanup = () => clearTimeout(id);
  
    /* --- WORD TRIGGER ------------------ */
    } else if (instr.trigger === 'word') {
      typingArea.style.display = 'flex';
      typeInput.value = '';
      typeInput.focus();
  
      const target = (instr.target || '').toLowerCase();
      const handler = () => {
        if (!isRunning) return;
        const value = typeInput.value.trim().toLowerCase();
        if (value === target) showNextInstruction();
      };
  
      typeInput.addEventListener('input', handler);
      currentListenerCleanup = () => typeInput.removeEventListener('input', handler);
    }
  }
  
  /* -----------------------------------------------------------
     DISPLAY AND START NEXT INSTRUCTION
  ----------------------------------------------------------- */
  function showNextInstruction() {
    if (!isRunning) return;
  
    const instr = randomInstruction();
    lastInstruction = instr;
  
    currentEl.textContent = instr.text;
    log(instr.text);
  
    setTriggerForInstruction(instr);
  }
  
  /* -----------------------------------------------------------
     CONTROL BUTTONS
  ----------------------------------------------------------- */
  function startGenerator() {
    if (isRunning) return;
    isRunning = true;
    startBtn.disabled = true;
    stopBtn.disabled = false;
    log('[system] started.');
    showNextInstruction();
  }
  
  function stopGenerator() {
    if (!isRunning) return;
    isRunning = false;
    clearCurrentTrigger();
    hideTypingBox();
    startBtn.disabled = false;
    stopBtn.disabled = true;
    log('[system] stopped.');
  }
  
  function resetLog() {
    stopGenerator();
    logEl.textContent = '[system] log cleared. press start again.';
    currentEl.textContent = 'instructions will appear here when you press start.';
    lastInstruction = null;
  }
  
  /* -----------------------------------------------------------
     BUTTON EVENT LISTENERS
  ----------------------------------------------------------- */
  startBtn.addEventListener('click', startGenerator);
  stopBtn.addEventListener('click', stopGenerator);
  resetBtn.addEventListener('click', resetLog);
  