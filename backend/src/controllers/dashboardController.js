const pool = require('../db');
const {  mergeDeepSumTime } = require('../utils/jsonMerge');

exports.getDashboardData = async (req, res) => {
  const { scheme_code, periods, ...locationParams } = req.body.params;

  if (!/^[a-zA-Z0-9_]+$/.test(scheme_code)) {
    return res.status(400).json({ error: 'Invalid scheme code format' });
  }
  const tableName = `t_${scheme_code}_data`;

  const { conditions, values } = buildBaseClause(locationParams);

  if (periods && periods.length > 0) {
    const periodPlaceholders = periods.map((_, i) => `$${values.length + i + 1}`).join(',');
    conditions.push(`period IN (${periodPlaceholders})`);
    values.push(...periods);
  } else if (locationParams.year && locationParams.month) {
    conditions.push(`year = $${values.length + 1}`);
    values.push(locationParams.year);
    conditions.push(`month = $${values.length + 1}`);
    values.push(locationParams.month);
  }

  const whereClause = `WHERE ${conditions.join(' AND ')}`;

  try {
    const query = `SELECT data FROM ${tableName} ${whereClause}`;
    const result = await pool.query(query, values);

    if (!result.rows || result.rows.length === 0) {
      return res.json({
        merged: {},
        stats: {},
        explanations: getSimpleExplanations()
      });
    }

    // Map path -> array of {v: number, period: timestamp | null}
    const valueMap = new Map();

    const isObject = (v) => v && typeof v === 'object' && !Array.isArray(v);

    // matches YYYY, YYYYMM, YYYYMMDD, YYYY-MM, YYYY-MM-DD, YYYY_MM_DD
    const periodRegex = /^(?:\d{4}(?:[-_]\d{2}(?:[-_]\d{2})?)?|\d{6,8})$/;

    // parse period string to Date (try common formats). Returns timestamp (ms) or null.
    function parsePeriodToTs(p) {
      if (!p || typeof p !== 'string') return null;
      // try YYYY-MM-DD or YYYY_MM_DD
      const hyphenOrUnderscore = /^(\d{4})[-_](\d{2})[-_](\d{2})$/;
      const ym = /^(\d{4})[-_](\d{2})$/;
      const y = /^(\d{4})$/;
      const digits6 = /^\d{6}$/;   // YYYYMM
      const digits8 = /^\d{8}$/;   // YYYYMMDD

      let m;
      if ((m = p.match(hyphenOrUnderscore))) {
        return new Date(`${m[1]}-${m[2]}-${m[3]}`).getTime();
      } else if ((m = p.match(ym))) {
        return new Date(`${m[1]}-${m[2]}-01`).getTime();
      } else if ((m = p.match(y))) {
        return new Date(`${m[1]}-01-01`).getTime();
      } else if (digits8.test(p)) {
        return new Date(`${p.slice(0,4)}-${p.slice(4,6)}-${p.slice(6,8)}`).getTime();
      } else if (digits6.test(p)) {
        return new Date(`${p.slice(0,4)}-${p.slice(4,6)}-01`).getTime();
      }
      // fallback: try Date constructor (may work)
      const d = new Date(p);
      return isNaN(d.getTime()) ? null : d.getTime();
    }

    /**
     * traverseAndCollect(node, pathParts, currentPeriodTs)
     * - If current object has only period-like keys, we collapse that level and pass down period timestamps.
     * - For leaves we store {v: number, period: timestamp|null}
     */
    function traverseAndCollect(node, path = [], currentPeriodTs = null) {
      if (isObject(node)) {
        const keys = Object.keys(node);
        if (keys.length > 0 && keys.every(k => periodRegex.test(k))) {
          // collapse level: iterate children but pass period timestamp down
          for (const k of keys) {
            const ts = parsePeriodToTs(k);
            traverseAndCollect(node[k], path, ts ?? currentPeriodTs);
          }
          return;
        }
        for (const k of keys) {
          traverseAndCollect(node[k], path.concat(k), currentPeriodTs);
        }
      } else if (Array.isArray(node)) {
        node.forEach((item, idx) => traverseAndCollect(item, path.concat(String(idx)), currentPeriodTs));
      } else {
        // leaf: parse numeric
        const raw = node;
        const num = typeof raw === 'number' ? raw : (raw === null || raw === undefined ? NaN : parseFloat(String(raw)));
        if (!Number.isNaN(num)) {
          const key = path.join('.');
          if (!valueMap.has(key)) valueMap.set(key, []);
          valueMap.get(key).push({ v: num, period: currentPeriodTs });
        }
        // non-numeric ignored
      }
    }

    // Collect values
    result.rows.forEach(row => {
      if (row.data) traverseAndCollect(row.data, [], null);
    });

    // helper to compute stats from array of numbers
    function computeStatsFromNums(nums) {
      const n = nums.length;
      const sorted = nums.slice().sort((a,b)=>a-b);
      const sum = nums.reduce((s,x)=>s+x,0);
      const mean = sum / n;
      const median = n % 2 === 1 ? sorted[(n-1)/2] : (sorted[n/2 -1] + sorted[n/2]) / 2;

      const freq = {};
      let maxFreq = 0;
      for (const v of nums) {
        freq[v] = (freq[v] || 0) + 1;
        if (freq[v] > maxFreq) maxFreq = freq[v];
      }
      const modes = Object.keys(freq).filter(k => freq[k] === maxFreq).map(Number);

      let variance = 0;
      if (n > 0) variance = nums.reduce((acc,x)=>acc + Math.pow(x-mean,2),0) / n;
      const sd = Math.sqrt(variance);

      const rr = (v) => (Number.isInteger(v) ? v : Math.round((v + Number.EPSILON) * 100) / 100);

      return { sum: rr(sum), count: n, mean: rr(mean), median: rr(median), mode: modes, variance: rr(variance), sd: rr(sd) };
    }

    function setDeep(target, pathParts, value) {
      let cur = target;
      for (let i = 0; i < pathParts.length - 1; i++) {
        const p = pathParts[i];
        if (!(p in cur)) cur[p] = {};
        cur = cur[p];
      }
      cur[pathParts[pathParts.length - 1]] = value;
    }

    const statsTree = {};
    const mergedTree = {};

    // decide merging strategy per-key: default SUM, but use LATEST for progressive/cumulative keys
    const progressiveKeywords = ['progress', 'cumul', 'cumulative', 'running', 'running_total'];

    for (const [path, items] of valueMap.entries()) {
      const parts = path.split('.');
      const nums = items.map(it => it.v);

      // compute stats on numeric values
      const stats = computeStatsFromNums(nums);
      setDeep(statsTree, parts, stats);

      // choose merged value:
      const lastKey = parts[parts.length - 1] ? parts[parts.length - 1].toLowerCase() : '';
      const isProgressiveKey = progressiveKeywords.some(k => lastKey.includes(k));

      let mergedValue;
      if (isProgressiveKey) {
        // pick value from the item with the latest known period timestamp (if present),
        // otherwise pick max value as fallback
        let best = null;
        for (const it of items) {
          if (it.period != null) {
            if (!best || (it.period > best.period)) best = it;
          } else if (!best) {
            best = it; // fallback to first if no timestamp anywhere
          }
        }
        if (best && best.v != null) mergedValue = best.v;
        else mergedValue = Math.max(...nums);
      } else {
        // default: sum (rounded like stats.sum)
        mergedValue = stats.sum;
      }

      setDeep(mergedTree, parts, mergedValue);
    }

    res.json({
      merged: mergedTree,
      stats: statsTree,
      explanations: getSimpleExplanations()
    });
  } catch (error) {
    console.error('Error in /getDashboardData:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
};

// explanations (unchanged)
function getSimpleExplanations() {
  return {
    sum: 'Total of all values with the same key (e.g., total daily rainfall across days).',
    count: 'Number of data points that contributed to this value.',
    mean: 'Average value: sum divided by count.',
    median: 'Middle value when all numbers are sorted.',
    mode: 'Most frequent value(s).',
    variance: 'Average squared distance from the mean — tells how spread out the numbers are.',
    sd: 'Standard deviation (square root of variance) — intuitive measure of spread.'
  };
}



// Drop-in replacement for getTimeSeriesData
exports.getTimeSeriesData = async (req, res) => {
  const { scheme_code, periods, ...locationParams } = req.body.params;

  if (!/^[a-zA-Z0-9_]+$/.test(scheme_code)) {
    return res.status(400).json({ error: 'Invalid scheme code format' });
  }
  const tableName = `t_${scheme_code}_data`;

  const { conditions, values } = buildBaseClause(locationParams);

  if (periods && periods.length > 0) {
    const periodPlaceholders = periods.map((_, i) => `$${values.length + i + 1}`).join(',');
    conditions.push(`period IN (${periodPlaceholders})`);
    values.push(...periods);
  }

  const whereClause = `WHERE ${conditions.join(' AND ')}`;

  // select only year, month, data (no period column)
  const query = `
    SELECT year, month, data
    FROM ${tableName}
    ${whereClause}
    ORDER BY year, month;
  `;

  try {
    const result = await pool.query(query, values);

    // helpers
    const isObject = (v) => v && typeof v === 'object' && !Array.isArray(v);

    // period detection: YYYY, YYYYMM, YYYYMMDD, YYYY-MM, YYYY-MM-DD, YYYY_MM_DD
    const periodRegex = /^(?:\d{4}(?:[-_]\d{2}(?:[-_]\d{2})?)?|\d{6,8})$/;

    function parsePeriodToTs(p) {
      if (!p || typeof p !== 'string') return null;
      const hyu = /^(\d{4})[-_](\d{2})[-_](\d{2})$/; // YYYY-MM-DD or YYYY_MM_DD
      const ym = /^(\d{4})[-_](\d{2})$/;             // YYYY-MM
      const y = /^(\d{4})$/;
      const d8 = /^\d{8}$/; // YYYYMMDD
      const d6 = /^\d{6}$/; // YYYYMM
      let m;
      if ((m = p.match(hyu))) return new Date(`${m[1]}-${m[2]}-${m[3]}`).getTime();
      if ((m = p.match(ym))) return new Date(`${m[1]}-${m[2]}-01`).getTime();
      if ((m = p.match(y))) return new Date(`${m[1]}-01-01`).getTime();
      if (d8.test(p)) return new Date(`${p.slice(0,4)}-${p.slice(4,6)}-${p.slice(6,8)}`).getTime();
      if (d6.test(p)) return new Date(`${p.slice(0,4)}-${p.slice(4,6)}-01`).getTime();
      const d = new Date(p);
      return isNaN(d.getTime()) ? null : d.getTime();
    }

    // Recursively look for any date-like value inside object: returns string (raw) or null
    function findDateStringInObject(obj) {
      if (!isObject(obj)) return null;
      const candidateKeys = ['date', 'dt', 'day', 'timestamp', 'ts'];
      // first look for explicit date-like keys
      for (const k of candidateKeys) {
        if (k in obj) {
          const v = obj[k];
          if (typeof v === 'string' && parsePeriodToTs(v) !== null) return v;
          if (typeof v === 'number') {
            // maybe epoch ms or yyyymmdd
            const s = String(v);
            if (periodRegex.test(s)) return s;
          }
        }
      }
      // then search all keys for period-like keys or values
      for (const k of Object.keys(obj)) {
        // key itself matches period (rare)
        if (periodRegex.test(k)) return k;
        const v = obj[k];
        if (typeof v === 'string' && parsePeriodToTs(v) !== null) return v;
        if (typeof v === 'number' && periodRegex.test(String(v))) return String(v);
        if (isObject(v)) {
          const nested = findDateStringInObject(v);
          if (nested) return nested;
        }
      }
      return null;
    }

    // merging strategy: sum numeric leaves, progressive-like keys -> max/latest
    const progressiveKeywords = ['progress', 'cumul', 'cumulative', 'running', 'running_total', 'progressive'];

    function mergeTwo(target, source) {
      for (const key of Object.keys(source)) {
        const srcVal = source[key];
        const tgtVal = target[key];

        if (isObject(srcVal)) {
          if (!isObject(tgtVal)) target[key] = {};
          mergeTwo(target[key], srcVal);
        } else if (Array.isArray(srcVal)) {
          if (!Array.isArray(tgtVal)) target[key] = [];
          target[key] = target[key].concat(srcVal);
        } else {
          const num = (typeof srcVal === 'number') ? srcVal : (srcVal == null ? NaN : parseFloat(String(srcVal)));
          const keyLower = key.toLowerCase();
          const isProgressiveKey = progressiveKeywords.some(k => keyLower.includes(k));

          if (!Number.isNaN(num)) {
            if (tgtVal === undefined) {
              target[key] = num;
            } else {
              const tgtNum = (typeof tgtVal === 'number') ? tgtVal : (Number.isNaN(parseFloat(String(tgtVal))) ? null : parseFloat(String(tgtVal)));
              if (tgtNum === null || Number.isNaN(tgtNum)) {
                target[key] = num;
              } else {
                if (isProgressiveKey) {
                  target[key] = Math.max(tgtNum, num);
                } else {
                  target[key] = tgtNum + num;
                }
              }
            }
          } else {
            // non-numeric: keep existing target if exists, otherwise set source
            if (tgtVal === undefined) target[key] = srcVal;
          }
        }
      }
    }

    // grouped map: periodStr -> { period: periodStr, ts, year, month, dataList: [ objs ... ] }
    const grouped = new Map();

    // For each DB row, either expand date-keys inside data OR treat entire row as single period (try to find date inside)
    result.rows.forEach(({ year, month, data }) => {
      if (!data) return;

      if (isObject(data)) {
        const topKeys = Object.keys(data);
        // If top-level keys are all period-like (YYYY..., YYYY-MM-DD...), expand them
        if (topKeys.length > 0 && topKeys.every(k => periodRegex.test(k))) {
          for (const k of topKeys) {
            const val = data[k];
            const periodStr = k;
            const ts = parsePeriodToTs(periodStr);
            const y = ts ? new Date(ts).getFullYear() : year;
            const m = ts ? new Date(ts).getMonth() + 1 : month;
            if (!grouped.has(periodStr)) grouped.set(periodStr, { period: periodStr, ts, year: y, month: m, dataList: [] });
            // the value under the period key is usually an object of metrics; ensure object
            grouped.get(periodStr).dataList.push(isObject(val) ? val : { value: val });
          }
          return;
        }

        // otherwise, try to find a date inside this object
        const foundDate = findDateStringInObject(data);
        if (foundDate) {
          const periodStr = foundDate;
          const ts = parsePeriodToTs(periodStr);
          const y = ts ? new Date(ts).getFullYear() : year;
          const m = ts ? new Date(ts).getMonth() + 1 : month;
          if (!grouped.has(periodStr)) grouped.set(periodStr, { period: periodStr, ts, year: y, month: m, dataList: [] });
          // when a date is found nested, we want to push the whole data object (or the sibling metrics)
          grouped.get(periodStr).dataList.push(data);
          return;
        }
      }

      // Fallback: use year-month grouping
      const periodStr = `${String(year)}-${String(month).padStart(2, '0')}`;
      const ts = parsePeriodToTs(periodStr);
      if (!grouped.has(periodStr)) grouped.set(periodStr, { period: periodStr, ts, year, month, dataList: [] });
      grouped.get(periodStr).dataList.push(data);
    });

    // Now merge dataList for each period
    const out = [];
    for (const [pStr, entry] of grouped.entries()) {
      const mergedData = {};
      for (const d of entry.dataList) {
        mergeTwo(mergedData, d || {});
      }
      out.push({
        period: entry.period,
        ts: entry.ts,
        year: entry.year ?? null,
        month: entry.month ?? null,
        data: mergedData
      });
    }

    // sort by timestamp when available, else by period string
    out.sort((a, b) => {
      if (a.ts != null && b.ts != null) return a.ts - b.ts;
      if (a.ts != null) return -1;
      if (b.ts != null) return 1;
      return a.period.localeCompare(b.period);
    });

    res.json(out);
  } catch (error) {
    console.error("Error in getTimeSeriesData:", error);
    res.status(500).json({ error: "Failed to fetch time series data" });
  }
};




const buildBaseClause = (params) => {
  const { state_code, division_code, district_code, taluka_code } = params;
  const conditions = ["is_active = true"];
  const values = [];

  const addCondition = (field, value) => {
    if (value) {
      conditions.push(`${field} = $${values.length + 1}`);
      values.push(value);
    }
  };

  addCondition('state_code', state_code);
  addCondition('division_code', division_code);
  addCondition('district_code', district_code);
  addCondition('taluka_code', taluka_code);

  return { conditions, values };
};