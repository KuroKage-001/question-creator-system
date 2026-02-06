const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

export const fetchBatches = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/batches`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching batches:', error);
    throw error;
  }
};

export const fetchQuestions = async (batchId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/questions/${batchId}`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching questions:', error);
    throw error;
  }
};

export const saveBatch = async (title, questions) => {
  try {
    const response = await fetch(`${API_BASE_URL}/save-batch`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ title, questions }),
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error saving batch:', error);
    throw error;
  }
};
