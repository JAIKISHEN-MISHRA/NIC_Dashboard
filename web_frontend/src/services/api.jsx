// src/services/api.jsx
import axios from 'axios';

const BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: BASE_URL,
});

const safeRequest = async (request) => {
  try {
    const response = await request;
    return { data: response.data, error: null };
  } catch (error) {
    console.error('API error:', error?.response?.data || error.message || error);
    return { data: null, error };
  }
};

// ================= AUTH =================
export const loginUser = (credentials) =>
  safeRequest(api.post('/login', credentials));

export const submitSignup = (payload) =>
  safeRequest(api.post('/signup', payload));

export const changePassword = (payload) =>
  safeRequest(api.post('/change-password', payload));

// ================= LOCATION DATA =================
export const getStates = () =>
  safeRequest(api.get('/states'));
export const getMinistry = async () => safeRequest(api.get('/ministry'));


export const getDivisions = (stateCode) =>
  safeRequest(api.get(`/divisions/${stateCode}`));

// aaru
export const getDepartments = async (stateCode) =>
  safeRequest(api.get(`/departments/${stateCode}`));
// 

export const getDistricts = (stateCode, divisionCode) =>
  safeRequest(api.get(`/districts`, {
    params: { state_code: stateCode, division_code: divisionCode }
  }));

export const getTalukas = (stateCode, divisionCode, districtCode) =>
  safeRequest(api.get(`/talukas`, {
    params: { 
      state_code: stateCode, 
      division_code: divisionCode, 
      district_code: districtCode 
    }
  }));

// ================= SCHEMES =================
export const fetchSchemes = () =>
  safeRequest(api.get('/scheme/list'));

export const fetchSchemes2 = () =>
  safeRequest(api.get('/scheme/list2'));

export const fetchSchemeStructure = (schemeCode) =>
  safeRequest(api.get(`/scheme/${schemeCode}/categories`));

export const uploadSchemeData = (payload) =>
  safeRequest(api.post('/scheme/data', payload));

// ================= DASHBOARD =================
export const getDashboardData = (filters) =>
  safeRequest(api.post('/getDashboardData', filters));

export const getTimeSeriesData = (payload) =>
  safeRequest(api.post('/dashboard/timeseries', payload));

// ================= APPROVAL =================
export const fetchApprovalData = (schemeCode) =>
  safeRequest(api.get(`/scheme/${schemeCode}`));

export const approveData = (id) =>
  safeRequest(api.post(`/scheme/approval/${id}/approve`));

export const rejectData = (id, remark) =>
  safeRequest(api.post(`/scheme/approval/${id}/reject`, { remark }));




export const fetchSchemeData = (schemeCode) =>
  safeRequest(api.get(`/scheme/${schemeCode}/data`));

export const updateSchemeData = (schemeCode, id, data) =>
  safeRequest(api.put(`/scheme/${schemeCode}/data/${id}`, data));

