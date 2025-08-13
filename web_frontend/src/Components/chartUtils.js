// src/components/charts/ChartUtils.js
export const COLORS = [
  "#8884d8", "#82ca9d", "#ffc658", "#ff8042", "#00C49F",
  "#FFBB28", "#0088FE", "#FF4444", "#7B1FA2", "#3949AB",
  "#E91E63", "#009688"
];

export const extractChartSections = (obj, parentTitle = "") => {
  const sections = [];
  if (!obj || typeof obj !== "object") return sections;

  const chartData = [];

  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === "number") {
      chartData.push({ name: key, value });
    } else if (value && typeof value === "object") {
      const allNumbers = Object.values(value).every(v => typeof v === "number");

      if (allNumbers) {
        sections.unshift({
          title: parentTitle ? `${parentTitle} > ${key}` : key,
          type: "jointBar",
          data: Object.entries(value).map(([k, v]) => ({ name: k, value: v })),
        });
      } else {
        sections.push(...extractChartSections(value, parentTitle ? `${parentTitle} > ${key}` : key));
      }
    }
  }

  if (chartData.length > 0) {
    sections.unshift({
      title: parentTitle || "Summary",
      type: "bar",
      data: chartData,
    });
  }

  return sections;
};

export const transformTimeSeries = (raw) => {
  const result = {};
  raw.forEach(({ year, month, data }) => {
    const label = `${month}/${year}`;
    const sections = extractChartSections(data);

    sections.forEach(({ title, data: values, type }) => {
      if (!result[title]) result[title] = { type, data: [] };
      const entry = { label };
      values.forEach(({ name, value }) => { entry[name] = value; });
      result[title].data.push(entry);
    });
  });
  return result;
};
