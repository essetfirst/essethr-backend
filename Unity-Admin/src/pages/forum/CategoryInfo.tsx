import * as React from 'react';
import { styled } from '@mui/material/styles';
import { Grid, Card, CardContent, CardMedia, CardActions,Typography ,Button,TextField } from '@mui/material';
import { Box } from '@mui/system';
import { useTheme } from '@mui/material/styles';
import { useMediaQuery,Avatar } from '@mui/material';
import { Chip } from '@mui/joy';
import { CssVarsProvider } from '@mui/joy/styles';
import { useState } from 'react';
import axios from 'axios';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';

const api = import.meta.env.VITE_API_URL;
const url = `${api}`;

//Heders for the request
const token = localStorage.getItem("token");

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




const CategoryInfo = ({ category }: any) => {
    const theme = useTheme();
    const images = [category?.imageUrl1, category?.imageUrl2, category?.imageUrl3];
    const [replyIndex, setReplyIndex] = useState<number | null>(null);
    const [replyTextAdmin, setReplyTextAdmin] = useState('');
    const [replyText, setReplyText] = useState('');
    const [userDetail, setUserDetail] = useState({reply:[],forum:[],answer:[],like:[]});
  console.log(" Category ")
  const handleReplyClick = (index: number) => {
    setReplyIndex(index);
  };

  const handleCancelReply = () => {
    setReplyIndex(null);
    setReplyText('');
  };
  
  const handleReplyAdminSubmit = async (forumId: string) => {
      try {
          const dat = { forumId, content: replyTextAdmin }
          console.log(" Data ", dat,`${url}forum/answer`);    
      const response = await axios.post(`${url}forum/answer/`,dat, {
            headers: {
                "Content-Type": "application/json",
                "authtoken": `${token}`,
            },
        });
      console.log(' Reply As Admin sent:', response?.data);
      setReplyTextAdmin('');
    } catch (error) {
      console.error('Error sending reply:', error);
    }
    };
    const handleUserDetailsClick = async (userId: string) => {
    try {
        const response = await axios.get(`${url}forum/detail/${userId}`);
        console.log(" Response ", response.data.result," User Id ",userId);
      setUserDetail(response?.data?.result);
     } catch (error) {
      console.error('Error fetching user details:', error);
    }
  };

  const handleReplySubmit = async (forumId: string) => {
      try {
          const dat = { forumAnswerId:forumId, content: replyText }
          console.log(" Data ", dat,`${url}forum/reply/answer`);    
          const response = await axios.post(`${url}forum/reply/answer/`,dat, {
            headers: {
                "Content-Type": "application/json",
                "authtoken": `${token}`,
            },
        });
      console.log(' Reply sent :', response?.data);
      setReplyText('');
    } catch (error) {
      console.error('Error sending reply:', error);
    }
  };

    console.log(" Selected  Item : ", category);
    // console.log(" Product Info - ",product.user)
    return (
        <Grid container spacing={2}>

            <Grid item xs={12} md={12}>
                <Grid container spacing={2}>
                    <Grid item xs={12} md={12}>
                        <Item>
                        <Typography fontWeight="fontWeightBold" m={1}>Explain this under Topic  # {category?.forum_topic?.name} </Typography>
                            <Typography fontWeight="fontWeightBold" m={1}>  By  # {category?.user?.name}        
                               <br></br> Date:  {`${new Date(category?.createdAt)}`.slice(0, 25)} </Typography>

                            
                            <Typography variant="body1" color={theme.palette.mode === 'dark' ? '#fff' : 'text.primary'}>
                                <Box fontWeight="fontWeightBold" m={1}>
                                    Images:
                                </Box>
                            </Typography>
                            <Typography  color={theme.palette.mode === 'dark' ? '#fff' : 'text.primary'}>
                                <div >
                        {category && images.map((imageUrl:any, index:number) => (
                                 <a href={imageUrl} target="_blank">
                                   <img src={imageUrl} alt={`Image ${index + 1}`} width="150" height="150" />
                                 </a>
                            )) || " No Image "}
                        </div>      

                            </Typography>
                            <Typography variant="body1" color={theme.palette.mode === 'dark' ? '#fff' : 'text.primary'}>
                                <Box fontWeight="fontWeightBold" m={1}>
                                    Thread Title:
                                </Box>
                            </Typography>
                            <Typography variant="body2" color={theme.palette.mode === 'dark' ? '#fff' : 'text.primary'}>
                                <Box fontWeight="fontWeightBold" m={1}>
                                    {category && " "+category.title}
                                </Box>
                            </Typography>
                
                            <Typography variant="body1" color={theme.palette.mode === 'dark' ? '#fff' : 'text.primary'}>
                                <Box fontWeight="fontWeightBold" m={1}>
                                    Description:
                                </Box>
                            </Typography>
                            <Typography variant="body2" color={theme.palette.mode === 'dark' ? '#fff' : 'text.primary'}>
                                <Box fontWeight="fontWeightBold" m={1}>
                                    {category && category?.description}
                                </Box>
                            </Typography>

                            <Typography variant="body1" color={theme.palette.mode === 'dark' ? '#fff' : 'text.primary'}>
                                <Box fontWeight="fontWeightBold" m={1}>
                                    Topic:
                                </Box>
                            </Typography>
                            <Typography variant="body2" color={theme.palette.mode === 'dark' ? '#fff' : 'text.primary'}>
                                <Box fontWeight="fontWeightBold" m={1}>
                                    {category && category?.forum_topic?.name || "--"}
                                </Box>
                            </Typography>
                        </Item>
                    </Grid>
                
   
      <Grid item xs={12} md={12}>
                        <Item>
                            <Typography fontWeight="fontWeightBold" m={1}># {category?.forum_answers?.length}  Answers</Typography>
        <div>
    {category?.forum_answers ?.map((answer: any, index: number) => (
        <Card key={index} variant="outlined" style={{ margin: '15px', padding: '15px' }} >
          <Grid container spacing={2}>
            <Grid item xs={1}>
              <Avatar onClick={() => handleUserDetailsClick(answer?.user?.id)}></Avatar>
              <Typography variant="caption">{answer?.user?.name}</Typography>
            </Grid>
            <Grid item xs={9}>
              <CardContent>
                <Typography>{answer.content}</Typography>
                {replyIndex === index && (
                              <>
                <TextField
                    label="Reply"
                    multiline
                    rows={2}
                    fullWidth
                    style={{ marginTop: '10px' }}
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                />
                <Button size="small" onClick={() => handleReplySubmit(answer?.id)}>
                    Reply
                  </Button>
                    </>
                )}
                    
                  
              </CardContent>
            </Grid>
            <Grid item xs={1}>
              <CardActions>
                {replyIndex !== index ? (
                  <Button size="small" onClick={() => handleReplyClick(index)}>
                    Reply
                  </Button>
                ) : (
                  <div>
                    <Button size="small" onClick={handleCancelReply}>
                      Cancel
                    </Button>
                  </div>
                )}
                <Button size="small" style={{ color: 'red' }}>
                  Remove
                </Button>
              </CardActions>
            </Grid>
          </Grid>
            <Typography variant="caption" align="right"> {`${new Date(answer?.createdAt)}`.slice(0, 25)}</Typography>
            { answer?.forum_replies?.length > 0 && <Typography> {answer?.forum_replies?.length} Replies</Typography>}
            {answer?.forum_replies?.map((reply: any, index: number) => (
        <Card key={index} variant="outlined" style={{ margin: '10px', padding: '5px' }} >
          <Grid container spacing={2}>
            <Grid item xs={1}>
              <Avatar onClick={() => handleUserDetailsClick(reply?.user?.id)}></Avatar>
              <Typography variant="caption">{reply?.user?.name}</Typography>
            </Grid>
            <Grid item xs={9}>
              <CardContent>
                                <Typography>{reply.content}</Typography>
                                </CardContent>
            </Grid>
                    </Grid>
                    <Typography variant="caption" align="right"> {`${new Date(reply?.createdAt)}`.slice(0, 25)}  {! reply?.isLiked && <FavoriteIcon />}</Typography>

            </Card>

             ))}
                
            
                    </Card>
                    ))}
                    
            <div>
                <TextField
                    label="Reply as admin"
                    multiline
                    rows={2}
                    fullWidth
                    style={{ marginTop: '10px' }}
                    value={replyTextAdmin}
                    onChange={(e) => setReplyTextAdmin(e.target.value)}
                   sx={{ width: '70%', marginTop: '10px' }}
                />
                <Button size="small"  onClick={() => handleReplyAdminSubmit(category?.id)}>
                    Reply as Admin
                  </Button>
            </div>
    </div>
                        </Item>
                    </Grid>
                </Grid>   
                <Grid item xs={12} md={12}>
                    { userDetail &&
                    <Item>
                        <Typography fontWeight="fontWeightBold" m={1}>#   User  Details</Typography>
                            <Typography variant="body1" color={theme.palette.mode === 'dark' ? '#fff' : 'text.primary'}>
                                <Box fontWeight="fontWeightBold" m={1}>
                                   # {userDetail?.forum?.length || 0} Questions: 
                                </Box>
                            </Typography>
                            <Typography variant="body2" color={theme.palette.mode === 'dark' ? '#fff' : 'text.primary'}>
                                <Box fontWeight="fontWeightBold" m={1}>
                                    {userDetail?.forum?.map((forum: any) => (
                                        <>
                                        <Typography  m={1}>#<b>Title</b>  - {forum?.title}   #<b>Topic</b> - {forum?.forum_topic?.name}</Typography>
                                        <Typography>  #<b>Date</b> {forum?.createdAt?.split("T")[0]}  {forum?.createdAt?.split("T")[1]}</Typography>
                                        </>
                                    ))}
                                </Box>
                            </Typography>
                            <Typography variant="body1" color={theme.palette.mode === 'dark' ? '#fff' : 'text.primary'}>
                                <Box fontWeight="fontWeightBold" m={1}>
                                   # {userDetail?.answer?.length || 0} Answers: 
                                </Box>
                            </Typography>
                            <Typography variant="body2" color={theme.palette.mode === 'dark' ? '#fff' : 'text.primary'}>
                                <Box fontWeight="fontWeightBold" m={1}>
                                    {userDetail?.answer?.map((forum: any) => (
                                        <>
                                                <Typography  m={1}>#<b>Answer</b>  - {forum?.content}   ON #<b>Forum</b> - {forum?.forum?.title}</Typography>
                                        <Typography>  #<b>Date</b> {forum?.createdAt?.split("T")[0]}  {forum?.createdAt?.split("T")[1]}</Typography>
                                        </>

                                    ))}
                                </Box>
                            </Typography>
                            <Typography variant="body1" color={theme.palette.mode === 'dark' ? '#fff' : 'text.primary'}>
                                <Box fontWeight="fontWeightBold" m={1}>
                                   # {userDetail?.like?.length || 0} Likes: 
                                </Box>
                            </Typography>
                            <Typography variant="body1" color={theme.palette.mode === 'dark' ? '#fff' : 'text.primary'}>
                                <Box fontWeight="fontWeightBold" m={1}>
                                   # {userDetail?.reply?.length || 0} Reply: 
                                </Box>
                            </Typography>
                            <Typography variant="body2" color={theme.palette.mode === 'dark' ? '#fff' : 'text.primary'}>
                                <Box fontWeight="fontWeightBold" m={1}>
                                    {userDetail?.reply?.map((forum: any) => (
                                        <>
                                        <Typography m={1}>#<b>Reply</b>  - {forum?.content}   #<b>Answer</b> - {forum?.forum_answer?.content}</Typography>
                                        <Typography>  #<b>Date</b> {forum?.createdAt?.split("T")[0]}  {forum?.createdAt?.split("T")[1]}</Typography>
                                        </>
                                    ))}
                                </Box>
                            </Typography>
                        </Item>
                    }
                </Grid>
                <br></br>
                    <Grid item xs={12} md={12}>
                        <Item>
                            <Typography fontWeight="fontWeightBold" m={1}>#   Asker  Details</Typography>
                            <Typography variant="body1" color={theme.palette.mode === 'dark' ? '#fff' : 'text.primary'}>
                                <Box fontWeight="fontWeightBold" m={1}>
                                    Full Name:
                                </Box>
                            </Typography>
                            <Typography variant="body2" color={theme.palette.mode === 'dark' ? '#fff' : 'text.primary'}>
                                <Box fontWeight="fontWeightBold" m={1}>
                                    {category && category?.user?.name}
                                </Box>
                            </Typography>
                            <Typography variant="body1" color={theme.palette.mode === 'dark' ? '#fff' : 'text.primary'}>
                                <Box fontWeight="fontWeightBold" m={1}>
                                    Phone Number:
                                </Box>
                            </Typography>
                            <Typography variant="body2" color={theme.palette.mode === 'dark' ? '#fff' : 'text.primary'}>
                                <Box fontWeight="fontWeightBold" m={1}>
                                    {category && category?.user?.phoneNumber}
                                </Box>
                           </Typography>
                
                            <Typography variant="body1" color={theme.palette.mode === 'dark' ? '#fff' : 'text.primary'}>
                                <Box fontWeight="fontWeightBold" m={1}>
                                    State:
                                </Box>
                            </Typography>
                            <Typography variant="body2" color={theme.palette.mode === 'dark' ? '#fff' : 'text.primary'}>
                                <Box fontWeight="fontWeightBold" m={1}>
                                    {category && category?.user?.state}
                                </Box>
                            </Typography>
                            <Typography variant="body1" color={theme.palette.mode === 'dark' ? '#fff' : 'text.primary'}>
                                <Box fontWeight="fontWeightBold" m={1}>
                                    Area:
                                </Box>
                            </Typography>
                            <Typography variant="body2" color={theme.palette.mode === 'dark' ? '#fff' : 'text.primary'}>
                                <Box fontWeight="fontWeightBold" m={1}>
                                    {category && category?.user?.area}
                                </Box>
                            </Typography>
                        </Item>
                    </Grid>
                </Grid>
            </Grid>
        // </Grid>
    )
}

export default CategoryInfo