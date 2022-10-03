import React from "react";
import { Box, Button, Grid, Typography } from "@mui/material";
import CreationCardImg from "../../../assets/creation-card.png";
import EyeIcon from "../../../assets/svgs/eye.svg";
import LinkedInIcon from "../../../assets/linkedin.png";
import "./index.css";

function LitigationCard({
  interactionBtns,
  username = "jack 50",
  dateTime = "2022-01-01 00:00:00",
  link = "https://www.youtube.com/watch?v=2BjYPFBh4Zc",
  title = "Mobile App Design",
  imageUrl = CreationCardImg,
}) {
  return (
    <Grid
      container
      className="material-card"
      gap={{
        xs: "24px",
        md: "32px",
      }}
      maxWidth={{ xs: "300px", sm: "400px", md: "100%" }}
      minWidth={{ xs: "300px", sm: "400px", md: "100%" }}
      flexWrap={{ md: "nowrap" }}
    >
      <Grid
        item
        xs={12}
        md={6}
        display="flex"
        marginTop="auto"
        marginBottom="auto"
        flexDirection={{ xs: "column", lg: "row" }}
        gap={{ xs: "12px", sm: "12px", md: "16px" }}
        height="fit-content"
      >
        <img
          className="material-card-image"
          alt="material-card-hero"
          src={imageUrl}
        />
        <Box
          alignItems="flex-start"
          display="flex"
          flexDirection="column"
          justifyContent="center"
        >
          {title && (
            <Typography
              variant="h6"
              fontSize={{ xs: "18px", lg: "24px" }}
              marginBottom="5px"
              style={{ wordBreak: "break-word" }}
            >
              {title}
            </Typography>
          )}
          {link && (
            <Typography
              variant="a"
              component="a"
              href={link}
              style={{ wordBreak: "break-word" }}
            >
              {link}
            </Typography>
          )}
        </Box>
      </Grid>

      <Grid
        item
        xs={12}
        md={interactionBtns ? 5 : 6}
        display="flex"
        flexDirection={{ xs: "column", xl: "row" }}
        justifyContent="center"
        alignItems="center"
        gap={{ xs: "12px", sm: "12px", md: "16px" }}
        borderLeft={{ md: "1px solid #EEF0F3" }}
        paddingLeft={{ md: "12px" }}
        borderRight={{ md: interactionBtns ? "1px solid #EEF0F3" : "" }}
        paddingRight={{ md: interactionBtns ? "12px" : "" }}
      >
        <Button className="previewButton">
          <img src={EyeIcon} alt="" />
          Creation preview
        </Button>

        <Grid display="flex" gap="12px" alignItems="center" fontSize="18px">
          <img
            className="material-card-avatar"
            alt="avatar"
            src="https://s3-us-west-2.amazonaws.com/s.cdpn.io/156905/profile/profile-512.jpg?1530296477"
          />
          <span>
            By {username}{" "}
            <img width={20} height={20} src={LinkedInIcon} alt="" /> New poem
            for jack at {dateTime}
          </span>
        </Grid>
      </Grid>
    </Grid>
  );
}

export default LitigationCard;
