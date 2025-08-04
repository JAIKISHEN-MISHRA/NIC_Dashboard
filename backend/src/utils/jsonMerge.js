// File: backend/src/utils/jsonMerge.js

function isObject(item) {
  return item && typeof item === 'object' && !Array.isArray(item);
}

function mergeDeepSum(target, source) {
  for (const key in source) {
    if (isObject(source[key])) {
      if (!target[key]) target[key] = {};
      mergeDeepSum(target[key], source[key]);
    } else {
      if (!target[key]) target[key] = 0;
      target[key] += source[key];
    }
  }
}
function mergeDeepSumTime(target, source) {
  for (const key in source) {
    if (
      source[key] !== null &&
      typeof source[key] === 'object' &&
      !Array.isArray(source[key])
    ) {
      if (!target[key]) target[key] = {};
      mergeDeepSumTime(target[key], source[key]);
    } else if (typeof source[key] === 'number') {
      if (!target[key]) target[key] = 0;
      target[key] += source[key];
    }
  }
}



module.exports = { mergeDeepSum ,mergeDeepSumTime};
