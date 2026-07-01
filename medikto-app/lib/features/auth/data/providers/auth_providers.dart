import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:medikto/features/auth/data/managers/auth_manager.dart';

final authProvider = Provider<AuthManager>((ref) => AuthManager());
