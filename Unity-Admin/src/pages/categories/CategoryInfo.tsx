import * as React from 'react';
import { styled } from '@mui/material/styles';
import { Grid, Card, CardContent, CardMedia, Typography } from '@mui/material';
import { Box } from '@mui/system';
import { useTheme } from '@mui/material/styles';
import { useMediaQuery } from '@mui/material';
import { Chip } from '@mui/joy';
import { CssVarsProvider } from '@mui/joy/styles';

const Item = styled(Card)(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    boxShadow: 'none',
    borderRadius: 0,
    '&:hover': {
        boxShadow: '0 4px 20px 0 rgba(0,0,0,0.12)',
    },
}));

const ItemMedia = styled(CardMedia)(({ theme }) => ({
    height: 300,
    backgroundSize: 'fit',

}));

const formatDateToHumanReadable = (date:Date)=> {
  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const monthsOfYear = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  const dayOfWeekName = daysOfWeek[date.getDay()];
  const monthName = monthsOfYear[date.getMonth()];
  const day = date.getDate();
  const year = date.getFullYear();
  let hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, '0');

  let amOrPm = 'am';
  if (hours >= 12) {
    amOrPm = 'pm';
    hours %= 12;
  }
  if (hours === 0) {
    hours = 12;
  }

  return `${dayOfWeekName} ${monthName} ${day} ${year} ${hours}:${minutes}${amOrPm}`;
}


const CategoryInfo = ({ category }: any) => {
    const dateForm  = formatDateToHumanReadable(new Date(category?.createdAt));
  const theme = useTheme();
    console.log(" Selected  News : ", category);
    const news = category?.description?.split(".")
    // console.log(" Product Info - ",product.user)
    return (
      <Grid container spacing={2}>
        <Grid item xs={12} md={12}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={12}>
              <Item>
                <Typography
                  variant="body2"
                  color={
                    theme.palette.mode === "dark" ? "#fff" : "text.primary"
                  }
                >
                  <Box fontWeight="fontWeightBold" m={1}>
                    {category && category?.title}
                  </Box>
                </Typography>
                <div>
                  <a href={category?.thumbnail}>
                    <img
                      src={category?.thumbnail}
                      width="300"
                      height="300"
                      alt="News Image"
                    ></img>
                  </a>
                </div>
                <Typography>{dateForm}</Typography>
                <Typography
                  variant="body1"
                  color={
                    theme.palette.mode === "dark" ? "#fff" : "text.primary"
                  }
                >
                  <Box fontWeight="fontWeightBold" m={1}></Box>
                </Typography>
                <Typography
                  variant="body2"
                  color={
                    theme.palette.mode === "dark" ? "#fff" : "text.primary"
                  }
                >
                  <Box fontWeight="fontWeightBold" m={1}>
                    <Typography
                      variant="body2"
                      color="textPrimary"
                      fontWeight={"bold"}
                      gutterBottom
                      dangerouslySetInnerHTML={{
                        __html: category?.description,
                      }}
                    />
                  </Box>
                </Typography>
              </Item>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    );
}

export default CategoryInfo