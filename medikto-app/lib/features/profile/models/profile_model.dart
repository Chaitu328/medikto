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
  final List<dynamic>? familyMembers;
  final String? createdAt;

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
    this.familyMembers,
    this.createdAt,
  });

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
      familyMembers: json['familyMembers'],
      createdAt: json['createdAt'],
    );
  }
}
