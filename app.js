// Initialize Supabase Client
//const _supabaseUrl = 'https://ovjimwuszbumvbdvvgqa.supabase.co';
//const _supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im92amltd3VzemJ1bXZiZHZ2Z3FhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIxMjg2ODMsImV4cCI6MjA4NzcwNDY4M30.3cyON8YKHiq4m873YV_QxVE-uT4daGfJ7aXnzWfN7Gw';
//const db = supabase.createClient(_supabaseUrl, _supabaseKey);

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

/**
 * EDUPATH — app.js
 * East Harlem Student Learning Platform
 * Handles: navigation, grade tracking, learning activities,
 *          quiz engine, scheduling modal, progress persistence,
 *          toast notifications, confetti rewards
 */

'use strict';

/* ============================================================
   STATE
   ============================================================ */
const STATE = {
  currentPanel: 'dashboard',
  selectedGrade: '9',
  selectedSubject: null,
  activityIndex: 0,
  streak: 0,
  completedLessons: 0,
  passedQuizzes: 0,
  credits: 4.5,
  quiz: {
    active: null,       // quiz key
    questions: [],
    currentQ: 0,
    score: 0,
    answered: false,
  }
};

/* ============================================================
   CONTENT DATABASE
   ============================================================ */

const ACTIVITIES = {
  ela: [
    {
      title: '📖 What Is a Theme?',
      html: `
        <h3>What Is a Theme?</h3>
        <p>A <strong>theme</strong> is the big idea or message in a story. It's what the author wants you to think about after you finish reading.</p>
        <p>Example: In <em>The Outsiders</em> by S.E. Hinton, one theme is that <strong>family can be found outside your blood relatives</strong>.</p>
        <p>How to find a theme:</p>
        <p>1. Ask: what does the main character learn by the end?<br>
           2. Look for repeated ideas or symbols.<br>
           3. Think about how the conflict is resolved.</p>
        <p>Try it: Think of a movie or book you love. What's its theme?</p>
      `
    },
    {
      title: '📝 Main Idea vs. Details',
      html: `
        <h3>Main Idea vs. Supporting Details</h3>
        <p>The <strong>main idea</strong> is what a paragraph is mostly about. The <strong>supporting details</strong> are facts, examples, or reasons that explain the main idea.</p>
        <p><em>Example paragraph:</em><br>
        "East Harlem has been home to many Latino communities since the 1950s. Puerto Rican families brought their food, music, and traditions. Today, El Barrio celebrates this heritage through street murals and festivals."</p>
        <p>🟡 Main idea: East Harlem has a strong Latino cultural heritage.<br>
        🔵 Detail: Puerto Rican families brought food, music, and traditions.<br>
        🔵 Detail: Street murals and festivals celebrate this heritage.</p>
        <p>Tip: The main idea is usually in the first or last sentence of a paragraph.</p>
      `
    },
    {
      title: '✍️ Writing a Topic Sentence',
      html: `
        <h3>Writing a Strong Topic Sentence</h3>
        <p>Every paragraph starts with a <strong>topic sentence</strong> that tells the reader what the paragraph is about. A good topic sentence is:</p>
        <p>✅ Specific — not too broad<br>
           ✅ Arguable — it makes a point<br>
           ✅ One sentence — clear and direct</p>
        <p>Weak: "Sports are good."<br>
        Strong: "Playing team sports teaches teenagers how to communicate under pressure."</p>
        <p>Practice: Write a topic sentence about your neighborhood or school.</p>
      `
    }
  ],

  math: [
    {
      title: '🔢 Understanding Fractions',
      html: `
        <h3>What Is a Fraction?</h3>
        <p>A fraction represents a <strong>part of a whole</strong>. It's written as:</p>
        <p style="text-align:center; font-size:1.4rem; font-weight:700;">numerator / denominator</p>
        <p>The <strong>numerator</strong> = how many parts you have.<br>
           The <strong>denominator</strong> = total parts the whole is divided into.</p>
        <p>Example: If you eat 3 slices of an 8-slice pizza → you ate <strong>3/8</strong> of the pizza.</p>
        <p>Remember: The bigger the denominator, the <em>smaller</em> each piece is. 1/8 is smaller than 1/2!</p>
      `
    },
    {
      title: '➕ Adding Fractions',
      html: `
        <h3>Adding Fractions — Same Denominator</h3>
        <p>When fractions have the <strong>same denominator</strong>, just add the numerators:</p>
        <p style="font-size:1.3rem; font-weight:700; color: #f5c842;">2/7 + 3/7 = 5/7</p>
        <p>Keep the denominator the same. Done!</p>
        <h3 style="margin-top:1rem;">Adding Fractions — Different Denominators</h3>
        <p>Find the <strong>Least Common Denominator (LCD)</strong> first.</p>
        <p>Example: 1/4 + 1/3<br>
        LCD of 4 and 3 = 12<br>
        → 3/12 + 4/12 = <strong>7/12</strong></p>
        <p>Steps: (1) Find LCD, (2) Convert fractions, (3) Add numerators.</p>
      `
    },
    {
      title: '✖️ Multiplying Fractions',
      html: `
        <h3>Multiplying Fractions</h3>
        <p>Multiplying fractions is actually the <em>easiest</em> operation — no common denominator needed!</p>
        <p style="font-size:1.2rem; font-weight:700; color: #f5c842;">Multiply straight across:<br>numerator × numerator / denominator × denominator</p>
        <p>Example: 2/3 × 3/5 = (2×3) / (3×5) = <strong>6/15</strong> = <strong>2/5</strong> (simplified)</p>
        <p>Always simplify by dividing both numbers by their GCF (Greatest Common Factor).</p>
      `
    }
  ],

  science: [
    {
      title: '🌿 What Is an Ecosystem?',
      html: `
        <h3>What Is an Ecosystem?</h3>
        <p>An <strong>ecosystem</strong> is all the living things (plants, animals, fungi, bacteria) in an area <em>plus</em> the non-living things (water, soil, sunlight, air) they interact with.</p>
        <p>Types of ecosystems: forests, oceans, deserts, wetlands, cities!</p>
        <p>👉 Did you know? Central Park in Manhattan is a functioning urban ecosystem. Birds, insects, fungi, and plants all live there together — even in the middle of one of the world's biggest cities.</p>
        <p><strong>Producers</strong> (plants) → <strong>Consumers</strong> (animals) → <strong>Decomposers</strong> (fungi/bacteria)</p>
      `
    },
    {
      title: '🔗 Food Chains & Food Webs',
      html: `
        <h3>Food Chains & Food Webs</h3>
        <p>A <strong>food chain</strong> shows who eats who in a straight line:</p>
        <p style="font-size:1.1rem; font-weight:700;">☀️ Sun → 🌿 Grass → 🐛 Caterpillar → 🐦 Bird → 🦅 Hawk</p>
        <p>Energy moves from the sun through each level. At each step, about <strong>90% of energy is lost</strong> as heat — that's why there are fewer hawks than caterpillars.</p>
        <p>A <strong>food web</strong> connects many food chains together. It shows the real complexity of nature, where most animals eat more than one thing.</p>
      `
    },
    {
      title: '♻️ The Carbon Cycle',
      html: `
        <h3>The Carbon Cycle</h3>
        <p>Carbon is the building block of all life on Earth. It moves between the atmosphere, living things, and the earth in a <strong>cycle</strong>.</p>
        <p>🌱 Plants absorb CO₂ from the air during <strong>photosynthesis</strong>.<br>
           🐄 Animals eat plants and release CO₂ through <strong>respiration</strong>.<br>
           🔥 Burning fossil fuels releases stored carbon into the atmosphere.<br>
           🌊 Oceans absorb CO₂ from the air.</p>
        <p>Human activity (burning coal, gas, forests) is releasing carbon faster than nature can absorb it — causing climate change.</p>
      `
    }
  ],

  social: [
    {
      title: '🏙️ The History of East Harlem',
      html: `
        <h3>East Harlem: El Barrio</h3>
        <p><strong>East Harlem</strong> (also called <em>El Barrio</em> or Spanish Harlem) is a neighborhood in northeastern Manhattan. It has been shaped by wave after wave of immigrants seeking a better life in New York City.</p>
        <p>📅 <strong>Early 1900s</strong>: Italian and Jewish immigrants settle in East Harlem.<br>
           📅 <strong>1940s–60s</strong>: Puerto Rican families arrive during the "Great Migration," making El Barrio a center of Latino culture.<br>
           📅 <strong>1970s–80s</strong>: Economic decline and disinvestment hits the neighborhood.<br>
           📅 <strong>Today</strong>: A diverse, resilient community working to preserve its identity while facing gentrification.</p>
        <p>The neighborhood is home to the <strong>Museum of the City of New York</strong> and the famous <strong>La Marqueta</strong> (market).</p>
      `
    },
    {
      title: '🗳️ How Local Government Works',
      html: `
        <h3>How NYC Government Affects Your Life</h3>
        <p>New York City has its own government separate from the state and federal governments. Here's who represents you:</p>
        <p>🏛️ <strong>City Council</strong>: 51 members who make local laws. Your council member represents your district.<br>
           👔 <strong>Mayor</strong>: Runs the city, controls the budget (over $100 billion/year).<br>
           📚 <strong>Chancellor of Education</strong>: Runs NYC public schools — the largest district in the U.S.<br>
           👮 <strong>Police Commissioner</strong>: Oversees the NYPD.</p>
        <p>Local decisions affect your school budget, parks, housing, and public safety. Voting and community organizing are how residents make their voices heard.</p>
      `
    },
    {
      title: '✊ The Civil Rights Movement',
      html: `
        <h3>The Civil Rights Movement (1954–1968)</h3>
        <p>The Civil Rights Movement was a fight to end racial segregation and discrimination against Black Americans in the United States.</p>
        <p>Key moments:<br>
        📌 <strong>1954</strong>: <em>Brown v. Board of Education</em> — Supreme Court rules segregated schools are unconstitutional.<br>
        📌 <strong>1955</strong>: Rosa Parks refuses to give up her bus seat in Montgomery, Alabama.<br>
        📌 <strong>1963</strong>: Dr. Martin Luther King Jr. delivers "I Have a Dream" at the March on Washington.<br>
        📌 <strong>1964</strong>: Civil Rights Act signed, banning discrimination based on race, color, religion, or national origin.<br>
        📌 <strong>1965</strong>: Voting Rights Act passed.</p>
        <p>The movement used <strong>nonviolent protest</strong> — marches, sit-ins, boycotts — to change unjust laws.</p>
      `
    }
  ],

  literacy: [
    {
      title: '🔤 Sight Words — Level 1',
      html: `
        <h3>Sight Words</h3>
        <p>Sight words are the most common words in the English language. We memorize them on sight — we don't sound them out. Tap each word to practice!</p>
        <div style="display:flex;flex-wrap:wrap;gap:8px;margin-top:16px;">
          <span class="word-card" tabindex="0" role="button" aria-label="the">the</span>
          <span class="word-card" tabindex="0" role="button" aria-label="and">and</span>
          <span class="word-card" tabindex="0" role="button" aria-label="is">is</span>
          <span class="word-card" tabindex="0" role="button" aria-label="you">you</span>
          <span class="word-card" tabindex="0" role="button" aria-label="that">that</span>
          <span class="word-card" tabindex="0" role="button" aria-label="he">he</span>
          <span class="word-card" tabindex="0" role="button" aria-label="was">was</span>
          <span class="word-card" tabindex="0" role="button" aria-label="for">for</span>
          <span class="word-card" tabindex="0" role="button" aria-label="on">on</span>
          <span class="word-card" tabindex="0" role="button" aria-label="are">are</span>
        </div>
        <p style="margin-top:16px; font-size:0.85rem; color: #a89fd8;">Tap a word to hear it. Practice until you know them all by heart.</p>
      `
    },
    {
      title: '🔊 Vowel Sounds — Short vs. Long',
      html: `
        <h3>Short Vowels vs. Long Vowels</h3>
        <p>Every vowel (A, E, I, O, U) has two sounds: <strong>short</strong> and <strong>long</strong>.</p>
        <p><strong>Short A</strong> = "cat" 🐱 &nbsp;&nbsp; <strong>Long A</strong> = "cake" 🎂</p>
        <p><strong>Short E</strong> = "bed" 🛏️ &nbsp;&nbsp; <strong>Long E</strong> = "tree" 🌳</p>
        <p><strong>Short I</strong> = "sit" 💺 &nbsp;&nbsp; <strong>Long I</strong> = "bike" 🚲</p>
        <p><strong>Short O</strong> = "hot" 🌡️ &nbsp;&nbsp; <strong>Long O</strong> = "bone" 🦴</p>
        <p><strong>Short U</strong> = "cup" ☕ &nbsp;&nbsp; <strong>Long U</strong> = "cube" 🧊</p>
        <p>Tip: When a word ends in a silent "e" (like <em>cake</em>, <em>bike</em>), the vowel before it is usually <strong>long</strong>!</p>
      `
    },
    {
      title: '📚 Reading Comprehension — The 5Ws',
      html: `
        <h3>Understanding What You Read: The 5 Ws</h3>
        <p>When you finish reading any text, ask yourself these 5 questions:</p>
        <p>❓ <strong>Who</strong> — Who is the story about?<br>
           ❓ <strong>What</strong> — What happened?<br>
           ❓ <strong>Where</strong> — Where did it happen?<br>
           ❓ <strong>When</strong> — When did it happen?<br>
           ❓ <strong>Why</strong> — Why did it happen? (This is the hardest one!)</p>
        <p>Practice: Read the following and answer the 5 Ws:<br><br>
        <em>"Maria ran to school on Monday morning because she forgot her science project at home and class started in five minutes."</em></p>
      `
    }
  ],

  health: [
    {
      title: '🧠 Managing Stress',
      html: `
        <h3>Understanding and Managing Stress</h3>
        <p><strong>Stress</strong> is what you feel when you have too many demands on your time, energy, or emotions. It's completely normal — but learning to manage it is a life skill.</p>
        <p>Signs of stress: headaches, trouble sleeping, feeling irritable, difficulty concentrating.</p>
        <p>Healthy ways to manage stress:<br>
        🏃 Physical activity — even a 10-minute walk helps.<br>
        🫁 Deep breathing — breathe in for 4 counts, hold for 4, out for 4.<br>
        🗣️ Talk to someone you trust — a friend, family member, or counselor.<br>
        📓 Write in a journal — get your thoughts out of your head.<br>
        😴 Sleep — 8–10 hours for teenagers is not optional, it's essential.</p>
      `
    },
    {
      title: '🥗 Nutrition Basics',
      html: `
        <h3>Fueling Your Brain & Body</h3>
        <p>What you eat affects how well you learn, how you feel, and how much energy you have.</p>
        <p><strong>Your plate should include:</strong><br>
        🌾 <strong>Grains</strong> (rice, bread, oats) — energy<br>
        🥦 <strong>Vegetables</strong> — vitamins and fiber<br>
        🍎 <strong>Fruits</strong> — natural sugars and vitamins<br>
        🍗 <strong>Protein</strong> (beans, chicken, eggs) — builds muscles and brain cells<br>
        🥛 <strong>Dairy or alternatives</strong> — calcium for bones</p>
        <p>💡 Brain food tip: Eating breakfast improves test scores. Oatmeal, eggs, and fruit are great options.</p>
        <p>Remember: If food access is a challenge at home, talk to your school counselor — free meals and food programs are available.</p>
      `
    },
    {
      title: '😴 Why Sleep Matters',
      html: `
        <h3>Sleep: Your Brain's Reset Button</h3>
        <p>While you sleep, your brain does critical work: it processes what you learned, clears waste products, and restores energy. <strong>Sleep is not lazy — it's productive.</strong></p>
        <p>Teens need <strong>8–10 hours</strong> per night. Most get far less.</p>
        <p>What happens when you don't sleep enough?<br>
        ❌ Worse memory and test performance<br>
        ❌ Harder to control emotions<br>
        ❌ More likely to get sick<br>
        ❌ Increased risk of anxiety and depression</p>
        <p>Tips for better sleep:<br>
        ✅ Put your phone away 30 min before bed<br>
        ✅ Keep a consistent sleep schedule — even on weekends<br>
        ✅ Keep your room cool and dark if possible</p>
      `
    }
  ]
};

