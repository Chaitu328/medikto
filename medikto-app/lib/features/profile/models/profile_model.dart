class ProfileModel {
  final String? id;
  final String? phone;
  final String? firstName;
  final int? age;
  final String? gender;
  final String? bloodGroup;
  final double? height;
  final double? weight;
  final String? profilePic;
  final bool? isVerified;
  final String? subscription;
  final Map<String, dynamic>? subscriptionDetails;
  final List<dynamic>? familyMembers;
  final String? createdAt;
  final String? role;
  final String? email;
  final Map<String, dynamic>? hospital;
  final String? authProvider;

  ProfileModel({
    this.id,
    this.phone,
    this.firstName,
    this.age,
    this.gender,
    this.bloodGroup,
    this.height,
    this.weight,
    this.profilePic,
    this.isVerified,
    this.subscription,
    this.subscriptionDetails,
    this.familyMembers,
    this.createdAt,
    this.role,
    this.email,
    this.hospital,
    this.authProvider,
  });

  bool get isPremium {
    if (subscriptionDetails != null && subscriptionDetails!['isPremium'] == true) {
      return true;
    }
    return (subscription ?? '').toLowerCase() == 'premium';
  }

  bool get isTrial {
    if (subscriptionDetails != null && subscriptionDetails!['status'] == 'trial') {
      return true;
    }
    return false;
  }

  factory ProfileModel.fromJson(Map<String, dynamic> json) {
    return ProfileModel(
      id: json['_id'],
      phone: json['phone'],
      firstName: json['firstName'],
      age: json['age'],
      gender: json['gender'],
      bloodGroup: json['bloodGroup'],
      height: json['height'] != null
          ? (json['height'] as num).toDouble()
          : null,

      weight: json['weight'] != null
          ? (json['weight'] as num).toDouble()
          : null,
      profilePic: json['profilePic'],
      isVerified: json['isVerified'],
      subscription: json['subscription'],
      subscriptionDetails: json['subscriptionDetails'] is Map<String, dynamic>
          ? json['subscriptionDetails']
          : null,
      familyMembers: json['familyMembers'],
      createdAt: json['createdAt'],
      role: json['role'],
      email: json['email'],
      hospital: json['hospital'] is Map<String, dynamic> ? json['hospital'] : null,
      authProvider: json['authProvider'],
    );
  }
}
