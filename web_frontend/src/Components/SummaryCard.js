import React from "react";
import { Card, CardContent, Typography, Box, Tooltip } from "@mui/material";
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';

function humanFormatNumber(n) {
  if (n == null || n === '' || Number.isNaN(Number(n))) return '—';
  const num = Number(n);
  const abs = Math.abs(num);
  if (abs >= 1e9) return (num / 1e9).toFixed(2).replace(/\.00$/, '') + 'B';
  if (abs >= 1e6) return (num / 1e6).toFixed(2).replace(/\.00$/, '') + 'M';
  if (abs >= 1e3) return (num / 1e3).toFixed(2).replace(/\.00$/, '') + 'k';
  // else show with up to 2 decimals but drop trailing zeros
  if (Number.isInteger(num)) return num.toLocaleString();
  return Number(Math.round(num * 100) / 100).toLocaleString();
}

export default function SummaryCard({ title, value, delta = null, percent = null }) {
  const safeValue = value == null || Number.isNaN(Number(value)) ? null : Number(value);
  const formattedValue = humanFormatNumber(safeValue);

  // delta: numeric change (can be positive/negative) — show arrow + value
  const hasDelta = delta !== null && delta !== undefined && !Number.isNaN(Number(delta));
  const deltaNum = hasDelta ? Number(delta) : 0;
  const deltaPositive = deltaNum > 0;

  return (
    <Card sx={{ height: '100%', borderLeft: '4px solid', borderColor: deltaPositive ? 'success.main' : (hasDelta ? 'error.main' : 'primary.main') }}>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {title}
            </Typography>
            <Typography variant="h4" component="div" fontWeight={700}>
              {formattedValue}
            </Typography>
          </Box>

          <Box textAlign="right">
            {hasDelta && (
              <Tooltip title={`Change: ${deltaNum}`}>
                <Box display="flex" alignItems="center" justifyContent="flex-end">
                  {deltaPositive ? (
                    <ArrowUpwardIcon sx={{ color: 'success.main', fontSize: 18 }} />
                  ) : (
                    <ArrowDownwardIcon sx={{ color: 'error.main', fontSize: 18 }} />
                  )}
                  <Typography variant="body2" sx={{ ml: 0.5 }}>
                    {Math.abs(deltaNum)}
                  </Typography>
                </Box>
              </Tooltip>
            )}

            {percent != null && !Number.isNaN(Number(percent)) && (
              <Typography variant="caption" color="text.secondary">
                {Number(percent).toFixed(2)}%
              </Typography>
            )}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}
