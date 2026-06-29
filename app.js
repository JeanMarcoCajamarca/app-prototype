// Initialize Supabase Client
const _supabaseUrl = 'https://ovjimwuszbumvbdvvgqa.supabase.co';
const _supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im92amltd3VzemJ1bXZiZHZ2Z3FhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIxMjg2ODMsImV4cCI6MjA4NzcwNDY4M30.3cyON8YKHiq4m873YV_QxVE-uT4daGfJ7aXnzWfN7Gw';
const db = supabase.createClient(_supabaseUrl, _supabaseKey);

let currentUser = null;

async function handleAuth(type) {
    const email = document.getElementById('auth-email').value;
    const password = document.getElementById('auth-password').value;
    const errorDisplay = document.getElementById('auth-error');
    
    if (password.length > 10) {
        errorDisplay.innerText = "Password too long! 10 chars max., please!";
        return;
    }

    errorDisplay.innerText = "Processing..."; // Visual feedback for the user
    
    let result;
    if (type === 'signup') {
        result = await db.auth.signUp({ email, password });
        if (!result.error) {
            // If Confirm Email is ON, the user must stay here until they verify
            alert("Welcome to the Horde! Please check your email to verify your account.");
            errorDisplay.innerText = "Verification email sent!";
            return;
        }
    } else {
        result = await db.auth.signInWithPassword({ email, password });
    }

    if (result.error) {
        // This will now show "Email not confirmed" instead of staying on "Processing..."
        errorDisplay.innerText = result.error.message;
    } else {
        currentUser = result.data.user;
        enterOS(); // Successfully enters the OS
    }
}

// THE MISSING FUNCTION: This tells the browser to show the desktop
function enterOS() {
    const loginScreen = document.getElementById('login-screen');
    const desktop = document.getElementById('desktop');
    
    if (loginScreen) {
        loginScreen.classList.add('hidden'); // Hides the login box
    }
    if (desktop) {
        desktop.classList.remove('hidden'); // Shows the desktop
    }
    console.log("Welcome to the Horde!");
    /*document.getElementById('login-screen').classList.add('hidden');
    document.getElementById('desktop').classList.remove('hidden');
    loadUserData(); // Pick up where they left off */
}

async function handleSignOut() {
    await db.auth.signOut();
    location.reload(); // Returns to login screen
}

//Data Persistence (Supabase Database) --> added March 19, 2026
async function saveToCloud() {
    const content = document.getElementById('journal-editor').value;

    const { error } = await db.from('user_data').upsert({ 
        user_id: currentUser.id, 
        journal_content: content,
        settings: { bgColor: document.getElementById('desktop').style.backgroundColor }
    });

    if (error) alert("Error etching to cloud: " + error.message);
    else alert("Progress saved to the Horde archives!");
}

async function loadUserData() {
    const { data, error } = await db.from('user_data').select('*').eq('user_id', currentUser.id).single();
    if (data) {
        document.getElementById('journal-editor').value = data.journal_content || "";
        if (data.settings && data.settings.bgColor) {
            document.getElementById('desktop').style.backgroundColor = data.settings.bgColor;
        }
    }
}

// 1. Clock, Weather, and Date Logic
function updateDashboard() {
    const now = new Date();
    document.getElementById('clock').innerText = now.toLocaleTimeString();
    
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    let dateStr = now.toLocaleDateString('en-US', options).toUpperCase();
    
    const day = now.getDate();
    let suffix = "TH";
    if (day === 1 || day === 21 || day === 31) suffix = "ST";
    else if (day === 2 || day === 22) suffix = "ND";
    else if (day === 3 || day === 23) suffix = "RD";
    
    dateStr = dateStr.replace(day, day + suffix);
    document.getElementById('date-display').innerText = dateStr;
}
setInterval(updateDashboard, 1000);
updateDashboard();

// Movable Element Logic
function dragElement(elmnt) {
    let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
    elmnt.onmousedown = dragMouseDown;

    function dragMouseDown(e) {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT' || e.target.tagName === 'BUTTON') return;
        e.preventDefault();
        pos3 = e.clientX;
        pos4 = e.clientY;
        document.onmouseup = closeDragElement;
        document.onmousemove = elementDrag;
    }

    function elementDrag(e) {
        e.preventDefault();
        pos1 = pos3 - e.clientX;
        pos2 = pos4 - e.clientY;
        pos3 = e.clientX;
        pos4 = e.clientY;

        let newTop = elmnt.offsetTop - pos2;
        let newLeft = elmnt.offsetLeft - pos1;

        if (newTop < 0) newTop = 0;
        if (newLeft < 0) newLeft = 0;

        elmnt.style.top = newTop + "px";
        elmnt.style.left = newLeft + "px";
    }

    function closeDragElement() {
        document.onmouseup = null;
        document.onmousemove = null;
    }
}

