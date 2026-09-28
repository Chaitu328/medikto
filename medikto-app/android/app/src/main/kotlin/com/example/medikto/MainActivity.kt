package com.example.medikto

import android.content.Intent
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.os.Environment
import android.provider.MediaStore
import androidx.core.content.FileProvider
import io.flutter.embedding.android.FlutterActivity
import io.flutter.embedding.engine.FlutterEngine
import io.flutter.plugin.common.MethodChannel
import java.io.File
import java.text.SimpleDateFormat
import java.util.*

class MainActivity : FlutterActivity() {

    companion object {
        private const val CHANNEL = "com.example.medikto/camera"
        private const val REQUEST_CAMERA = 9001
    }

    private var currentPhotoPath: String? = null
    private var pendingResult: MethodChannel.Result? = null

    override fun configureFlutterEngine(flutterEngine: FlutterEngine) {
        super.configureFlutterEngine(flutterEngine)

        MethodChannel(flutterEngine.dartExecutor.binaryMessenger, CHANNEL)
            .setMethodCallHandler { call, result ->
                when (call.method) {
                    "captureRearCamera" -> {
                        pendingResult = result
                        launchCamera(isFront = false)
                    }
                    "captureFrontCamera" -> {
                        pendingResult = result
                        launchCamera(isFront = true)
                    }
                    else -> {
                        result.notImplemented()
                    }
                }
            }
    }

    private fun launchCamera(isFront: Boolean) {
        try {
            val photoFile = createImageFile()
            currentPhotoPath = photoFile.absolutePath
            val uri = FileProvider.getUriForFile(
                this,
                "${applicationContext.packageName}.fileprovider",
                photoFile
            )

            val intent = Intent(MediaStore.ACTION_IMAGE_CAPTURE).apply {
                putExtra(MediaStore.EXTRA_OUTPUT, uri)
                if (isFront) {
                    // Force front camera (selfie)
                    putExtra("android.intent.extras.CAMERA_FACING", 1)
                    putExtra("android.intent.extras.LENS_FACING_FRONT", 1)
                    putExtra("android.intent.extra.USE_FRONT_CAMERA", true)
                    putExtra("android.intent.extras.CAMERA_FACING_FRONT", 1)
                    putExtra("camerafacing", "front")
                    putExtra("previous_mode", "front")
                } else {
                    // Force rear/back camera
                    putExtra("android.intent.extras.CAMERA_FACING", 0)
                    putExtra("android.intent.extras.LENS_FACING_FRONT", 0)
                    putExtra("android.intent.extra.USE_FRONT_CAMERA", false)
                    putExtra("android.intent.extras.CAMERA_FACING_BACK", 1)
                    putExtra("camerafacing", "back")
                    putExtra("previous_mode", "normal")
                }
                addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
                addFlags(Intent.FLAG_GRANT_WRITE_URI_PERMISSION)
            }

            if (intent.resolveActivity(packageManager) != null) {
                startActivityForResult(intent, REQUEST_CAMERA)
            } else {
                pendingResult?.error("NO_CAMERA", "No camera app available", null)
                pendingResult = null
                currentPhotoPath = null
            }
        } catch (e: Exception) {
            pendingResult?.error("CAMERA_ERROR", e.message, null)
            pendingResult = null
            currentPhotoPath = null
        }
    }

    private fun createImageFile(): File {
        val timestamp = SimpleDateFormat("yyyyMMdd_HHmmss", Locale.getDefault()).format(Date())
        val storageDir = getExternalFilesDir(Environment.DIRECTORY_PICTURES)
        return File.createTempFile("MEDIKTO_${timestamp}_", ".jpg", storageDir)
    }

    @Deprecated("Deprecated in Java")
    override fun onActivityResult(requestCode: Int, resultCode: Int, data: Intent?) {
        super.onActivityResult(requestCode, resultCode, data)
        if (requestCode == REQUEST_CAMERA) {
            if (resultCode == RESULT_OK && currentPhotoPath != null) {
                pendingResult?.success(currentPhotoPath)
            } else {
                pendingResult?.success(null) // user cancelled
            }
            pendingResult = null
            currentPhotoPath = null
        }
    }
}
