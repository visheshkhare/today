// const express = require('express');
// const session = require('express-session');
// const bodyParser = require('body-parser');
// const axios = require('axios');

// const app = express();

// app.use(session({
//   secret: 'your-secret-key', // Change this to a secure random key
//   resave: false,
//   saveUninitialized: true,
// }));

// app.use(bodyParser.urlencoded({ extended: true }));
// app.use(bodyParser.json());

// const apiUrl = 'http://3.82.92.82:8002/api/scheme-data';

// // Middleware to check if the user is logged in
// function requireLogin(req, res, next) {
//   if (req.session.userId) {
//     return next();
//   } else {
//     res.redirect('/login');
//   }
// }

// app.get('/login', (req, res) => {
//   res.send(`
//   <center>
//   <br>
//   <br>
//   <h3> Welcome to Digital Government Scheme Plus </h3>
//     <form action="/login" method="post">
//       <label for="username">Username:</label>
//       <input type="text" id="username" name="username" required>
//       <br>
//       <br>

//       <label for="password">Password:</label>
//       <input type="password" id="password" name="password" required>
//       <br>
//       <br>

//       <button type="submit">Login</button>
//     </form>
//     <center>
//   `);
// });

// app.post('/login', (req, res) => {
//   // For simplicity, you can use a hardcoded username and password
//   const username = req.body.username;
//   const password = req.body.password;

//   if (username === 'admin' && password === 'admin') {
//     req.session.userId = 1; // Use a unique user ID
//     res.redirect('/');
//   } else {
//     res.send('Invalid username or password');
//   }
// });

// app.get('/', requireLogin, async (req, res) => {
//   try {
//     const data = await fetchData();
//     res.send(formatData(data));
//   } catch (error) {
//     res.status(500).send('Internal Server Error');
//   }
// });

// function formatData(data) {
//   return data.map((item, index) => {
//     const eligibilityCriteriaText = extractTextFromStructure(item.eligibilityCriteria.eligibilityDescription);
//     const applicationProcessText = extractTextFromStructure(item.applicationProcess[0].process);

//     return `
//       Scheme ${index + 1}:
//       Eligibility Criteria:
//       ${eligibilityCriteriaText.trim()}

//       Application Process:
//       ${applicationProcessText.trim()}

//       \n
//     `;
//   }).join('\n');
// }

// async function fetchData() {
//   try {
//     const response = await axios.get(apiUrl);
//     const data = response.data;
//     return data;
//   } catch (error) {
//     throw error;
//   }
// }

// function extractTextFromStructure(structure) {
//   if (!structure) {
//     return '';
//   }

//   if (Array.isArray(structure)) {
//     return structure.map((item) => extractTextFromStructure(item)).join('\n');
//   }

//   if (typeof structure === 'object') {
//     if (structure.text) {
//       return structure.text;
//     } else if (structure.children) {
//       return extractTextFromStructure(structure.children);
//     }
//   }

//   return '';
// }

// const port = 3000; 

// app.listen(port, () => {
//   console.log(`Server is running at http://localhost:${port}`);
// });
 


const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const axios = require('axios');
const path = require('path'); 
const app = express();

app.use(session({
  secret: 'your-secret-key', // Change this to a secure random key
  resave: false,
  saveUninitialized: true,
}));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
// app.use(express.static(path.join(__dirname, '..', 'public')));
// app.use(express.static(path.join(__dirname, 'public')));


const apiUrl = 'http://3.82.92.82:8002/api/scheme-data';

// Middleware to check if the user is logged in
function requireLogin(req, res, next) {
  if (req.session.userId) {
    return next();
  } else {
    res.redirect('/login');
  }
}

app.get('/login', (req, res) => {
  res.send(`
    <center>
      <br>
      <br>
      <h3>Welcome to Digital Government Scheme Plus</h3>
      <form action="/login" method="post">
        <label for="username">Username:</label>
        <input type="text" id="username" name="username" required>
        <br>
        <br>
        <label for="password">Password:</label>
        <input type="password" id="password" name="password" required>
        <br>
        <br>
        <button type="submit">Login</button>
      </form>
    <center>
  `);
});

app.post('/login', (req, res) => {
  // For simplicity, you can use a hardcoded username and password
  const username = req.body.username;
  const password = req.body.password;

  if (username === 'admin' && password === 'admin') {
    req.session.userId = 1; // Use a unique user ID
    res.redirect('/');
  } else {
    res.send('Invalid username or password');
  }
});

app.get('/', requireLogin, async (req, res) => {
  try {
    const data = await fetchData();
    const formattedData = formatData(data);
    
    // Display the "Logout" button
    res.send(`
      <h1>Details Of The Eligible Scheme</h1>
      ${formattedData}
      <br>
      <br>
      
      <form action="/new-page" method="get">
        <button type="submit">Apply </button>
      </form>
    `);
  } catch (error) {
    res.status(500).send('Internal Server Error');
  }
});
app.get('/new-page', requireLogin, (req, res) => {
  res.redirect('https://example.com/another-page');
});
app.post('/logout', (req, res) => {
  // Destroy the session on logout
  req.session.destroy((err) => {
    if (err) {
      console.error(err);
    }
    res.redirect('/login');
  });
});

function formatData(data) {
  return data.map((item, index) => {
    const eligibilityCriteriaText = extractTextFromStructure(item.eligibilityCriteria.eligibilityDescription);
    const applicationProcessText = extractTextFromStructure(item.applicationProcess[0].process);

    return `
      Scheme ${index + 1}:
      Eligibility Criteria:
      ${eligibilityCriteriaText.trim()}

      Application Process:
      ${applicationProcessText.trim()}

      \n
    `;
  }).join('\n');
}

async function fetchData() {
  try {
    const response = await axios.get(apiUrl);
    const data = response.data;
    return data;
  } catch (error) {
    throw error;
  }
}

function extractTextFromStructure(structure) {
  if (!structure) {
    return '';
  }

  if (Array.isArray(structure)) {
    return structure.map((item) => extractTextFromStructure(item)).join('\n');
  }

  if (typeof structure === 'object') {
    if (structure.text) {
      return structure.text;
    } else if (structure.children) {
      return extractTextFromStructure(structure.children);
    }
  }

  return '';
}

const port = 3000;

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
