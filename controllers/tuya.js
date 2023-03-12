const axios = require('axios');
const { createDecipher } = require('crypto');
require('dotenv').config();
const crypto = require('crypto');
const qs = require('qs');

// User local maintenance highway token
let token = '';

const config = {
  /* Service address */
  host: `${process.env.TUYA_URL}`,
  /* Access Id */
  accessKey: `${process.env.TUYA_CLIENT_ID}`,
  /* Access Secret */
  secretKey: `${process.env.TUYA_SECRET}`,
  /* Interface example device_id */
  deviceId: `${process.env.TUYA_DEVICE_ID}`,
};

const httpClient = axios.create({
  baseURL: config.host,
  timeout: 5 * 1e3,
});

async function main() {
  await getToken();
  const data = await getDeviceInfo(config.deviceId);
  console.log('success: ', JSON.stringify(data));
}

/**
 * fetch highway login token
 */
async function getToken() {
  try {
    const method = 'GET';
    const timestamp = Date.now().toString();
    const signUrl = '/v1.0/token?grant_type=1';
    const contentHash = crypto.createHash('sha256').update('').digest('hex');
    const stringToSign = [method, contentHash, '', signUrl].join('\n');
    const signStr = config.accessKey + timestamp + stringToSign;

    const headers = {
      t: timestamp,
      sign_method: 'HMAC-SHA256',
      client_id: config.accessKey,
      sign: await encryptStr(signStr, config.secretKey),
    };
    const { data: login } = await httpClient.get('/v1.0/token?grant_type=1', { headers });
    if (!login || !login.success) {
      throw Error(`Authorization Failed: ${login.msg}`);
    }
    token = login.result.access_token;
    console.log(token);
  } catch (err) {
    console.log(err);
  }

}

/**
 * fetch highway business data
 */
async function getDeviceInfo(deviceId) {
  const query = {};
  const method = 'GET';
  const url = `/v1.0/devices/${deviceId}`;
  const reqHeaders = await getRequestSign(url, method, {}, query);

  const { data } = await httpClient.request({
    method,
    data: {},
    params: {},
    headers: reqHeaders,
    url: reqHeaders.path,
  });
  if (!data || !data.success) {
    throw Error(`Request highway Failed: ${data.msg}`);
  }
}

/**
 * HMAC-SHA256 crypto function
 */
async function encryptStr(str, secret) {
  return crypto.createHmac('sha256', secret).update(str, 'utf8').digest('hex').toUpperCase();
}

/**
 * Request signature, which can be passed as headers
 * @param path
 * @param method
 * @param headers
 * @param query
 * @param body
 */
async function getRequestSign(
  path,
  method,
  headers = {},
  query = {},
  body = {},
) {
  const t = Date.now().toString();
  const [uri, pathQuery] = path.split('?');
  const queryMerged = Object.assign(query, qs.parse(pathQuery));
  const sortedQuery = {};
  Object.keys(queryMerged)
    .sort()
    .forEach((i) => (sortedQuery[i] = query[i]));

  const querystring = decodeURIComponent(qs.stringify(sortedQuery));
  const url = querystring ? `${uri}?${querystring}` : uri;
  const contentHash = crypto.createHash('sha256').update(JSON.stringify(body)).digest('hex');
  const stringToSign = [method, contentHash, '', url].join('\n');
  const signStr = config.accessKey + token + t + stringToSign;
  return {
    t,
    path: url,
    client_id: config.accessKey,
    sign: await encryptStr(signStr, config.secretKey),
    sign_method: 'HMAC-SHA256',
    access_token: token,
  };
}


main().catch(err => {
  throw Error(`ERROE: ${err}`);
});
















// const API_CLIENT_ID = `${process.env.TUYA_CLIENT_ID}`;
// const API_SECRET = `${process.env.TUYA_SECRET}`;


// const getTokenParams = () => {
//   // Define your API request parameters
//   const clientId = `${process.env.TUYA_CLIENT_ID}`;
//   const secret = `${process.env.TUYA_SECRET}`;
//   const grantType = '1';
//   // Generate a new t value
//   const t = Date.now();
//   // Construct the string to be signed
//   const signString = `${clientId}${t}${secret}`;

//   // Hash the signString with HMAC-SHA256
//   const hmac = crypto.createHmac('sha256', secret);
//   const sign = hmac.update(signString).digest('hex').toUpperCase();
//   const retParams={
//     t:t,
//     sign:sign
//   }

//   return retParams;
// }


// module.exports = getToken = async () => {
//   const tokenParams= getTokenParams();
//   console.log(tokenParams.t);
//   console.log(tokenParams.sign);
//   try {
//     const url = `${process.env.TUYA_URL}/v1.0/token?grant_type=1`;
//     const headers = {
//       'sign_method': 'HMAC-SHA256',
//       'client_id': `${process.env.TUYA_CLIENT_ID}`,
//       't': `${tokenParams.t}`,
//       'mode': 'cors',
//       'Content-Type': 'application/json',
//       'sign': `${tokenParams.sign}`,
//       'access_token': ''
//     };

//     const response = await axios.get(url, { headers });
//     const data = response.data;
//     console.log(data);
//     return data;
//   } catch (error) {
//     console.error(error);
//   }
// }
