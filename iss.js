// iss.js 

/**
 * Orchestrates multiple API requests in order to determine the next 5 upcoming ISS fly overs for the user's current location.
 * Input:
 *   - A callback with an error or results. 
 * Returns (via Callback):
 *   - An error, if any (nullable)
 *   - The fly-over times as an array (null if error):
 *     [ { risetime: <number>, duration: <number> }, ... ]
*/ 
const request = require('request');
const nextISSTimesForMyLocation = function(callback) {
  // empty for now
  const fetchMyIP = function(callback) {
    request('https://api.ipify.org?format=json', (error, response, body) => {
      const fetchCoordsByIP = function(ip, callback) {
        request(`http://ipwho.is/${ip}`, (error, response, body) => {
          const fetchISSFlyOverTimes = function(coords, callback) {
            request(`https://iss-flyover.herokuapp.com/json/?lat=${coords.latitude}&lon=${coords.longitude}`, (error, response, body) => {
              if (error) {
                callback(error, null);
                return;
              }
              if (response.statusCode !== 200) {
                callback(Error(`Status Code ${response.statusCode} when fetching ISS pass times: ${body}`), null);
                return;
              }
              const passes = JSON.parse(body).response;
              callback(null, passes);
            });
          };
          if (error) {
            callback(error, null);
            return;
          }
          const parsedBody = JSON.parse(body);
          if (!parsedBody.success) {
            const message = `Success status was ${parsedBody.success}. Server message says: ${parsedBody.message} when fetching for IP ${parsedBody.ip}`;
            callback(Error(message), null);
            return;
          }
          const { latitude, longitude } = parsedBody;
          callback(null, {latitude, longitude});
        });
      };
      if (error) return callback(error, null);
      if (response.statusCode !== 200) {
        callback(Error(`Status Code ${response.statusCode} when fetching IP: ${body}`), null);
        return;
      }
      const ip = JSON.parse(body).ip;
      callback(null, ip);
    });
  };
}

module.exports = { nextISSTimesForMyLocation };
