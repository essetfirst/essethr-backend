import React, { useState, ChangeEvent, FormEvent } from 'react';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';

interface AddCategoryProps {
  onAddCategory: (categoryName: string) => void;
}

const AddCategory: React.FC<AddCategoryProps> = ({ onAddCategory }) => {
  const [categoryName, setCategoryName] = useState<string>('');

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Perform any validation if needed
    // Then send the new category to the parent component
    onAddCategory(categoryName);
    setCategoryName('');
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setCategoryName(e.target.value);
  };

  return (
    <form onSubmit={handleSubmit}>
      <Box display="flex" alignItems="center">
        <TextField
          type="text"
          label="Category Name"
          value={categoryName}
          onChange={handleChange}
          variant="outlined"
          required
        />
        <Button type="submit" variant="contained" color="primary">
          Add Category
        </Button>
      </Box>
    </form>
  );
};

export default AddCategory;
