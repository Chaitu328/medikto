const PLAN_LIMITS = {
  free: {
    reports: 5,
    medications: 2
  },
  basic: {
    reports: 50,
    medications: 5
  },
  premium: {
    reports: Infinity,
    medications: Infinity
  }
};

module.exports = PLAN_LIMITS;