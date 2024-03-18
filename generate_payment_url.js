const crypto = require("crypto");
const { v4: uuidv4 } = require("uuid");
const axios = require("axios");
const request_id = uuidv4();
const url = "/checkout/v1/payment";
const requestTimestamp = getCurrentTimestamp();

const client_id = ""; // change with your client-id "BRN-...."
const secret_key = ""; // change with your secret-key "SK-...."

// example of jsonBody
let jsonBody = JSON.stringify({
  order: {
    amount: 1000,
    invoice_number: request_id,
    currency: "IDR",
    callback_url: "https://apip.dev/", // change with your callback website"
    callback_url_cancel: "https://apip.dev/", // change with your callback website"
  },
  payment: {
    payment_due_date: 60,
    payment_method_types: ["QRIS"],
  },
  customer: {
    id: "JC-01",
    name: "Zolanda",
    phone: "628121212121",
    country: "ID",
  },
});

// Generate Digest
function generateDigest(jsonBody) {
  let jsonStringHash256 = crypto
    .createHash("sha256")
    .update(jsonBody, "utf-8")
    .digest();

  let bufferFromJsonStringHash256 = Buffer.from(jsonStringHash256);
  return bufferFromJsonStringHash256.toString("base64");
}

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

let digest = generateDigest(jsonBody);

// Generate Header Signature
let headerSignature = generateSignature(
  client_id,
  request_id,
  url,
  digest,
  secret_key
);

const get_payment_link = () => {
  let config = {
    method: "post",
    maxBodyLength: Infinity,
    url: "https://api.doku.com" + url,
    headers: {
      "Client-Id": client_id,
      "Request-Id": request_id,
      "Request-Timestamp": requestTimestamp,
      Signature: headerSignature,
      "Content-Type": "application/json",
    },
    data: jsonBody,
  };

  axios
    .request(config)
    .then((response) => {
      console.log(JSON.stringify(response.data));
      console.log();
      console.log(response.data.response.payment.url);
      return JSON.stringify(response.data);
    })
    .catch((error) => {
      console.log(error);
    });
};

get_payment_link();
