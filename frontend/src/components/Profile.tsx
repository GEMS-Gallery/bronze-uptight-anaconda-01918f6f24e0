import React, { useState, useEffect } from 'react';
import { Container, Typography, TextField, Button, CircularProgress } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import { backend } from '../../declarations/backend';

interface User {
  id: string;
  name: string;
  bio: string | null;
  connections: string[];
}

const Profile: React.FC = () => {
  const { principal } = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (principal) {
      fetchUserProfile();
    }
  }, [principal]);

  const fetchUserProfile = async () => {
    if (principal) {
      setLoading(true);
      try {
        const userProfile = await backend.getUser(principal);
        if (userProfile) {
          setUser(userProfile);
          setName(userProfile.name);
          setBio(userProfile.bio || '');
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleUpdateProfile = async () => {
    if (principal) {
      setLoading(true);
      try {
        await backend.updateUser(name, bio ? [bio] : []);
        fetchUserProfile();
      } catch (error) {
        console.error('Error updating profile:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  if (!principal) {
    return <Typography>Please log in to view and edit your profile.</Typography>;
  }

  if (!user) {
    return <CircularProgress />;
  }

  return (
    <Container maxWidth="sm">
      <Typography variant="h4" component="h1" gutterBottom>
        Profile
      </Typography>
      <TextField
        fullWidth
        label="Name"
        variant="outlined"
        value={name}
        onChange={(e) => setName(e.target.value)}
        margin="normal"
      />
      <TextField
        fullWidth
        label="Bio"
        variant="outlined"
        value={bio}
        onChange={(e) => setBio(e.target.value)}
        margin="normal"
        multiline
        rows={3}
      />
      <Button
        variant="contained"
        color="primary"
        onClick={handleUpdateProfile}
        disabled={loading}
      >
        Update Profile
      </Button>
      {loading && <CircularProgress />}
    </Container>
  );
};

export default Profile;
