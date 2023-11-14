import { useProduct } from '../../hooks/useProduct'
import { useTheme } from '@mui/material/styles'
import AddAlertIcon from '@mui/icons-material/AddAlert';
import PageView from '../../components/PageView';
import LoadingComponent from '../../components/LoadingComponent';
import { Container } from '@mui/system';
import Grid from '@mui/material/Grid';
import AspectRatio from '@mui/joy/AspectRatio';
import Card from '@mui/joy/Card';
import Chip from '@mui/joy/Chip';
import Typography from '@mui/joy/Typography';
import { CssVarsProvider } from '@mui/joy/styles';
import { Link } from 'react-router-dom';


const StokeAlert = () => {
  const { stock, stockLoading, stockError } = useProduct();
  const theme = useTheme();

  if (stockLoading) {
    <PageView title="Stock Alert">
      <LoadingComponent />
    </PageView>
  }


  if (stockError) {
    <PageView title="Stock Alert">
      error
    </PageView>
  }

  return (
    <>
      <PageView title="Stock Alert" backPath='/report'>
        <Container sx={{ mb: 2 }} maxWidth="lg">
          <Grid container spacing={3} sx={{ mt: 2, mb: 1, width: '100%' }}>
            {stock?.IsStockAlert?.map((item: any) => (
              <Grid item lg={12} md={6} sm={6} xs={12} key={item._id}>
                <CssVarsProvider>
                  <Link to={`/app/products/${item._id}`} style={{ textDecoration: 'none' }}>
                    <Card
                      variant="outlined"
                      orientation="horizontal"
                      sx={{
                        width: 320,
                        gap: 2,
                        '&:hover': { boxShadow: 'md', borderColor: 'neutral.outlinedHoverBorder' },

                        backgroundColor: theme.palette.mode === 'dark' ? '#282c34' : '#fff',
                        border: '1px solid',
                        borderColor: theme.palette.mode === 'dark' ? '#1e1e1e' : '#e0e0e0',
                        borderRadius: 15,
                        boxShadow: '0 0 0 1px rgba(0,0,0,0.05)',
                      }}
                    >
                      <AspectRatio ratio="1" sx={{ width: 90 }}>
                        <img
                          src={item.image}
                          srcSet={`${item.image} 5x`}
                          loading="lazy"
                          alt={item.name}
                        />
                      </AspectRatio>
                      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%' }}>
                        <Typography  fontSize="xl" id="card-description" mb={0.9}>
                          <span style={{ color: theme.palette.mode === 'dark' ? '#fff' : '#000' }}>{item.name}</span>
                        </Typography>
                        <Typography fontSize="sm" aria-describedby="card-description" mb={1}>
                          <span style={{ color: theme.palette.mode === 'dark' ? '#fff' : '#2196f3' }}>Initially In Stock: {item.initialQuantity} items</span>
                        </Typography>
                        <Chip
                          variant="outlined"
                          color="info"
                          size="sm"
                        >
                          Stock Alert: {item.stockAlert}
                        </Chip>
                      </div>
                    </Card>
                  </Link>
                </CssVarsProvider>
              </Grid>
            ))}
          </Grid>
        </Container>
      </PageView>
    </>
  )

}

export default StokeAlert
