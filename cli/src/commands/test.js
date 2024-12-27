// this is where we analyze the project
import { getConfig } from "../src/config/config-mgr.js";

import { logger } from "../../logger.js";

export async function analyze() {
  logger.highlight("Starting analysis...");

  const configType = getConfig();
  if (!configType) {
    logger.warning("No Webpack or Vite config found. Exiting.");
    return;
  }

  const config = await parseConfig(configType);
  logger.debug("Parsed config:", config);

  // here we analyze security headers (when dev server starts)
  const securityFindings = analyzeSecurity(config, configType);
  const vulnerabilities = await checkVulnerabilities();

  // we measure the performance
  const { buildTime, bundlSize, memoryUsage } = await rundBuildAndMeasure(
    configType
  );

  const suggestions = generateSuggestions({
    securityFindings,
    vulnerabilities,
    buildTime,
    bundlSize,
    memoryUsage,
  });

  function analyzeSecurity(config, configType) {
    const findings = [];
    if (configType === "webpack") {
      if (!config.devServer || !config.devServer.headers) {
        findings.push(
          "Missing security headers in Webpack devServer. Consider CORS and security headers"
        );
      }
    } else {
      if (!connfig.server || !config.server.headers) {
        findings.push(
          "Missing security headers in Virte dev server. Consider adding headers or using HTTPS."
        );
      }
    }
    return findings;
  }

  function printReport(report) {
    console.log("\n=== Analysis Report ===");
    if (report.securityFindings.length > 0) {
      console.log("Security Findings:");
      report.securityFindings.forEach((f) => console.log("- ", f));
    } else {
      console.log("No major security issues detected in dev server setup");
    }

    console.log("\nVulnerabilities:");
    if (report.vulnerabilities.length > 0) {
      report.vulnerabilities.forEach((v) =>
        console.log(`- ${v.package}: ${v.severity} - ${v.advisory}`)
      );
    } else {
      console.log("No known vulnerabilities found.");
    }

    console.log(`\nBuild Time: ${report.buildTime}ms`);
    console.log("Bundle Sizes:");

    Object.entries(report.bundlSize).forEach((bundle, size) => {
      console.log(`- ${bundle}: ${(size / 1024).toFixed(2)} KB`);
    });

    console.log(`Memorty Usage: ${report.memoryUsage} MB`);

    console.log("\nSuggestions:");
    if (report.suggestions.length > 0) {
      report.suggestions.forEach((s) => console.log("- ", s));
    } else {
      console.log("Your setup looks good! No immediate suggestions.");
    }
    console.log("======================\n");
  }
}
