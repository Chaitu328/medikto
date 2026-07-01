import 'package:dio/dio.dart';
import 'package:medikto/core/constants/api_urls.dart';
import 'package:medikto/core/network/base_response.dart';
import 'package:medikto/core/network/dio_client.dart';
import 'package:medikto/features/home/notifications/notification_model.dart';

class NotificationManager {
  factory NotificationManager() {
    return _singleton;
  }

  NotificationManager._internal();

  static final NotificationManager _singleton = NotificationManager._internal();

  Future<ResponseData> getNotifications() async {
    Response response;

    try {
      response = await dioClient.ref!.get(
        ApiUrls.getNotifications,
      );

      print("GET NOTIFICATIONS URL => ${ApiUrls.getNotifications}");
      print("STATUS CODE => ${response.statusCode}");

      if (response.statusCode == 200) {
        final List<AppNotificationModel> list = (response.data as List)
            .map((item) => AppNotificationModel.fromJson(item))
            .toList();

        return ResponseData(
          "Notifications retrieved successfully",
          ResponseStatus.SUCCESS,
          data: list,
        );
      } else {
        return ResponseData(
          response.data['message'] ?? "Something went wrong",
          ResponseStatus.FAILED,
        );
      }
    } on DioException catch (e) {
      print("GET NOTIFICATIONS ERROR => ${e.response?.data}");
      return ResponseData(
        e.response?.data?['message'] ?? "Something went wrong",
        ResponseStatus.FAILED,
      );
    } catch (e) {
      print("ERROR => $e");
      return ResponseData("Please check your internet", ResponseStatus.FAILED);
    }
  }

  Future<ResponseData> markNotificationAsRead(String id) async {
    Response response;

    try {
      response = await dioClient.ref!.put(
        ApiUrls.markNotificationAsRead(id),
      );

      if (response.statusCode == 200) {
        return ResponseData(
          "Notification marked as read successfully",
          ResponseStatus.SUCCESS,
        );
      } else {
        return ResponseData(
          response.data['message'] ?? "Something went wrong",
          ResponseStatus.FAILED,
        );
      }
    } on DioException catch (e) {
      return ResponseData(
        e.response?.data?['message'] ?? "Something went wrong",
        ResponseStatus.FAILED,
      );
    } catch (e) {
      return ResponseData("Please check your internet", ResponseStatus.FAILED);
    }
  }

  Future<ResponseData> markAllNotificationsAsRead() async {
    Response response;

    try {
      response = await dioClient.ref!.put(
        ApiUrls.markAllNotificationsAsRead,
      );

      if (response.statusCode == 200) {
        return ResponseData(
          "All notifications marked as read successfully",
          ResponseStatus.SUCCESS,
        );
      } else {
        return ResponseData(
          response.data['message'] ?? "Something went wrong",
          ResponseStatus.FAILED,
        );
      }
    } on DioException catch (e) {
      return ResponseData(
        e.response?.data?['message'] ?? "Something went wrong",
        ResponseStatus.FAILED,
      );
    } catch (e) {
      return ResponseData("Please check your internet", ResponseStatus.FAILED);
    }
  }
}