// Browser Search Bar Logic
function launchSite() {
    let url = document.getElementById('browser-url').value;
    if (!url) return;
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = 'https://' + url;
    }
    window.open(url, '_blank');
}

// Journal Logic
function checkWordCount() {
    const text = document.getElementById('journal-editor').value;
    const words = text.trim().split(/\s+/).filter(item => item).length;
    document.getElementById('word-count').innerText = `${words} / 1000 words`;
    if (words > 1000) alert("You have reached the 1000 word limit!");
}

/*function saveJournal() {
    const content = document.getElementById('journal-editor').value;
    localStorage.setItem('orcOS_journal', content);
    alert("Journal entry etched into storage!");
}*/

// Updated Save Function to use Supabase
async function saveJournal() {
    const content = document.getElementById('journal-editor').value;
    
    // Check if user is logged in first
    const { data: { user } } = await db.auth.getUser();
    
    if (!user) {
        // Fallback to local storage if not logged in
        localStorage.setItem('orcOS_journal', content);
        alert("Not logged in. Progress saved locally to this browser only.");
        return;
    }

    // Save to Supabase 'user_data' table
    const { error } = await db
        .from('user_data')
        .upsert({ 
            user_id: user.id, 
            journal_content: content,
            last_updated: new Date() 
        });

    if (error) {
        console.error("Cloud save failed:", error);
        alert("Failed to etch into the cloud archives.");
    } else {
        alert("Journal entry synced to your account in the cloud!");
    }
}

// Function to load data when the app opens
async function openApp(id) {
    document.getElementById(id).classList.remove('hidden');
    
    if (id === 'app-journal') {
        const { data: { user } } = await db.auth.getUser();
        
        if (user) {
            const { data } = await db
                .from('user_data')
                .select('journal_content')
                .eq('user_id', user.id)
                .single();
            
            if (data) document.getElementById('journal-editor').value = data.journal_content;
        } else {
            const saved = localStorage.getItem('orcOS_journal');
            if (saved) document.getElementById('journal-editor').value = saved;
        }
    }
}

function confirmClose(id) {
    if (confirm("Your document will be lost if you do not save. Are you sure?")) closeApp(id);
}

function updateJournalStyle() {
    const editor = document.getElementById('journal-editor');
    editor.style.fontSize = document.getElementById('journal-font-size').value;
    editor.style.fontFamily = document.getElementById('journal-font-family').value;
}

// Settings Logic
function updateSetting(type, value) {
    if (type === 'bg') document.getElementById('desktop').style.backgroundColor = value;
    if (type === 'taskbar') document.getElementById('taskbar').style.background = value;
    if (type === 'align') {
        const dash = document.getElementById('dashboard');
        dash.style.left = value === 'left' ? '20px' : (value === 'center' ? '40%' : 'auto');
        dash.style.right = value === 'right' ? '20px' : 'auto';
        dash.style.textAlign = value;
    }
}

function uploadBackground(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => document.getElementById('desktop').style.backgroundImage = `url(${e.target.result})`;
        reader.readAsDataURL(file);
    }
}

function closeApp(id) { document.getElementById(id).classList.add('hidden'); }

// --- Mascot & Character Logic ---

// Jemma Logic
document.getElementById('mascot').addEventListener('click', () => {
    alert("Hi, I'm Jemma! I'm the mascot of orcOS! Welcome to the horde!");
});

// Lara Barnes Logic
const laraBarnes = document.getElementById('lara-barnes');
if (laraBarnes) {
    laraBarnes.addEventListener('click', () => {
        alert("Hey! Lara Barnes here! I'm an elf working for the orcOS Times! Got something in mind? Write it down in 'Journal'!");
    });
}

// Justin Dragon Logic
const justinDragon = document.getElementById('justin-dragon');
if (justinDragon) {
    justinDragon.addEventListener('click', () => {
        alert("Justin Dragon is my name! Settings is my game! I can fix it for you!");
    });
}

// Automatically detect when a user returns from a confirmation email --> March 19, 2026
db.auth.onAuthStateChange((event, session) => {
  if (event === 'SIGNED_IN' && session) {
    console.log("Member verified!");
    currentUser = session.user;
    
    // Hide your login screen and show the desktop
    document.getElementById('login-screen').classList.add('hidden'); 
    document.getElementById('desktop').classList.remove('hidden');
    
    // Load their saved settings
    loadUserData();
  }
});
