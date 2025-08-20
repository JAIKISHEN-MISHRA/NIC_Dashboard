// src/Components/charts/chartUtils.js

export const COLORS = [
  "#8884d8", "#82ca9d", "#ffc658", "#ff8042", "#00C49F", "#FFBB28",
  "#0088FE", "#FF4444", "#7B1FA2", "#3949AB", "#E91E63", "#009688"
];

/**
 * Calculates a true "Grand Total" by recursively summing every number in the object.
 * This clarifies what the total represents.
 * @param {object} data The dashboard data object.
 * @returns {number} The sum of all numerical values.
 */
export const calculateGrandTotal = (data) => {
  let total = 0;
  const walk = (node) => {
    if (typeof node === 'number') {
      total += node;
    } else if (typeof node === 'object' && node !== null) {
      Object.values(node).forEach(walk);
    }
  };
  walk(data);
  return total;
};

/**
 * Extracts top-level numerical values to be used as Key Performance Indicators (KPIs).
 * @param {object} data The dashboard data object.
 * @param {number} grandTotal The pre-calculated grand total.
 * @returns {Array<{title: string, value: number}>} An array of summary objects for cards.
 */
export const calculateSummaries = (data, grandTotal) => {
  if (!data || typeof data !== 'object') return [];
  const summaries = [{ title: "Grand Total", value: grandTotal }];

  for (const [key, value] of Object.entries(data)) {
    if (typeof value === 'number' && !key.toLowerCase().includes('total')) {
      summaries.push({ title: key, value });
    }
  }
  return summaries.slice(0, 5); // Return Grand Total + up to 4 other top-level metrics.
};

/**
 * Intelligently extracts chart sections from dashboard data.
 * It groups sibling numerical values to create meaningful comparison charts.
 * @param {object} obj The data object to parse.
 * @param {string} parentTitle The title inherited from the parent key.
 * @returns {Array<object>} An array of chart section configurations.
 */
export const extractChartSections = (obj, parentTitle = "") => {
  if (!obj || typeof obj !== "object") return [];
  
  const sections = [];
  const immediateNumericChildren = {};
  const nestedObjects = {};

  // Separate numbers from nested objects at the current level
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === "number") {
      immediateNumericChildren[key] = value;
    } else if (value && typeof value === "object") {
      nestedObjects[key] = value;
    }
  }

  // If there are multiple sibling numbers, group them into one comparison chart.
  if (Object.keys(immediateNumericChildren).length > 1) {
    const dataKeys = Object.keys(immediateNumericChildren);
    const chartData = dataKeys.map(key => ({ name: key, value: immediateNumericChildren[key] }));
    
    sections.push({
      title: parentTitle || "Overall Summary",
      // data for Bar/Line chart
      data: chartData, 
      // data formatted for Pie chart
      pieData: chartData, 
      keys: ['value'],
      defaultChartType: 'bar', 
    });
  }

  // Recursively process nested objects to create more charts.
  for (const [key, value] of Object.entries(nestedObjects)) {
    const newTitle = parentTitle ? `${parentTitle} > ${key}` : key;
    sections.push(...extractChartSections(value, newTitle));
  }

  return sections;
};

/**
 * Transforms the raw time-series array into a single, unified structure for a line chart.
 * This solves the problem of creating a new chart for each day/month.
 * @param {Array<object>} rawData The raw data from the API.
 * @returns {{data: Array<object>, keys: Array<string>}} A single chart configuration object.
 */
export const transformTimeSeriesData = (rawData) => {
    if (!rawData || !Array.isArray(rawData) || rawData.length === 0) {
        return { data: [], keys: [] };
    }

    const unifiedData = {};
    const allKeys = new Set();

    // The backend gives an array of objects, each for a month/year.
    rawData.forEach(periodObject => {
        // Inside, the `data` property holds the daily/weekly entries.
        const periodData = periodObject.data;
        if (!periodData) return;

        Object.entries(periodData).forEach(([dateLabel, values]) => {
            // `dateLabel` is e.g., "2025-06-01"
            // `values` is e.g., { "Progressive (mm)_25": 6.2, "Daily Rainfall(mm)_24": 6.2 }
            
            if (!unifiedData[dateLabel]) {
                unifiedData[dateLabel] = { label: dateLabel };
            }

            Object.entries(values).forEach(([key, value]) => {
                if (typeof value === 'number') {
                    allKeys.add(key); // Collect all unique metric names
                    unifiedData[dateLabel][key] = value;
                }
            });
        });
    });
    
    // Convert the unified object into a sorted array for charting.
    const chartData = Object.values(unifiedData).sort((a, b) => new Date(a.label) - new Date(b.label));
    
    return {
        data: chartData,
        keys: Array.from(allKeys),
    };
};