/* ─── QUIZ DATA ─────────────────────────────────────────── */
const QUIZZES = {
  ela: {
    title: '📖 ELA — Reading Comprehension',
    questions: [
      {
        q: 'What is the "theme" of a story?',
        options: ['The setting of the story', 'The big idea or message the author wants to share', 'The name of the main character', 'The first paragraph of the story'],
        answer: 1
      },
      {
        q: 'Where is the main idea of a paragraph usually found?',
        options: ['In the middle of the paragraph', 'Only in diagrams and images', 'In the first or last sentence', 'In the title of the book'],
        answer: 2
      },
      {
        q: 'Which is a strong topic sentence?',
        options: ['Dogs are nice.', 'This paragraph is about sports.', 'Playing team sports teaches teenagers to communicate under pressure.', 'I like to write essays.'],
        answer: 2
      },
      {
        q: 'What are "supporting details"?',
        options: ['Sentences that confuse the reader', 'The title and author of a book', 'Facts, examples, or reasons that explain the main idea', 'Words the teacher told you to memorize'],
        answer: 2
      },
      {
        q: 'In the paragraph about East Harlem, what was the MAIN IDEA?',
        options: ['East Harlem has street festivals.', 'East Harlem has a strong Latino cultural heritage.', 'Puerto Rican families moved to New York.', 'Murals are a form of art.'],
        answer: 1
      }
    ]
  },

  math: {
    title: '🔢 Math — Fractions',
    questions: [
      {
        q: 'In the fraction 3/8, what does the 8 represent?',
        options: ['How many parts you have', 'The answer to the problem', 'The total number of equal parts the whole is divided into', 'The number 8'],
        answer: 2
      },
      {
        q: 'What is 2/7 + 3/7?',
        options: ['5/14', '5/7', '6/7', '1/2'],
        answer: 1
      },
      {
        q: 'To add 1/4 + 1/3, what do you find FIRST?',
        options: ['The product of the fractions', 'The difference of the numerators', 'The Least Common Denominator (LCD)', 'The average of the denominators'],
        answer: 2
      },
      {
        q: 'What is 2/3 × 3/5?',
        options: ['5/8', '6/15', '1/3', '2/5'],
        answer: 1
      },
      {
        q: 'Which fraction is SMALLER?',
        options: ['1/2', '1/8', '1/3', '1/4'],
        answer: 1
      }
    ]
  },

  science: {
    title: '🔬 Science — Ecosystems',
    questions: [
      {
        q: 'What is an ecosystem?',
        options: ['Only the plants in an area', 'A type of weather system', 'All living things in an area PLUS the non-living things they interact with', 'A list of animals in a zoo'],
        answer: 2
      },
      {
        q: 'What is the role of PRODUCERS in a food chain?',
        options: ['They eat other animals', 'They break down dead organisms', 'They use sunlight to make food (plants)', 'They control the weather'],
        answer: 2
      },
      {
        q: 'In a food chain, about how much energy is LOST at each step?',
        options: ['10%', '50%', '75%', '90%'],
        answer: 3
      },
      {
        q: 'What happens during PHOTOSYNTHESIS in the carbon cycle?',
        options: ['Animals release CO₂', 'Plants absorb CO₂ from the air', 'Fossil fuels are burned', 'Oceans evaporate'],
        answer: 1
      },
      {
        q: 'A food WEB is different from a food chain because…',
        options: ['It only shows plants', 'It connects many food chains and shows complex relationships', 'It shows only one animal eating one plant', 'It measures temperature'],
        answer: 1
      }
    ]
  },

  social: {
    title: '🌎 Social Studies — NYC History',
    questions: [
      {
        q: 'What is another name for East Harlem?',
        options: ['The Bronx', 'El Barrio', 'Little Italy', 'Midtown'],
        answer: 1
      },
      {
        q: 'Which group of immigrants made El Barrio a center of Latino culture starting in the 1940s?',
        options: ['Italian immigrants', 'Dominican immigrants', 'Puerto Rican families', 'Irish immigrants'],
        answer: 2
      },
      {
        q: 'How many members does the NYC City Council have?',
        options: ['12', '25', '51', '100'],
        answer: 2
      },
      {
        q: 'The Civil Rights Act of 1964 banned discrimination based on…',
        options: ['Height and weight', 'Race, color, religion, or national origin', 'Age and job title', 'Income level only'],
        answer: 1
      },
      {
        q: 'What Supreme Court case ruled that racially segregated schools were unconstitutional?',
        options: ['Roe v. Wade', 'Miranda v. Arizona', 'Brown v. Board of Education', 'Marbury v. Madison'],
        answer: 2
      }
    ]
  },

  literacy: {
    title: '🔤 Reading Bridge — Sight Words & Phonics',
    questions: [
      {
        q: 'Which word has a LONG vowel sound?',
        options: ['cat', 'sit', 'cake', 'hot'],
        answer: 2
      },
      {
        q: 'Sight words are best learned by…',
        options: ['Sounding out every letter slowly', 'Memorizing them on sight', 'Writing them in a different language', 'Skipping them while reading'],
        answer: 1
      },
      {
        q: 'When a word ends in a silent "e" (like "bike"), the vowel before it is usually…',
        options: ['Silent', 'Short', 'Long', 'Missing'],
        answer: 2
      },
      {
        q: 'The "5 Ws" of reading comprehension are: Who, What, Where, When, and…',
        options: ['Which', 'Whether', 'Why', 'Wow'],
        answer: 2
      },
      {
        q: 'In "Maria ran to school on Monday," WHEN did this happen?',
        options: ['At school', 'On Monday morning', 'Because of her project', 'In five minutes'],
        answer: 1
      }
    ]
  }
};

