import React from 'react';
import BannerSlider from '../Components/Banner';
import OnboardingSteps from './Onboarding';
import '../css/MainPage.css';
import { Container, Typography, Card, CardContent, Box } from '@mui/material';
import { motion } from 'framer-motion';
import AboutMahitiSetu from '../Components/AboutMahitiSetu';

export default function Home() {
  return (
    <div>
      {/* Banner Slider */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8 }}>
        <BannerSlider />
      </motion.div>

      {/* Dashboard Overview Text */}
      <Container maxWidth="lg" sx={{ my: 5 }}>
        <motion.div
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          <Card elevation={4} sx={{ borderRadius: 3, p: 2 }}>
            <CardContent>
              <Typography variant="h4" gutterBottom color="primary">
                Dashboard Overview
              </Typography>
              <Typography variant="body1" color="text.secondary">
                The dashboard allows users to view scheme-wise data in a visual format, enabling
                easier analysis and tracking. This includes charts, graphs, and other visual tools
                that make it simple to understand the distribution, performance, and impact of
                government schemes.
              </Typography>
            </CardContent>
          </Card>
        </motion.div>
      </Container>

      {/* Onboarding Steps */}
      <Box sx={{ mt: 5 }}>
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          <OnboardingSteps />
        </motion.div>
      </Box>
      <AboutMahitiSetu/>
    </div>
  );
}
