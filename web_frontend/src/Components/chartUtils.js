// src/Components/charts/chartUtils.js

export const COLORS = [
  "#8884d8", "#82ca9d", "#ffc658", "#ff8042", "#00C49F", "#FFBB28",
  "#0088FE", "#FF4444", "#7B1FA2", "#3949AB", "#E91E63", "#009688"
];

export const deepGet = (obj, pathArr = []) =>
  pathArr.reduce((acc, k) => (acc && acc[k] != null ? acc[k] : undefined), obj);

export const extractChartSections = (node, path = [], titleSoFar = "") => {
  if (!node || typeof node !== "object") return [];

  const sections = [];

  const numericChildren = [];
  const pathMap = {};
  const nestedEntries = [];

  for (const [k, v] of Object.entries(node)) {
    if (typeof v === "number" && Number.isFinite(v)) {
      numericChildren.push({ name: k, value: v });
      pathMap[k] = [...path, k];
    } else if (v && typeof v === "object") {
      nestedEntries.push([k, v]);
    }
  }

  if (numericChildren.length > 0) {
    sections.push({
      title: titleSoFar || (path.length ? path[path.length - 1] : "Overview"),
      data: numericChildren,
      keys: ["value"],
      pieData: numericChildren,
      pathMap,
      parentPath: [...path],
    });
  }

  for (const [k, childObj] of nestedEntries) {
    const childPath = [...path, k];
    const childTitle = titleSoFar ? `${titleSoFar} > ${k}` : k;
    sections.push(...extractChartSections(childObj, childPath, childTitle));
  }

  return sections;
};

const flattenNested = (obj, prefix = "") => {
  const out = {};
  for (const [k, v] of Object.entries(obj || {})) {
    const newKey = prefix ? `${prefix}.${k}` : k;
    if (v && typeof v === "object" && !Array.isArray(v)) {
      Object.assign(out, flattenNested(v, newKey));
    } else if (typeof v === "number" && Number.isFinite(v)) {
      out[newKey] = v;
    }
  }
  return out;
};

export const transformTimeSeriesData = (rawData) => {
  if (!rawData || !Array.isArray(rawData) || rawData.length === 0) {
    return { data: [], keys: [] };
  }

  const chartRows = [];
  const allKeys = new Set();

  rawData.forEach(periodObject => {
    const { period, ts, data } = periodObject;
    if (!data) return;

    const flat = flattenNested(data);
    Object.keys(flat).forEach(k => allKeys.add(k));

    chartRows.push({
      period: period,
      ts,
      ...flat
    });
  });

  chartRows.sort((a, b) => (a.ts ?? 0) - (b.ts ?? 0));

  console.log("Transformed chartRows:", chartRows);
  console.log("All keys:", Array.from(allKeys));

  return {
    data: chartRows,
    keys: Array.from(allKeys),
  };
};