/* ============================================================
   UTILITY HELPERS
   ============================================================ */

function loadState() {
  try {
    const saved = localStorage.getItem('edupath_state');
    if (saved) {
      const parsed = JSON.parse(saved);
      Object.assign(STATE, parsed);
      STATE.quiz = { active: null, questions: [], currentQ: 0, score: 0, answered: false };
    }
  } catch (e) { /* localStorage may be unavailable */ }
}

function saveState() {
  try {
    const toSave = {
      selectedGrade: STATE.selectedGrade,
      streak: STATE.streak,
      completedLessons: STATE.completedLessons,
      passedQuizzes: STATE.passedQuizzes,
      credits: STATE.credits,
    };
    localStorage.setItem('edupath_state', JSON.stringify(toSave));
  } catch (e) { /* silent */ }
}

function showToast(message, duration = 2800) {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = message;
  toast.hidden = false;
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => { toast.hidden = true; }, duration);
}

function spawnConfetti(container) {
  const colors = ['#f5c842', '#ff6b35', '#a78bfa', '#34d399', '#60a5fa', '#fb7185'];
  for (let i = 0; i < 40; i++) {
    const piece = document.createElement('div');
    piece.className = 'confetti-piece';
    piece.style.left = Math.random() * 100 + '%';
    piece.style.background = colors[Math.floor(Math.random() * colors.length)];
    piece.style.animationDelay = (Math.random() * 1.2) + 's';
    piece.style.animationDuration = (1.5 + Math.random()) + 's';
    piece.style.borderRadius = Math.random() > 0.5 ? '50%' : '2px';
    container.appendChild(piece);
  }
  setTimeout(() => { container.innerHTML = ''; }, 3000);
}

