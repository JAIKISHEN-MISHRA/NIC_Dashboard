import React from "react";
import { Box, Typography } from "@mui/material";
import { Insights } from "@mui/icons-material";
import { motion } from "framer-motion";

export default function WelcomeBanner() {
  return (
    <Box
      component={motion.div}
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      sx={{
        width: "100%",
        p: { xs: 2, sm: 3, md: 4 },
        mb: { xs: 2, md: 3 },
        borderRadius: 3,
        background: "linear-gradient(90deg, #1976d2, #42a5f5)",
        color: "#fff",
        display: "flex",
        flexDirection: { xs: "column", sm: "row" }, // stack on xs, row on sm+
        alignItems: "center",
        gap: { xs: 1.5, sm: 2, md: 3 },
        boxShadow: "0 6px 18px rgba(0,0,0,0.12)",
      }}
      role="region"
      aria-label="Welcome banner"
    >
      {/* Icon box */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: { xs: "center", sm: "flex-start" },
          flex: "0 0 auto",
        }}
      >
        <Insights
          sx={{
            fontSize: { xs: 40, sm: 52, md: 64 }, // responsive icon size
            transform: { xs: "none", md: "translateY(-2px)" },
          }}
          aria-hidden="true"
        />
      </Box>

      {/* Text block */}
      <Box
        sx={{
          textAlign: { xs: "center", sm: "left" },
          width: "100%",
        }}
      >
        <Typography
          component="h1"
          sx={{
            fontWeight: 700,
            lineHeight: 1.05,
            fontSize: { xs: "1.125rem", sm: "1.375rem", md: "1.75rem" }, // responsive sizes
            letterSpacing: 0.2,
          }}
        >
          MahitiSetu Dashboard
        </Typography>

        <Typography
          variant="subtitle1"
          sx={{
            mt: 0.5,
            fontSize: { xs: "0.875rem", sm: "1rem", md: "1.125rem" },
            opacity: 0.95,
          }}
        >
          Your bridge to transparent and accessible scheme insights.
        </Typography>
      </Box>
    </Box>
  );
}
