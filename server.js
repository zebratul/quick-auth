const http = require('http');
const url = require('url');

// Approved clients list
const approvedClients = {
  proofix: 'proofix.bitrix24.ru',
  iguks: 'edu.iguks.ru',
  otk: 'bitrix.otk.group',
  sovz: 'sovz.bitrix24.ru',
};

// Function to handle CORS
function setCORSHeaders(res) {
  res.setHeader('Access-Control-Allow-Origin', '*'); // Allow all origins
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS'); // Allow specific methods
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type'); // Allow specific headers
}

// Function to handle authorization requests
function handleAuthRequest(req, res) {
  let body = '';

  // Accumulate the request body data
  req.on('data', chunk => {
    body += chunk.toString();
  });

  // When request body is fully received
  req.on('end', () => {
    // Parse the body as JSON
    const { clientDomain } = JSON.parse(body);

    // Check if clientDomain exists in approvedClients list
    const isApproved = Object.values(approvedClients).includes(clientDomain);

    // Prepare the response based on the authorization result
    const response = {
      success: isApproved,
      message: isApproved ? 'Client domain is approved.' : 'Client domain is not approved.',
    };

    // Set CORS headers
    setCORSHeaders(res);

    // Send the JSON response
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(response));
  });
}

// Create HTTP server
const server = http.createServer((req, res) => {
  // Set CORS headers for all incoming requests
  setCORSHeaders(res);

  // Parse the incoming request URL
  const parsedUrl = url.parse(req.url, true);

  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    res.writeHead(204); // No Content
    res.end();
    return;
  }

  // Only accept POST requests to /companyApprove
  if (req.method === 'POST' && parsedUrl.pathname === '/companyApprove') {
    handleAuthRequest(req, res);
  } else {
    // Handle 404 for other routes
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: false, message: 'Route not found' }));
  }
});

// Start the server on port 3000
const PORT = process.env.PORT || 10000;
const HOST = '0.0.0.0';
server.listen(PORT, HOST, () => {
    console.log(`Server running on port ${PORT}`);
});