function updateDashboardStats() {
  const streakEl = document.getElementById('streak-count');
  const statComp = document.getElementById('stat-completed');
  const statQuiz  = document.getElementById('stat-quizzes');
  const statCred  = document.getElementById('stat-credits');
  if (streakEl) streakEl.textContent = STATE.streak;
  if (statComp) statComp.textContent = STATE.completedLessons;
  if (statQuiz)  statQuiz.textContent  = STATE.passedQuizzes;
  if (statCred)  statCred.textContent  = STATE.credits;
}

/* ============================================================
   PANEL NAVIGATION
   ============================================================ */

function switchPanel(panelId) {
  // Hide all panels
  document.querySelectorAll('.panel').forEach(p => {
    p.classList.remove('active');
    p.hidden = true;
  });

  // Show target
  const target = document.getElementById(`panel-${panelId}`);
  if (target) {
    target.classList.add('active');
    target.hidden = false;
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  // Update nav button states — top + bottom
  document.querySelectorAll('.nav-btn, .bnav-btn').forEach(btn => {
    const isActive = btn.dataset.panel === panelId;
    btn.classList.toggle('active', isActive);
    btn.setAttribute('aria-current', isActive ? 'page' : 'false');
  });

  STATE.currentPanel = panelId;

  // Reset sub-views when re-entering panels
  if (panelId === 'learn') resetLearnPanel();
  if (panelId === 'quiz')  resetQuizPanel();
}

/* Delegate all [data-panel] button clicks */
document.addEventListener('click', e => {
  const btn = e.target.closest('[data-panel]');
  if (btn) switchPanel(btn.dataset.panel);
});

/* ============================================================
   GRADE SELECTOR
   ============================================================ */

document.querySelectorAll('.grade-chip').forEach(chip => {
  chip.addEventListener('click', () => {
    document.querySelectorAll('.grade-chip').forEach(c => c.classList.remove('active'));
    chip.classList.add('active');
    STATE.selectedGrade = chip.dataset.grade;
    saveState();
    showToast(`Grade set to ${chip.textContent} 🎒`);
  });
});

/* ============================================================
   LEARN PANEL
   ============================================================ */

function resetLearnPanel() {
  const viewer = document.getElementById('activity-viewer');
  const grid   = document.querySelector('.subject-grid');
  if (viewer) viewer.hidden = true;
  if (grid)   grid.hidden   = false;
  STATE.selectedSubject = null;
  STATE.activityIndex = 0;
}

function loadActivity(subject, index) {
  const acts = ACTIVITIES[subject];
  if (!acts) return;
  const act = acts[index];
  if (!act) return;

  const content = document.getElementById('activity-content');
  const counter = document.getElementById('activity-counter');
  const completionZone = document.getElementById('completion-zone');
  const nextBtn = document.getElementById('next-activity');
  const prevBtn = document.getElementById('prev-activity');

  if (content) content.innerHTML = act.html;
  if (counter) counter.textContent = `${index + 1} / ${acts.length}`;
  if (completionZone) completionZone.hidden = true;

  // Word card tap interaction
  content && content.querySelectorAll('.word-card').forEach(wc => {
    wc.addEventListener('click', () => {
      wc.style.background = 'rgba(52,211,153,0.25)';
      wc.style.borderColor = '#34d399';
      wc.style.color = '#34d399';
      setTimeout(() => {
        wc.style.background = '';
        wc.style.borderColor = '';
        wc.style.color = '';
      }, 800);
    });
  });

  if (prevBtn) prevBtn.disabled = index === 0;
  if (nextBtn) {
    if (index === acts.length - 1) {
      nextBtn.textContent = 'Complete Lesson ✅';
    } else {
      nextBtn.textContent = 'Next →';
    }
  }
}

document.querySelectorAll('.subject-card').forEach(card => {
  card.addEventListener('click', () => {
    const subject = card.dataset.subject;
    STATE.selectedSubject = subject;
    STATE.activityIndex = 0;

    const viewer = document.getElementById('activity-viewer');
    const grid   = document.querySelector('.subject-grid');
    if (grid)   grid.hidden   = true;
    if (viewer) viewer.hidden = false;

    loadActivity(subject, 0);
  });
});

document.getElementById('back-to-subjects')?.addEventListener('click', resetLearnPanel);

document.getElementById('next-activity')?.addEventListener('click', () => {
  const subject = STATE.selectedSubject;
  const acts = ACTIVITIES[subject] || [];
  if (STATE.activityIndex < acts.length - 1) {
    STATE.activityIndex++;
    loadActivity(subject, STATE.activityIndex);
  } else {
    // Lesson complete!
    const completionZone = document.getElementById('completion-zone');
    const confettiArea   = document.getElementById('confetti-area');
    if (completionZone) completionZone.hidden = false;
    if (confettiArea)   spawnConfetti(confettiArea);
    STATE.completedLessons++;
    STATE.streak = Math.min(STATE.streak + 1, 999);
    updateDashboardStats();
    saveState();
    showToast('🎉 Lesson complete! Great work!');
  }
});

document.getElementById('prev-activity')?.addEventListener('click', () => {
  if (STATE.activityIndex > 0) {
    STATE.activityIndex--;
    loadActivity(STATE.selectedSubject, STATE.activityIndex);
  }
});

/* ============================================================
   QUIZ ENGINE
   ============================================================ */

function resetQuizPanel() {
  const selector = document.getElementById('quiz-selector');
  const arena    = document.getElementById('quiz-arena');
  const result   = document.getElementById('quiz-result');
  const qCard    = document.getElementById('question-card');
  if (selector) selector.hidden = false;
  if (arena)    arena.hidden    = true;
  if (result)   result.hidden   = true;
  if (qCard)    qCard.hidden    = false;
  STATE.quiz = { active: null, questions: [], currentQ: 0, score: 0, answered: false };
}

function startQuiz(quizKey) {
  const quizData = QUIZZES[quizKey];
  if (!quizData) return;
  STATE.quiz.active    = quizKey;
  STATE.quiz.questions = shuffleArray([...quizData.questions]);
  STATE.quiz.currentQ  = 0;
  STATE.quiz.score     = 0;
  STATE.quiz.answered  = false;

  document.getElementById('quiz-selector').hidden = true;
  document.getElementById('quiz-arena').hidden    = false;
  document.getElementById('quiz-result').hidden   = true;
  document.getElementById('question-card').hidden  = false;

  const titleEl = document.getElementById('quiz-title-display');
  if (titleEl) titleEl.textContent = quizData.title;

  renderQuestion();
}

function shuffleArray(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function renderQuestion() {
  const { questions, currentQ } = STATE.quiz;
  const q = questions[currentQ];
  if (!q) return;

  document.getElementById('question-num').textContent = `Question ${currentQ + 1} of ${questions.length}`;
  document.getElementById('quiz-score-display').textContent = `Q ${currentQ + 1}/${questions.length}`;
  document.getElementById('question-text').textContent = q.q;

  const grid = document.getElementById('answer-grid');
  grid.innerHTML = '';

  q.options.forEach((opt, i) => {
    const btn = document.createElement('button');
    btn.className = 'answer-btn';
    btn.textContent = opt;
    btn.setAttribute('aria-label', `Answer option: ${opt}`);
    btn.addEventListener('click', () => handleAnswer(i, q.answer, btn));
    grid.appendChild(btn);
  });

  const feedbackEl = document.getElementById('feedback-msg');
  feedbackEl.hidden = true;
  feedbackEl.className = 'feedback-msg';

  document.getElementById('next-question').hidden = true;
  STATE.quiz.answered = false;
}

function handleAnswer(selected, correct, clickedBtn) {
  if (STATE.quiz.answered) return;
  STATE.quiz.answered = true;

  const allBtns = document.querySelectorAll('.answer-btn');
  allBtns.forEach(b => b.disabled = true);

  const feedbackEl = document.getElementById('feedback-msg');
  const isCorrect = selected === correct;

  if (isCorrect) {
    clickedBtn.classList.add('correct');
    feedbackEl.textContent = '✅ Correct! Great job!';
    feedbackEl.className = 'feedback-msg correct-fb';
    STATE.quiz.score++;
  } else {
    clickedBtn.classList.add('wrong');
    allBtns[correct].classList.add('correct');
    feedbackEl.textContent = `❌ Not quite. The correct answer is: "${STATE.quiz.questions[STATE.quiz.currentQ].options[correct]}"`;
    feedbackEl.className = 'feedback-msg wrong-fb';
  }

  feedbackEl.hidden = false;

  const nextBtn = document.getElementById('next-question');
  nextBtn.hidden = false;

  const isLast = STATE.quiz.currentQ === STATE.quiz.questions.length - 1;
  nextBtn.textContent = isLast ? 'See Results' : 'Next Question';
}

document.getElementById('next-question')?.addEventListener('click', () => {
  const { questions, currentQ } = STATE.quiz;
  if (currentQ < questions.length - 1) {
    STATE.quiz.currentQ++;
    renderQuestion();
  } else {
    showQuizResult();
  }
});

function showQuizResult() {
  const { score, questions, active } = STATE.quiz;
  const total = questions.length;
  const pct = Math.round((score / total) * 100);
  const passed = pct === 100;

  document.getElementById('question-card').hidden = true;
  const resultEl = document.getElementById('quiz-result');
  resultEl.hidden = false;

  document.getElementById('result-icon').textContent      = passed ? '🏆' : '📝';
  document.getElementById('result-score').textContent     = `${score} / ${total} — ${pct}%`;
  document.getElementById('result-headline').textContent  = passed ? 'Perfect Score! You did it!' : 'Almost there — try again!';
  document.getElementById('result-message').textContent   = passed
    ? 'You scored 100%! You\'ve unlocked the next level. Keep that momentum going! 🎉'
    : `You scored ${pct}%. You need 100% to pass and move on. Review the lessons and give it another shot — you\'ve got this!`;

  if (passed) {
    STATE.passedQuizzes++;
    STATE.credits += 0.5;
    updateDashboardStats();
    saveState();

    const confetti = document.createElement('div');
    confetti.className = 'confetti-wrap';
    confetti.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:999;overflow:hidden;';
    document.body.appendChild(confetti);
    spawnConfetti(confetti);
    setTimeout(() => confetti.remove(), 3500);

    showToast('🏆 Quiz passed! +0.5 credit earned!');
  } else {
    showToast(`You scored ${pct}%. Need 100% — keep practicing!`);
  }

  // Style result border
  resultEl.style.borderColor = passed ? 'var(--mint)' : 'var(--coral)';
}

document.getElementById('retry-quiz')?.addEventListener('click', () => {
  if (STATE.quiz.active) startQuiz(STATE.quiz.active);
});

document.querySelectorAll('.quiz-pick').forEach(btn => {
  btn.addEventListener('click', () => startQuiz(btn.dataset.quiz));
});

document.getElementById('back-to-quizzes')?.addEventListener('click', resetQuizPanel);

/* ============================================================
   SCHEDULING MODAL
   ============================================================ */

document.querySelectorAll('.schedule-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const service = btn.dataset.service;
    const labels = {
      tutoring: 'Free Tutoring',
      counseling: 'Mental Health Counseling',
      mentorship: 'Peer Mentorship'
    };
    const modal = document.getElementById('schedule-modal');
    const nameEl = document.getElementById('modal-service-name');
    const successEl = document.getElementById('modal-success');
    const formEl    = document.querySelector('.modal-form');

    if (nameEl) nameEl.textContent = labels[service] || service;
    if (successEl) successEl.hidden = true;
    if (formEl)    formEl.hidden    = false;

    if (modal) {
      modal.hidden = false;
      modal.querySelector('input, select')?.focus();
    }
  });
});

