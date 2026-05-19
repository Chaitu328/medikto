const Vitals = require("../models/vitalsModel");

// Combine date + time from frontend
const getDateTime = (date, time) => {
  return new Date(`${date}T${time}`);
};

// BP Status
const getBPStatus = (systolic, diastolic) => {
  if (systolic < 120 && diastolic < 80) return "Normal";
  if (systolic < 130 && diastolic < 80) return "Elevated";
  if (systolic < 140 || diastolic < 90) return "Hypertension Stage 1";
  if (systolic >= 140 || diastolic >= 90) return "Hypertension Stage 2";
  return "Consult Doctor";
};

// Heart Rate Status
const getHeartRateStatus = (hr) => {
  if (hr < 60) return "Low";
  if (hr <= 100) return "Normal";
  return "High";
};

// Temperature (Celsius logic)
const getTemperatureStatus = (tempC) => {
  if (tempC < 36) return "Low";
  if (tempC <= 37.5) return "Normal";
  return "Fever";
};

// Convert °F → °C (your UI uses Fahrenheit)
const fahrenheitToCelsius = (f) => (f - 32) * 5 / 9;

// Sugar Status
const getSugarStatus = (sugar) => {
  if (sugar < 70) return "Low";
  if (sugar <= 140) return "Normal";
  if (sugar <= 200) return "Prediabetes";
  return "Diabetes";
};


exports.addBloodPressure = async (req, res) => {
  try {
    const { systolic, diastolic, date, time, notes } = req.body;

    if (!systolic || !diastolic || !date || !time) {
      return res.status(400).json({
        message: "Missing required fields"
      });
    }

    const recordedAt = getDateTime(date, time);

    const status = getBPStatus(systolic, diastolic);

    const record = await Vitals.create({
      type: "bloodPressure",
      bloodPressure: {
        systolic,
        diastolic,
        status
      },
      notes,
      recordedAt
    });

    res.status(201).json(record);

  } catch (err) {
    res.status(500).json({
      error: err.message
    });
  }
};


exports.addHeartRate = async (req, res) => {
  try {
    const { heartRate, date, time, notes } = req.body;

    if (!heartRate || !date || !time) {
      return res.status(400).json({
        message: "Missing required fields"
      });
    }

    const recordedAt = getDateTime(date, time);

    const status = getHeartRateStatus(heartRate);

    const record = await Vitals.create({
      type: "heartRate",
      heartRate,
      heartRateStatus: status,
      notes,
      recordedAt
    });

    res.status(201).json(record);

  } catch (err) {
    res.status(500).json({
      error: err.message
    });
  }
};



exports.addTemperature = async (req, res) => {
  try {
    const { temperature, date, time, notes } = req.body;

    if (!temperature || !date || !time) {
      return res.status(400).json({
        message: "Missing required fields"
      });
    }

    const recordedAt = getDateTime(date, time);

    const tempC = fahrenheitToCelsius(temperature);

    const status = getTemperatureStatus(tempC);

    const record = await Vitals.create({
      type: "temperature",
      temperature,
      temperatureStatus: status,
      notes,
      recordedAt
    });

    res.status(201).json(record);

  } catch (err) {
    res.status(500).json({
      error: err.message
    });
  }
};



exports.addSugar = async (req, res) => {
  try {
    const { sugarLevel, date, time, notes } = req.body;

    if (!sugarLevel || !date || !time) {
      return res.status(400).json({
        message: "Missing required fields"
      });
    }

    const recordedAt = getDateTime(date, time);

    const status = getSugarStatus(sugarLevel);

    const record = await Vitals.create({
      type: "sugar",
      sugarLevel,
      sugarStatus: status,
      notes,
      recordedAt
    });

    res.status(201).json(record);

  } catch (err) {
    res.status(500).json({
      error: err.message
    });
  }
};


exports.getVitals =
  async (req, res) => {
    try {

      const vitals =
        await Vitals.find()
          // .populate("user")
          .sort({
            recordedAt: -1,
          });

      res.json(vitals);

    } catch (err) {

      res
        .status(500)
        .json({
          error:
            err.message,
        });
    }
  };


exports.getVitalById = async (req, res) => {
  try {

    const vital = await Vitals.findById(req.params.id);

    if (!vital) {
      return res.status(404).json({
        message: "Vital not found"
      });
    }

    res.json(vital);

  } catch (err) {

    res.status(500).json({
      error: err.message
    });
  }
};


exports.updateVital = async (req, res) => {
  try {

    const vital = await Vitals.findById(req.params.id);

    if (!vital) {
      return res.status(404).json({
        message: "Vital not found"
      });
    }

    const {
      systolic,
      diastolic,
      heartRate,
      temperature,
      sugarLevel,
      notes
    } = req.body;

    // Update BP
    if (systolic && diastolic) {

      vital.type = "bloodPressure";

      vital.bloodPressure = {
        systolic,
        diastolic,
        status: getBPStatus(
          systolic,
          diastolic
        )
      };
    }

    // Update HR
    if (heartRate) {

      vital.type = "heartRate";

      vital.heartRate = heartRate;

      vital.heartRateStatus =
        getHeartRateStatus(
          heartRate
        );
    }

    // Update Temp
    if (temperature) {

      vital.type = "temperature";

      const tempC =
        fahrenheitToCelsius(
          temperature
        );

      vital.temperature =
        temperature;

      vital.temperatureStatus =
        getTemperatureStatus(
          tempC
        );
    }

    // Update Sugar
    if (sugarLevel) {

      vital.type = "sugar";

      vital.sugarLevel =
        sugarLevel;

      vital.sugarStatus =
        getSugarStatus(
          sugarLevel
        );
    }

    if (notes !== undefined) {
      vital.notes = notes;
    }

    await vital.save();

    res.json(vital);

  } catch (err) {

    res.status(500).json({
      error: err.message
    });
  }
};


exports.deleteVital = async (req, res) => {
  try {

    const vital = await Vitals.findById(req.params.id);

    if (!vital) {
      return res.status(404).json({
        message: "Vital not found"
      });
    }

    await vital.deleteOne();

    res.json({
      message: "Deleted successfully"
    });

  } catch (err) {

    res.status(500).json({
      error: err.message
    });
  }
};