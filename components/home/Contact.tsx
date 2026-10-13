"use client";

import AccessTimeIcon from "@mui/icons-material/AccessTime";
import EmailIcon from "@mui/icons-material/Email";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import PhoneIcon from "@mui/icons-material/Phone";
import {
  Box,
  Button,
  CircularProgress,
  Grid,
  IconButton,
  TextField,
  Typography,
} from "@mui/material";
import axios from "axios";
import { useState } from "react";

export function ContactSection({ mobile }: { mobile?: boolean }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    name: "",
    message: "",
  });
  const sendMail = async (e: any) => {
    setLoading(true);
    e.preventDefault();
    try {
      const res = await axios.post(
        "https://auntychyskitchin.vercel.app/api/sendmail",
        formData
      );
      setFormData({
        email: "",
        name: "",
        message: "",
      });
      alert("Message Sent Successfully");
    } catch (error) {
      console.log(error);
      alert("something went wrong");
    }
    setLoading(false);
  };
  return (
    <Box
      sx={{
        padding: mobile ? "60px 0px" : "100px 0px",
        backgroundColor: "#f7f7f7",
        color: "#000",
      }}
    >
      <div
        className="innersection"
        style={{
          display: "flex",
          alignItems: "center",
        }}
      >
        <Grid container spacing={2} alignItems={"flex-start"}>
          <Grid item xs={12} md={6}>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <IconButton
                  color="primary"
                  size="large"
                  style={{ background: "#cda45e", color: "#fff" }}
                >
                  <LocationOnIcon />
                </IconButton>
                <Box>
                  <Typography variant="h6">Location:</Typography>
                  <Typography>Cobb Parkway, Marietta GA, 30064</Typography>
                </Box>
              </Box>

              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <IconButton
                  color="primary"
                  size="large"
                  style={{ background: "#cda45e", color: "#fff" }}
                >
                  <AccessTimeIcon sx={{ transform: "rotate(90deg)" }} />
                </IconButton>
                <Box>
                  <Typography variant="h6">Open Hours:</Typography>
                  <Typography>
                    Monday-Saturday:
                    <br />
                    00:00 AM - 11:00 PM
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <IconButton
                  color="primary"
                  size="large"
                  style={{ background: "#cda45e", color: "#fff" }}
                >
                  <EmailIcon />
                </IconButton>
                <Box>
                  <Typography variant="h6">Email:</Typography>
                  <Typography>chysellsusa@gmail.com</Typography>
                </Box>
              </Box>

              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <IconButton
                  color="primary"
                  size="large"
                  style={{ background: "#cda45e", color: "#fff" }}
                >
                  <PhoneIcon />
                </IconButton>
                <Box>
                  <Typography variant="h6">Call:</Typography>
                  <Typography>+1 6782347350</Typography>
                </Box>
              </Box>
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <form onSubmit={sendMail}>
              <TextField
                required
                value={formData.name}
                onChange={(e) => {
                  setFormData({
                    ...formData,
                    name: e.target.value,
                  });
                }}
                sx={{
                  width: "100%",
                  "& .MuiOutlinedInput-root": {
                    "& fieldset": {
                      borderColor: "#000",
                    },
                    "&:hover fieldset": {
                      borderColor: "#000",
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: "#000",
                    },
                  },
                  "& .MuiInputLabel-root": {
                    color: "#000",
                  },
                  "& .MuiInputBase-input": {
                    color: "#000",
                  },
                }}
                label="Your Name"
                variant="outlined"
                margin="normal"
              />
              <TextField
                required
                value={formData.email}
                onChange={(e) => {
                  setFormData({
                    ...formData,
                    email: e.target.value,
                  });
                }}
                type="email"
                sx={{
                  width: "100%",
                  "& .MuiOutlinedInput-root": {
                    "& fieldset": {
                      borderColor: "#000",
                    },
                    "&:hover fieldset": {
                      borderColor: "#000",
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: "#000",
                    },
                  },
                  "& .MuiInputLabel-root": {
                    color: "#000",
                  },
                  "& .MuiInputBase-input": {
                    color: "#000",
                  },
                }}
                label="Email"
                variant="outlined"
                margin="normal"
              />

              {/* <TextField
                fullWidth
                sx={{
                  "& .MuiOutlinedInput-root": {
                    "& fieldset": {
                      borderColor: "#000",
                    },
                    "&:hover fieldset": {
                      borderColor: "#000",
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: "#000",
                    },
                  },
                  "& .MuiInputLabel-root": {
                    color: "#000",
                  },
                  "& .MuiInputBase-input": {
                    color: "#000",
                  },
                }}
                label="Subject"
                variant="outlined"
                margin="normal"
              /> */}
              <TextField
                required
                value={formData.message}
                onChange={(e) => {
                  setFormData({
                    ...formData,
                    message: e.target.value,
                  });
                }}
                fullWidth
                multiline
                rows={4}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    "& fieldset": {
                      borderColor: "#000",
                    },
                    "&:hover fieldset": {
                      borderColor: "#000",
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: "#000",
                    },
                  },
                  "& .MuiInputLabel-root": {
                    color: "#000",
                  },
                  "& .MuiInputBase-input": {
                    color: "#000",
                  },
                }}
                label="Message"
                variant="outlined"
                margin="normal"
              />
              <Button
                type="submit"
                variant="contained"
                fullWidth
                color="secondary"
                style={{ background: "#f5a623", color: "white", marginTop: 20 }}
                size="large"
              >
                {loading ? <CircularProgress /> : "Send Message"}
              </Button>
            </form>
          </Grid>
        </Grid>
      </div>
    </Box>
  );
}
