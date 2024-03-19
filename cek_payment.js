const crypto = require("crypto");
const { v4: uuidv4 } = require("uuid");
const axios = require("axios");

const request_id = uuidv4();
const requestTimestamp = getCurrentTimestamp();

const client_id = ""; // change with your client-id "BRN-...."
const secret_key = ""; // change with your secret-key "SK-...."

const invoice_number = ""; // change with your invoice number
const url = "/orders/v1/status/" + invoice_number;

function generateSignature(clientId, requestId, requestTarget, digest, secret) {
  // Prepare Signature Component
  let componentSignature = "Client-Id:" + clientId;
  componentSignature += "\n";
  componentSignature += "Request-Id:" + requestId;
  componentSignature += "\n";
  componentSignature += "Request-Timestamp:" + requestTimestamp;
  componentSignature += "\n";
  componentSignature += "Request-Target:" + requestTarget;
  if (digest) {
    componentSignature += "\n";
    componentSignature += "Digest:" + digest;
  }

  // Calculate HMAC-SHA256 base64 from all the components above
  let hmac256Value = crypto
    .createHmac("sha256", secret)
    .update(componentSignature.toString())
    .digest();

  let bufferFromHmac256Value = Buffer.from(hmac256Value);
  let signature = bufferFromHmac256Value.toString("base64");
  return "HMACSHA256=" + signature;
}

// Fungsi untuk mendapatkan timestamp terbaru
function getCurrentTimestamp() {
  return new Date().toISOString().slice(0, 19) + "Z";
}

let digest = "";

// Generate Header Signature
let headerSignature = generateSignature(
  client_id,
  request_id,
  url,
  digest,
  secret_key
);

const cek_payment = () => {
  let config = {
    method: "get",
    maxBodyLength: Infinity,
    url: "https://api.doku.com" + url,
    headers: {
      "Client-Id": client_id,
      "Request-Id": request_id,
      "Request-Timestamp": requestTimestamp,
      Signature: headerSignature,
    },
  };

  axios
    .request(config)
    .then((response) => {
      console.log(JSON.stringify(response.data));
      console.log();
      console.log(JSON.stringify(response.data.transaction.status));
      console.log();
      return JSON.stringify(response.data);
    })
    .catch((error) => {
      console.log(error);
    });
};

cek_payment();
