class LegalContent {
  static const String termsVersion = "1.0";
  static const String privacyPolicyVersion = "1.0";
  static const String termsLastUpdated = "September 2026";
  static const String privacyPolicyLastUpdated = "September 2026";

  static const String supportEmail = "shahmedikto@gmail.com";
  static const String supportPhone = "+91 9642331668";

  static const String termsAndConditions = """
# Medikto Terms & Conditions
**Version: 1.0**
*Last Updated: September 2026*

Welcome to Medikto. Please read these Terms & Conditions carefully before using our mobile application and related services.

---

### 1. Acceptance of Terms
By creating an account, logging in, or using the Medikto application, you acknowledge that you have read, understood, and agreed to be bound by these Terms & Conditions and our Privacy Policy. If you do not agree, you must not use the application.

---

### 2. Medical Disclaimer (Not Medical Advice)
- **Informational and Management Tool Only**: Medikto is a digital medication management and adherence tracking platform designed to help you organize your medication schedule, track vitals, and coordinate with healthcare providers and caretakers.
- **No Doctor-Patient Relationship**: The application does not provide medical advice, diagnosis, or treatment recommendations. Always consult a qualified medical professional before starting, altering, or stopping any medication or healthcare regimen.
- **Emergency Medical Situations**: In case of a medical emergency, immediately call your local emergency services or visit the nearest hospital. Do not rely on Medikto for urgent care.

---

### 3. User Accounts & Responsibilities
- **Accuracy of Information**: You are responsible for ensuring that all information you enter (including medication names, dosages, timings, vitals, and profile data) is accurate and up to date.
- **Account Security**: You are responsible for maintaining the confidentiality of your login credentials and device security. You agree to notify Medikto immediately of any unauthorized access.
- **Lawful Use**: You agree not to misuse the service, upload malicious content, or violate any applicable healthcare privacy laws.

---

### 4. Hospital Linkage & Caretaker Monitoring
- **Hospital Links**: When you authorize a connection to a hospital or clinical provider using an OTP code, authorized hospital administrators may view your medication adherence, uploaded prescriptions, vitals, and reports.
- **Caretaker Access**: Caretakers (guardians) whom you invite or authorize receive view-only access to help monitor your health records. You may manage or revoke connections at any time in your profile settings.

---

### 5. Proof of Medication & Watermarked Selfies
- **Selfie Proof Verification**: If you choose or are required by your hospital to take a verification selfie when completing a dose, the image is watermarked with the dose timestamp and securely processed.
- **Data Retention Tiers**: Free and Basic plans retain selfie proofs for 48 hours, while Premium subscriptions retain proofs for up to 3 months, after which they are permanently deleted.

---

### 6. Intellectual Property
All content, trademarks, logos, UI designs, algorithms, and software comprising Medikto are the proprietary property of Medikto and protected under intellectual property laws.

---

### 7. Limitation of Liability
To the maximum extent permitted by law, Medikto and its operators shall not be liable for any indirect, incidental, or consequential damages resulting from your use of the application, missed doses, inaccurate data entry, or network delays in reminder notifications.

---

### 8. Changes to Terms
We reserve the right to modify these terms. We will notify you of material changes by updating the document version. Continued use after changes signifies acceptance of the revised Terms.

---

### 9. Contact Us
For any legal questions regarding these Terms, contact us at:
- **Email**: shahmedikto@gmail.com
- **Phone**: +91 9642331668
""";

  static const String privacyPolicy = """
# Medikto Privacy Policy
**Version: 1.0**
*Last Updated: September 2026*

At Medikto, we respect your privacy and are committed to protecting your personal and healthcare information with the highest security standards.

---

### 1. Information We Collect
- **Identity & Contact**: Name, mobile phone number, email address, age, gender, blood group, height, and weight.
- **Medication Data**: Medication names, dosage, frequency, prescribed duration, and adherence history (taken / missed doses).
- **Health Records**: Blood pressure, heart rate, body temperature, blood sugar readings, uploaded medical reports, and prescriptions.
- **Selfie Verification Proofs**: Photos captured to confirm medication intake, watermarked with real-time timestamps.
- **Device & Notification Info**: Device push notification tokens (FCM) to deliver timely medication reminders and hospital sync alerts.

---

### 2. How We Use Your Information
We use your information exclusively to:
- Deliver medication reminders and track daily adherence schedules.
- Facilitate authorized remote health monitoring by your connected hospitals and designated family caretakers.
- Store your prescriptions, lab reports, and vitals history for easy access.
- Provide prompt customer support and issue resolution.
- Enhance app stability, reliability, and security.

---

### 3. How Your Data is Shared
- **Connected Hospitals**: Only hospitals that you explicitly authorize via OTP verification can view your medication schedule, vitals, and medical documents.
- **Designated Caretakers**: Caretakers invited by you or assigned by your hospital have read-only access to monitor your progress.
- **No Third-Party Advertising**: We **never** sell, rent, or monetize your personal health data to third-party advertisers or data brokers.

---

### 4. Data Security & Storage
- **Encryption**: All data in transit is encrypted using industry-standard TLS / SSL protocols. Sensitive authentication credentials and backend storage are secured with modern encryption.
- **Selfie Proof Retention**: Verification photos are retained for 48 hours on Free/Basic tiers and up to 3 months on Premium tiers, after which they are automatically pruned.
- **Account Control**: You have the right to request deletion of your account and personal health data through the Profile settings.

---

### 5. Third-Party Services
We use trusted infrastructure providers including:
- **Firebase Authentication & Cloud Messaging**: For secure OTP/Google verification and push notifications.
- **AWS S3 / Cloud Storage**: For encrypted medical file storage.

---

### 6. Updates to This Policy
We may update our Privacy Policy periodically. When changes occur, we update the version number and last-updated date.

---

### 7. Contact Privacy Officer
If you have questions or concerns regarding our privacy practices:
- **Email**: shahmedikto@gmail.com
- **Phone**: +91 9642331668
""";
}
