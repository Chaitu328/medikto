# VAPT PREREQUISITE CHECKLIST (DOCUMENT 4 OF 4)
### Prepared by: Krishridhi Technologies Pvt. Ltd. (Technology & Engineering Partner)
### Client / Application: Medikto Health Platform (AWS Cloud Infrastructure)

---

## 1. General Requirements

* **[x] Whitelist 2 IPs (one internal, one external):**
  * **Agreed.** Krishridhi Technologies will whitelist the testing agency’s static public IP addresses in AWS Security Groups, Host Nginx reverse proxy, and API rate-limiting middleware.
* **[x] Provide network diagram of the infrastructure:**
  * **Provided.** Cloud architecture diagram detailing AWS EC2, Host Nginx, Dockerized Next.js/Express containers, AWS DocumentDB cluster (TLS), AWS S3 (AES-256), and Flutter client apps.
* **[x] Share complete scope of penetration testing:**
  * **Included Scope:**
    1. Super Admin & Hospital Admin Portal (`https://admin.medikto.com` ~14 pages, 3 roles)
    2. Backend REST API (`https://api-prd.medikto.com/api` ~28 endpoints)
    3. Android Mobile Application (APK)
    4. iOS Mobile Application (TestFlight / IPA)
    5. PhonePe Payment Gateway integration (Server-to-Server callbacks & webhook verification)
    6. Marketing Website (`https://medikto.health` automated scan)
* **[x] Provide list of limitations and constraints:**
  * No volumetric Denial of Service (DoS / DDoS) stress testing.
  * Testing strictly conducted on provisioned Staging/UAT cloud environment to avoid altering live patient data.
* **[x] Define whether testing is in live or isolated environment:**
  * **Staging / UAT Cloud Environment** (Isolated staging environment running identical Docker containers and API schemas with sanitized mock data).

---

## 2. Server Setup for Vulnerability Scanner (Rapid7 / Nessus)

* **[N/A] Dedicated Scanner Server (16GB RAM / 350GB Storage):**
  * **Not Applicable.** This is a **Remote Gray-Box Web Application, REST API, and Mobile App Security Assessment**.
  * The cybersecurity agency will conduct testing remotely over public HTTPS (`https://admin.medikto.com` and `https://api-prd.medikto.com/api`) using their own testing infrastructure and tools (Burp Suite Pro, OWASP ZAP, Postman, and Mobile Test Devices).
  * The Medikto staging application runs on a lightweight AWS EC2 cloud instance (Ubuntu Linux / Docker), and no internal scanner VM appliance is required to be hosted on our AWS account.

---

## 3. External IP Testing Requirements

* **[x] Server must have internet access or proper routing to reach external IPs:**
  * AWS EC2 instance is bound to an AWS Elastic Public IP with Internet Gateway routing and Port 80/443 open.
* **[x] Provide OS details of isolated servers to confirm Rapid7 compatibility:**
  * **Host Operating System:** Ubuntu Linux 24.04 LTS (x86_64).
  * **Container Runtimes:** Docker Engine 27.x (Node.js 22 LTS Alpine, Nginx Alpine, Next.js Standalone).
  * **Compatibility:** 100% compatible with Rapid7, Qualys, Nessus, and Burp Suite.

---

## 4. Database Access

* **[N/A] Oracle Packages / Data Dictionary (DBA_USERS, DBMS_METADATA):**
  * **Not Applicable.** The application does **NOT** use Oracle Database.
  * **Actual Database:** **AWS DocumentDB (MongoDB 6.0 wire protocol)** — a managed cloud NoSQL document database.
* **[x] Database Test Account & Privileges:**
  * A dedicated test database user will be provisioned in the Staging database cluster with `readWrite` access to test collections (`users`, `medications`, `vitals`, `prescriptions`, `payments`).
  * Database access uses TLS encrypted connection with the AWS global certificate authority bundle (`global-bundle.pem`).

---

## 5. Pentesting-Specific Requirements

### System Access
* **[x] Admin-level access to all systems in scope:**
  * For Gray-Box Web/API/Mobile testing: Super Admin, Hospital Admin, Doctor, Patient, and Caregiver credentials will be provided.
  * For Security Configuration Review: Staging EC2 SSH access (via SSH key) or AWS IAM read-only auditor role can be provided upon request.

### Network Access
* **[x] Access to routers, switches, firewalls & Permission for scans:**
  * AWS Cloud Infrastructure: Security Groups and Network ACLs serve as cloud firewalls. Krishridhi Technologies authorizes both external and internal network scans on the staging environment.

### Application Access
* **[x] Test accounts for all in-scope applications:**
  * 1 `super_admin` test account
  * 1 `hospital_admin` test account
  * 1 `doctor` test account
  * 2 `patient` test accounts (with pre-populated mock prescriptions, adherence logs, and blood pressure/sugar vitals)
  * 1 `caregiver` test account

### Documentation
* **[x] Up-to-date network diagrams & asset inventory:**
  * Architecture diagram and comprehensive Postman REST API Collection with sample payloads provided.

### Logging & Monitoring
* **[x] Access to logs and monitoring systems during test:**
  * Real-time Winston application error/audit logs and Nginx access logs can be provided or monitored in real time during testing.

### Test Environment Preparation & Scope Limitations
* **[x] Authorization to configure/adjust test environment:** Authorized.
* **[x] Clearly defined exclusions:** Production live customer database is excluded; all testing executed on the Staging/UAT clone.
* **[x] Temporary Access Period:** Defined for the agreed testing window (e.g., 2 weeks).
* **[x] Cloned / Isolated Environment Parity:** Staging environment is an exact replica of production (same Docker images, same Nginx config, same DocumentDB version, same encryption settings).

---

### Authorized by:
**Krishridhi Technologies Pvt. Ltd.** (Engineering & Technology Partner)  
**Client Project:** Medikto Health Platform  
**Date:** September 2026
