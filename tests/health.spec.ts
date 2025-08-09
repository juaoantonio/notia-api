it('Check health status', async () => {
  const response = await fetch('http://localhost:3000/health');
  const data = await response.json();
  expect(data).toEqual({
    status: 'ok',
    timestamp: expect.any(String),
  });
});
