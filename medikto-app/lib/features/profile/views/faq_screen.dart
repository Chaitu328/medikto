import 'package:flutter/material.dart';
import 'package:medikto/core/constants/app_themes.dart';

class FaqScreen extends StatefulWidget {
  const FaqScreen({super.key});

  @override
  State<FaqScreen> createState() => _FaqScreenState();
}

class _FaqScreenState extends State<FaqScreen> {
  int _selectedCategoryIndex = 0;

  final List<Map<String, dynamic>> _faqCategories = [
    {
      "category": "General & Login",
      "icon": Icons.account_circle_outlined,
      "items": [
        {
          "q": "How do I register for Medikto?",
          "a": "You can sign up as a Patient using your mobile phone number. Enter your number, verify the SMS OTP code sent to your device, agree to our Terms & Conditions and Privacy Policy, and provide your name to create your account."
        },
        {
          "q": "Can I sign in using Google?",
          "a": "Yes! On the Login screen, you can tap 'Continue with Google'. If you are a new user, you will be prompted to accept the Terms & Conditions and Privacy Policy before your account is set up."
        },
        {
          "q": "What is Guardian mode on the login page?",
          "a": "Guardian mode is for designated family members or caretakers who monitor a patient's medication adherence. Guardians log in using an email address and password provided when they are invited."
        },
        {
          "q": "How do I update my profile details?",
          "a": "Go to the Profile tab and tap on your profile card at the top. You can edit your name, blood group, age, height, weight, and profile picture."
        }
      ]
    },
    {
      "category": "Medications & Doses",
      "icon": Icons.medication_outlined,
      "items": [
        {
          "q": "How do I add a new medication?",
          "a": "Navigate to the Medications tab and tap the '+' button. Enter the medicine name, dosage, frequency (daily or weekly), and specific reminder times (morning, afternoon, evening, night)."
        },
        {
          "q": "How do I mark a dose as taken?",
          "a": "Go to the Home or Schedule tab to view Today's Schedule. Tap the 'Mark as Taken' button next to your pending dose."
        },
        {
          "q": "What is Selfie Verification for medications?",
          "a": "Selfie Verification allows you to capture a photo proof when taking your medicine. Medikto automatically attaches a real-time timestamp watermark to the photo for hospital compliance records."
        },
        {
          "q": "How long are dose verification selfies stored?",
          "a": "On the Free and Basic tiers, verification selfies are stored for 48 hours. On the Premium tier, selfies are retained for up to 3 months for complete historical compliance reviews."
        }
      ]
    },
    {
      "category": "Vitals & Reports",
      "icon": Icons.favorite_outline,
      "items": [
        {
          "q": "What health vitals can I record in Medikto?",
          "a": "You can record and track Blood Pressure (systolic/diastolic), Heart Rate (BPM), Body Temperature, and Blood Sugar levels with automated timeline tracking."
        },
        {
          "q": "How do I upload medical reports and prescriptions?",
          "a": "Go to the Vitals & Reports section, tap '+' on Prescriptions or Medical Reports, choose your document or image (PDF, JPG, PNG), and assign a category (such as Blood Test, Scan, Prescription)."
        },
        {
          "q": "Can I delete an uploaded report or vital entry?",
          "a": "Yes, you can manage or delete your uploaded prescriptions, medical reports, and vital logs directly from their respective detail views."
        }
      ]
    },
    {
      "category": "Hospitals & Caretakers",
      "icon": Icons.local_hospital_outlined,
      "items": [
        {
          "q": "How do I link my account to a hospital?",
          "a": "When you visit a partner hospital, the hospital administrator sends a link request to your phone. You will receive an OTP notification in your app. Share this OTP with the hospital staff to link your profile."
        },
        {
          "q": "What information can a connected hospital see?",
          "a": "Authorized hospital staff can view your medication schedule, adherence history, selfie verification proofs, uploaded vitals, and prescriptions to assist in your clinical care."
        },
        {
          "q": "How do I add a caretaker or family member to monitor me?",
          "a": "In the Profile tab, go to 'Manage Caretakers' to invite a caretaker via email, or enter their details during initial patient registration. They will receive credentials to view your medication timeline."
        },
        {
          "q": "Can caretakers alter or delete my medicines?",
          "a": "No. Caretakers have secure, view-only access. They can monitor your daily schedule and adherence alerts, but cannot add, edit, or delete your prescriptions or medical logs."
        },
        {
          "q": "How do I disconnect from a hospital?",
          "a": "Go to Profile -> Manage Hospital Access. Select the connected hospital and tap 'Unlink' to revoke hospital access at any time."
        }
      ]
    },
    {
      "category": "Privacy & Security",
      "icon": Icons.security_outlined,
      "items": [
        {
          "q": "Is my health information secure?",
          "a": "Yes. Medikto enforces TLS/SSL encryption for all data in transit, secure cloud storage with strict access controls, and multi-factor authentication mechanisms."
        },
        {
          "q": "Does Medikto sell my health data to advertisers?",
          "a": "Never. Medikto does not sell, trade, or monetize your health information to third-party advertisers."
        },
        {
          "q": "How do I contact customer support or report an issue?",
          "a": "Under Profile -> Help & Support, you can tap 'Contact Support' to email or call our team, or use 'Report an Issue' to send a diagnostic report directly to shahmedikto@gmail.com."
        },
        {
          "q": "How can I delete my Medikto account?",
          "a": "Under Profile -> Settings, tap 'Delete Account'. This permanently removes your profile and associated data from our servers."
        }
      ]
    }
  ];

