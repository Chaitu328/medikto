import 'dart:async';
import 'dart:io';

import 'package:dio/dio.dart';

class ResponseData<T> {
  ResponseData(this.message, this.status, {this.data});

  final T? data;
  final String message;
  final ResponseStatus status;

  @override
  String toString() => message;
}

enum ResponseStatus {
  // ignore: constant_identifier_names
  SUCCESS,
  // ignore: constant_identifier_names
  FAILED,
  // ignore: constant_identifier_names
  PRIVATE,
}

class ParseError {
  static String parse(dynamic e) {
    dynamic err;
    try {
      err = (e as DioException).error;
    } catch (_) {
      err = e;
    }
    var message = "";
    if (err is SocketException) {
      message = "Please connect to internet";
    } else if (err is TimeoutException) {
      message = "Connection timed out please try again.";
    } else {
      message = e.toString();
    }
    return message;
  }
}
