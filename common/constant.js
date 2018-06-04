const [
  REAL_TIME_VIEW,
  HOUR_VIEW,
  MONTH_VIEW,
] = Array.from( new Array(10).keys() )

const SECOND = 1000;
const MINUTE = 60 * SECOND;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

module.exports = {
  REAL_TIME_VIEW,
  HOUR_VIEW,
  MONTH_VIEW,
  SECOND,
  MINUTE,
  HOUR,
  DAY
}