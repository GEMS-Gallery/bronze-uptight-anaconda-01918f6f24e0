import React, { useState, useEffect } from 'react';
import { Container, Typography, TextField, Button, List, ListItem, ListItemText, CircularProgress } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import { backend } from '../../declarations/backend';

interface Status {
  id: bigint;
  text: string;
  timestamp: bigint;
  author: string;
}

const Home: React.FC = () => {
  const { principal } = useAuth();
  const [statusText, setStatusText] = useState('');
  const [statuses, setStatuses] = useState<Status[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (principal) {
      fetchStatuses();
    }
  }, [principal]);

  const fetchStatuses = async () => {
    if (principal) {
      setLoading(true);
      try {
        const feed = await backend.getStatusFeed(principal);
        setStatuses(feed);
      } catch (error) {
        console.error('Error fetching status feed:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  const handlePostStatus = async () => {
    if (statusText.trim() !== '' && principal) {
      setLoading(true);
      try {
        await backend.postStatus(statusText);
        setStatusText('');
        fetchStatuses();
      } catch (error) {
        console.error('Error posting status:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  if (!principal) {
    return <Typography>Please log in to view and post statuses.</Typography>;
  }

  return (
    <Container maxWidth="sm">
      <Typography variant="h4" component="h1" gutterBottom>
        Home
      </Typography>
      <TextField
        fullWidth
        multiline
        rows={3}
        variant="outlined"
        placeholder="What's on your mind?"
        value={statusText}
        onChange={(e) => setStatusText(e.target.value)}
        margin="normal"
      />
      <Button
        variant="contained"
        color="primary"
        onClick={handlePostStatus}
        disabled={loading}
      >
        Post Status
      </Button>
      {loading && <CircularProgress />}
      <List>
        {statuses.map((status) => (
          <ListItem key={status.id.toString()}>
            <ListItemText
              primary={status.text}
              secondary={`Posted by ${status.author} on ${new Date(Number(status.timestamp) / 1000000).toLocaleString()}`}
            />
          </ListItem>
        ))}
      </List>
    </Container>
  );
};

export default Home;
