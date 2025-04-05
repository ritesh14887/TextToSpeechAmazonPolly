import { useState, useEffect, useRef } from 'react';
import './App.css';
import { Header } from './components/header';
import AWS from 'aws-sdk';
import JsZip from 'jszip';
import FileSaver from 'file-saver';

import Papa from 'papaparse';

AWS.config.update({
  accessKeyId: process.env.REACT_APP_ACCESS_KEY_ID,
  secretAccessKey: process.env.REACT_APP_SECRET_ACCESS_KEY,
  region: process.env.REACT_APP_REGION

});

function App() {
  const [csvData, setCsvData] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [serverResponses, setServerResponses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const blobs = [];

  const inputFileRef = useRef();

  const reset = () => {
    inputFileRef.current.value = "";
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    Papa.parse(file, {
      header: true,
      complete: (results) => {
        setCsvData(results.data);
      },
    });
  };
  useEffect(() => {
    if (csvData.length > 0 && currentIndex < csvData.length) {
      console.log('Sending data to server:', csvData[currentIndex]?.Filename);
      sendDataToServer(csvData[currentIndex]);
    }
  }, [csvData, currentIndex]);

  const sendDataToServer = async (record) => {
    const polly = new AWS.Polly();
    const params = {
      Engine: "standard",
      OutputFormat: 'mp3',
      Text: record.Text,
      VoiceId: record.VoiceId,
    };


    try {
      await polly.synthesizeSpeech(params, (err, data) => {
        if (err) {
          console.log(err);
          setError(err.code);
          reset()
        } else {
          const uInt8Array = new Uint8Array(data.AudioStream);
          const arrayBuffer = uInt8Array.buffer;
          const blob = new Blob([arrayBuffer]);
          blobs.push(blob);
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          document.body.appendChild(a);

          a.href = url;
          a.download = record.Filename + '.mp3';
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
          reset()
        }
        setServerResponses((prevResponses) => [...prevResponses, record.Filename + '.mp3']);
      });
      setCurrentIndex((prevIndex) => prevIndex + 1);
    } catch (err) {
      setError(err);
      setLoading(false); // Stop processing on error.
    }
  };

  const exportZip = blobs => {
    const zip = JsZip();
    blobs.forEach((blob, i) => {
      zip.file(`file-${i}.csv`, blob);
    });
    zip.generateAsync({ type: 'blob' }).then(zipFile => {
      const currentDate = new Date().getTime();
      const fileName = `combined-${currentDate}.zip`;
      return FileSaver.saveAs(zipFile, fileName);
    });
  }

  console.log('Server responses:', serverResponses);

  return (
    <div className="App">
      <Header />
      <section className="container text-gray-600 body-font p-12 text-black">
        <div href="#" className="block p-6 bg-white border border-gray-200 rounded-lg shadow-sm w-[600px] h-[300px] mx-auto text-black">

          <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white text-left" for="file_input">Upload file</label>
          <input className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 dark:text-gray-400 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400"
            aria-describedby="file_input_help"
            id="file_input"
            type="file"
            accept='.csv'
            onChange={handleFileUpload}
            ref={inputFileRef}
          />
          <label className="block mb-2 text-sm font-medium text-orange-400 text-left" for="file_input">Select the CSV file, ensure no empty rows!</label>
          {serverResponses.length > 0 && (
            <div className='text-left text-sm'>
              <h3 className="text-black font-bold">Current Status</h3>
              <ul className='h-[30px] overflow-y-[scroll] text-sm text-gray-900 dark:text-white'>
                {serverResponses.map((item, index) => (
                  <li key={index}>{item} &#x2705;</li>
                ))}
              </ul>
            </div>
          )}
          {currentIndex < csvData.length && (
            <div className="text-black">Processing record {currentIndex + 1}: {csvData[currentIndex]?.Filename} of {csvData.length}...</div>
          )}


          {currentIndex > csvData.length && (
            <div className="text-black">All records processed.</div>
          )}
          {loading && <div>Loading CSV data...</div>}
          {error && <div className='text-red-500 text-left'>Error: {error}</div>}

        </div>

      </section>
    </div >
  );
}

export default App;