  @override
  Widget build(BuildContext context) {
    final themeColors = context.themeColors;
    final currentCategory = _faqCategories[_selectedCategoryIndex];
    final List<dynamic> currentItems = currentCategory["items"];

    return Scaffold(
      backgroundColor: themeColors.bg,
      appBar: AppBar(
        backgroundColor: themeColors.bg,
        elevation: 0,
        leading: IconButton(
          icon: Icon(Icons.arrow_back_ios_new, color: themeColors.textPrimary, size: 20),
          onPressed: () => Navigator.pop(context),
        ),
        title: Text(
          "Frequently Asked Questions",
          style: TextStyle(
            color: themeColors.textPrimary,
            fontSize: 18,
            fontWeight: FontWeight.bold,
          ),
        ),
        centerTitle: true,
      ),
      body: Column(
        children: [
          // Category Selector Tabs
          Container(
            height: 52,
            margin: const EdgeInsets.symmetric(vertical: 8),
            child: ListView.builder(
              scrollDirection: Axis.horizontal,
              padding: const EdgeInsets.symmetric(horizontal: 16),
              itemCount: _faqCategories.length,
              itemBuilder: (context, index) {
                final isSelected = _selectedCategoryIndex == index;
                final cat = _faqCategories[index];
                return Padding(
                  padding: const EdgeInsets.only(right: 8),
                  child: FilterChip(
                    avatar: Icon(
                      cat["icon"] as IconData,
                      size: 16,
                      color: isSelected ? themeColors.onAccentPrimary : themeColors.accentMedium,
                    ),
                    label: Text(
                      cat["category"] as String,
                      style: TextStyle(
                        color: isSelected ? themeColors.onAccentPrimary : themeColors.textSecondary,
                        fontWeight: isSelected ? FontWeight.bold : FontWeight.w500,
                        fontSize: 13,
                      ),
                    ),
                    selected: isSelected,
                    onSelected: (selected) {
                      setState(() {
                        _selectedCategoryIndex = index;
                      });
                    },
                    backgroundColor: themeColors.surface,
                    selectedColor: themeColors.accentPrimary,
                    checkmarkColor: Colors.transparent,
                    showCheckmark: false,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(20),
                      side: BorderSide(
                        color: isSelected ? themeColors.accentPrimary : themeColors.border,
                      ),
                    ),
                  ),
                );
              },
            ),
          ),

          // FAQ List
          Expanded(
            child: ListView.builder(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
              physics: const BouncingScrollPhysics(),
              itemCount: currentItems.length,
              itemBuilder: (context, index) {
                final item = currentItems[index];
                return Padding(
                  padding: const EdgeInsets.only(bottom: 12),
                  child: Material(
                    color: themeColors.surface,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(16),
                      side: BorderSide(color: themeColors.border),
                    ),
                    child: Theme(
                      data: Theme.of(context).copyWith(
                        dividerColor: Colors.transparent,
                      ),
                      child: ExpansionTile(
                        tilePadding: const EdgeInsets.symmetric(horizontal: 18, vertical: 6),
                        childrenPadding: const EdgeInsets.only(left: 18, right: 18, bottom: 18),
                        iconColor: themeColors.accentMedium,
                        collapsedIconColor: themeColors.textSecondary,
                        title: Text(
                          item["q"] as String,
                          style: TextStyle(
                            color: themeColors.textPrimary,
                            fontSize: 15,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                        children: [
                          Text(
                            item["a"] as String,
                            style: TextStyle(
                              color: themeColors.textSecondary,
                              fontSize: 14,
                              height: 1.5,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}
