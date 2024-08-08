import React, { useState, useEffect } from 'react';
import useWebSocket from 'react-use-websocket';
import { Line } from 'react-chartjs-2';

function App() {
  const [deviceData, setDeviceData] = useState({});
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: [
      {
        label: 'ECG Data',
        data: [],
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1,
      },
    ],
  });
  const { lastMessage } = useWebSocket('ws://localhost:3001');

useEffect(() => {
  if (lastMessage !== null) {
    // Assuming lastMessage.data is a JSON string
    const messageObj = JSON.parse(lastMessage.data);

    const deviceId = messageObj.deviceId;
    const ecgDataString = messageObj.value;
    console.log(deviceId, ecgDataString);
    const ecgData = parseFloat(ecgDataString); // Ensure ecgData is a number

    setDeviceData(prev => ({
      ...prev,
      [deviceId]: [...(prev[deviceId] || []), ecgData],
    }));

    // Update chart data directly using the new ecgData
    setChartData(prev => ({
      ...prev,
      labels: [...prev.labels, prev.labels.length + 1],
      datasets: prev.datasets.map(dataset => ({
        ...dataset,
        data: [...dataset.data, ecgData], // Use ecgData directly
      })),
    }));
  }
}, [lastMessage]);

  return (
    <div className="App">
      <header className="App-header">
        <h2>Kafka Messages</h2>
        <Line data={chartData} />
      </header>
    </div>
  );
}

export default App;