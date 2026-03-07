const { renderValidationSummary, writeLine } = require("../services/output");

/**
 * Validate configuration input and print the normalized result without writing files.
 */
async function runValidateConfigCommand(context) {
  const { answers, colors, stdout } = context;
  writeLine(stdout, renderValidationSummary(colors, answers));
  return 0;
}

module.exports = {
  runValidateConfigCommand,
};
