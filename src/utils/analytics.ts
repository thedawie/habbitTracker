export const trackPageView = async (page: string) => {
  try {
    await fetch('http://localhost:3001/track', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ page }),
    });
  } catch (error) {
    console.error('Error tracking page view:', error);
  }
};