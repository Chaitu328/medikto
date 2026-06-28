const axios = require("axios");

exports.sendSMS = async (phone, message) => {
  try {
    let formattedPhone = phone.trim();
    if (!formattedPhone.startsWith("+")) {
      formattedPhone = `+91${formattedPhone}`;
    }

    // 1. Try Twilio Configuration
    if (
      process.env.TWILIO_ACCOUNT_SID &&
      process.env.TWILIO_AUTH_TOKEN &&
      process.env.TWILIO_PHONE_NUMBER
    ) {
      console.log(`Sending SMS to ${formattedPhone} via Twilio...`);
      
      const params = new URLSearchParams();
      params.append("To", formattedPhone);
      params.append("From", process.env.TWILIO_PHONE_NUMBER);
      params.append("Body", message);

      const response = await axios.post(
        `https://api.twilio.com/2010-04-01/Accounts/${process.env.TWILIO_ACCOUNT_SID}/Messages.json`,
        params.toString(),
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded"
          },
          auth: {
            username: process.env.TWILIO_ACCOUNT_SID,
            password: process.env.TWILIO_AUTH_TOKEN
          }
        }
      );
      
      console.log("Twilio SMS sent successfully. SID:", response.data.sid);
      return { success: true, provider: "twilio", sid: response.data.sid };
    }

    // 2. Fallback to Fast2SMS Configuration
    if (process.env.FAST2SMS_API_KEY) {
      console.log(`Sending SMS to ${phone} via Fast2SMS...`);
      // Fast2SMS expects 10 digit number
      const rawNumber = formattedPhone.replace("+91", "").replace("+", "");

      await axios.post(
        "https://www.fast2sms.com/dev/bulkV2",
        {
          route: "q",
          message: message,
          numbers: rawNumber,
        },
        {
          headers: {
            authorization: process.env.FAST2SMS_API_KEY,
            "Content-Type": "application/json",
          },
        }
      );
      
      console.log("Fast2SMS sent successfully.");
      return { success: true, provider: "fast2sms" };
    }

    // 3. Local Dev Mock Fallback
    console.log(`\n======================================================`);
    console.log(`[DEV SMS LOG] To: ${formattedPhone}`);
    console.log(`[DEV SMS LOG] Message: ${message}`);
    console.log(`======================================================\n`);
    return { success: true, provider: "mock", message };

  } catch (err) {
    const errorDetails = err.response ? JSON.stringify(err.response.data) : err.message;
    console.error("SMS Dispatch Helper Error:", errorDetails);
    throw new Error(`SMS send failed: ${errorDetails}`);
  }
};