document.getElementById('modal-close')?.addEventListener('click', () => {
  document.getElementById('schedule-modal').hidden = true;
});

document.getElementById('schedule-modal')?.addEventListener('click', e => {
  if (e.target === e.currentTarget) {
    e.currentTarget.hidden = true;
  }
});

document.getElementById('submit-schedule')?.addEventListener('click', () => {
  const nameInput  = document.getElementById('sched-name');
  const gradeInput = document.getElementById('sched-grade');
  const dayInput   = document.getElementById('sched-day');

  if (!nameInput.value.trim() || !gradeInput.value || !dayInput.value) {
    showToast('⚠️ Please fill in your name, grade, and preferred day.');
    return;
  }

  const form    = document.querySelector('.modal-form');
  const success = document.getElementById('modal-success');
  if (form)    form.hidden    = true;
  if (success) success.hidden = false;

  showToast('✅ Session request submitted!');

  // Clear form
  nameInput.value  = '';
  gradeInput.value = '';
  dayInput.value   = '';
  document.getElementById('sched-contact').value = '';
});

/* Close modal on Escape key */
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    const modal = document.getElementById('schedule-modal');
    if (modal && !modal.hidden) modal.hidden = true;
  }
});

/* ============================================================
   TASK CHECKOFF (dashboard to-do list)
   ============================================================ */

