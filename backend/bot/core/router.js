const { render_chart } = require('../tools/renderChart');
const { quiz_new, quiz_check } = require('../tools/quizzes');
const { profile_update } = require('../tools/profile');
const { upsell_offer } = require('../tools/upsell');
const { get_courses, get_course_detail } = require('../tools/courses');
const { get_price, get_market_analysis } = require('../tools/prices');

const tools = { render_chart, quiz_new, quiz_check, profile_update, upsell_offer, get_courses, get_course_detail, get_price, get_market_analysis };

const routeToolCall = async (call) => {
  const { name, arguments: args } = call;
  if (!tools[name]) throw new Error('Unknown tool');
  return tools[name](args || {});
};

module.exports = { routeToolCall };
