import { Grid, Card, Typography, Box } from "@mui/material";
import { ShowChart, Map, TrendingUp } from "@mui/icons-material";
import { motion } from "framer-motion";

const placeholders = [
  { title: "Track Schemes", icon: <ShowChart sx={{ fontSize: 40 }} /> },
  { title: "Compare Regions", icon: <Map sx={{ fontSize: 40 }} /> },
  { title: "Analyze Trends", icon: <TrendingUp sx={{ fontSize: 40 }} /> },
];

export default function EmptyState() {
  return (
    <Grid
      container
      spacing={4}
      mt={4}
      justifyContent="center"
      alignItems="stretch"
    >
      {placeholders.map((item, index) => (
        <Grid item xs={12} sm={6} md={4} key={index}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.15, type: "spring", stiffness: 80 }}
            whileHover={{ scale: 1.07, rotate: 1 }}
          >
            <Card
              sx={{
                height: "100%",
                textAlign: "center",
                p: 4,
                borderRadius: "20px",
                background:
                  "linear-gradient(145deg, rgba(25,118,210,0.08), rgba(25,118,210,0.02))",
                boxShadow: "0 4px 18px rgba(0,0,0,0.08)",
                transition: "all 0.35s ease",
                "&:hover": {
                  boxShadow: "0 8px 30px rgba(25,118,210,0.3)",
                  background:
                    "linear-gradient(145deg, rgba(25,118,210,0.15), rgba(25,118,210,0.05))",
                },
              }}
            >
              <Box
                sx={{
                  mb: 3,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 80,
                  height: 80,
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, #1976d2, #42a5f5)",
                  color: "white",
                  mx: "auto",
                  boxShadow: "0 6px 16px rgba(25, 118, 210, 0.5)",
                }}
              >
                {item.icon}
              </Box>
              <Typography
                variant="h6"
                gutterBottom
                sx={{
                  fontWeight: "bold",
                  letterSpacing: 0.5,
                  mb: 1,
                  color: "#0d47a1",
                }}
              >
                {item.title}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Explore insightful analytics about government schemes and
                regional performance.
              </Typography>
            </Card>
          </motion.div>
        </Grid>
      ))}
    </Grid>
  );
}