document.querySelectorAll('.task-item:not(.done) .task-check').forEach(check => {
  check.style.cursor = 'pointer';
  check.setAttribute('role', 'button');
  check.setAttribute('tabindex', '0');
  check.setAttribute('aria-label', 'Mark task complete');

  const markDone = () => {
    const item = check.closest('.task-item');
    if (!item || item.classList.contains('done')) return;
    item.classList.add('done');
    check.textContent = '✅';
    showToast('Task completed! 🎯');
  };

  check.addEventListener('click', markDone);
  check.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') markDone(); });
});

/* ============================================================
   INIT
   ============================================================ */

function init() {
  loadState();
  updateDashboardStats();

  // Restore grade chip
  const savedChip = document.querySelector(`.grade-chip[data-grade="${STATE.selectedGrade}"]`);
  if (savedChip) {
    document.querySelectorAll('.grade-chip').forEach(c => c.classList.remove('active'));
    savedChip.classList.add('active');
  }

  // Start on dashboard
  switchPanel('dashboard');

  // Restore student name from URL param (optional personalization)
  const params = new URLSearchParams(window.location.search);
  const name = params.get('name');
  if (name) {
    const nameEl = document.getElementById('student-name');
    if (nameEl) nameEl.textContent = name;
  }
}

init();
