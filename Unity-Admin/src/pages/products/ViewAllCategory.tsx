import React, { useEffect, useState } from 'react';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
const api = import.meta.env.VITE_API_URL;
const url = `${api}topic`;

interface Category {
  id: number;
  name: string;
}

const ViewAllCategories: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  useEffect(() => {
    // Fetch all categories from the backend API
    // Replace 'YOUR_BACKEND_API_ENDPOINT' with the actual API endpoint
    fetch(url)
      .then((response) => response.json())
      .then((data) => setCategories(data?.result))
      .catch((error) => console.log('Error fetching categories:', error));
  }, []);

  return (
    <div>
       
      <Grid container spacing={2}>
        {categories?.map((category) => (
          <Grid item xs={2} key={category?.id}>
            <Typography variant="body1">{category.name}</Typography>
          </Grid>
        ))}
      </Grid>
    </div>
  );
};

export default ViewAllCategories;
